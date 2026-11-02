import { t } from '../i18n.js';
import { withLang } from '../locale-data.js';
import { getBlog } from './data-loader.js';
import { blogCard, blogIndexMarkup, blogArticleMarkup } from './blog-markup.js';
import { filterBlogPosts, blogPostUrl, BLOG_PAGE_SIZE, paginateBlogPosts } from '../utils/blog.js';
import { initBlogSearch } from './blog-search.js';
import { setMeta } from './seo.js';
import { h } from '../utils/dom.js';
import { animateResults } from '../utils/animation.js';

export async function init({ site }) {
  const root = document.querySelector('#blog-root');
  try {
    const data = await getBlog();
    if (document.body.dataset.page === 'article') {
      const slug = location.pathname.match(/\/blog\/([a-z0-9-]+)(?:\/(?:index\.html)?)?$/)?.[1] || new URLSearchParams(location.search).get('slug') || '';
      const post = data.posts.find((p) => p.slug === slug);
      if (!post) {
        root.replaceChildren(h('div', { class: 'state blog-not-found' }, h('h1', { text: t('blog.missingTitle') }), h('p', { text: t('blog.missingText') }), h('a', { class: 'btn btn--primary', href: 'blog.html', text: t('blog.backBlog') })));
        setMeta({ title: `${t('blog.missingMeta')} · Crumb & Oven`, noindex: true });
        return;
      }
      root.innerHTML = blogArticleMarkup(post, data.posts);
      setMeta({ title: `${post.seoTitle || post.title} · ${site?.settings.businessName || 'Crumb & Oven'}`, description: post.seoDescription || post.excerpt, image: post.image?.src, path: blogPostUrl(post), siteUrl: site?.settings.seo?.siteUrl });
      document.querySelector('[data-blog-current]')?.replaceChildren(post.title);
      return;
    }
    root.innerHTML = blogIndexMarkup(data);
    root.querySelector('#blog-tools').hidden = false;
    const search = root.querySelector('#blog-search');
    const count = root.querySelector('#blog-count');
    const grid = root.querySelector('#blog-posts');
    const reset = root.querySelector('#blog-reset');
    const pagination = root.querySelector('#blog-pagination');
    const loadMore = root.querySelector('#blog-load-more');
    const progress = root.querySelector('#blog-page-progress');
    const params = new URLSearchParams(location.search);
    let category = data.categories.some((c) => c.slug === params.get('category')) ? params.get('category') : '';
    search.value = params.get('q') || '';
    let visibleCount = BLOG_PAGE_SIZE;
    let matching = [];
    const chips = [...root.querySelectorAll('[data-blog-category]')];
    const update = ({ persist = true } = {}) => {
      const query = search.value.trim();
      matching = filterBlogPosts(data.posts, { category, query });
      const page = paginateBlogPosts(matching, visibleCount);
      grid.innerHTML = page.visiblePosts.map((post) => blogCard(post)).join('');
      animateResults(grid);
      root.querySelector('#blog-empty').hidden = page.total !== 0;
      const categoryName = category ? data.categories.find((c) => c.slug === category).name : '';
      count.textContent = t('blog.showing', { shown: page.visiblePosts.length, total: page.total, word: page.total === 1 ? t('blog.article') : t('blog.articles'), where: categoryName ? t('blog.in', { name: categoryName }) : '', query: query ? t('blog.for', { query }) : '' });
      pagination.hidden = page.total <= BLOG_PAGE_SIZE;
      loadMore.hidden = !page.hasMore;
      progress.textContent = page.hasMore ? t('blog.seen', { shown: page.visiblePosts.length, total: page.total }) : t('blog.caught', { total: page.total });
      reset.hidden = !category && !query;
      for (const chip of chips) chip.setAttribute('aria-pressed', String(chip.dataset.blogCategory === category));
      if (persist) {
        const url = new URL(location.href);
        for (const [name, value] of [['q', query], ['category', category]]) {
          if (value) url.searchParams.set(name, value); else url.searchParams.delete(name);
        }
        withLang(url.searchParams);
        history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      }
    };
    const restart = () => { visibleCount = BLOG_PAGE_SIZE; update(); };
    const searchUI = initBlogSearch(root, { posts: data.posts, getCategory: () => category, onChange: restart, onSubmit: restart });
    for (const chip of chips) chip.addEventListener('click', () => { category = chip.dataset.blogCategory; searchUI.refresh(); restart(); });
    for (const button of root.querySelectorAll('#blog-reset, [data-blog-reset]')) button.addEventListener('click', () => { category = ''; search.value = ''; searchUI.sync(); restart(); search.focus(); });
    loadMore.addEventListener('click', () => {
      const previousLength = grid.querySelectorAll('article').length;
      visibleCount += BLOG_PAGE_SIZE;
      const page = paginateBlogPosts(matching, visibleCount);
      grid.insertAdjacentHTML('beforeend', page.visiblePosts.slice(previousLength).map((post) => blogCard(post)).join(''));
      animateResults(grid, [...grid.children].slice(previousLength));
      loadMore.hidden = !page.hasMore;
      progress.textContent = page.hasMore ? t('blog.seen', { shown: page.visiblePosts.length, total: page.total }) : t('blog.caught', { total: page.total });
      count.textContent = t('blog.showing', { shown: page.visiblePosts.length, total: page.total, word: t('blog.articles'), where: category ? t('blog.in', { name: data.categories.find((c) => c.slug === category).name }) : '', query: search.value.trim() ? t('blog.for', { query: search.value.trim() }) : '' });
      grid.querySelectorAll('article')[previousLength]?.querySelector('h3 a')?.focus({ preventScroll: true });
    });
    window.addEventListener('popstate', () => {
      const p = new URLSearchParams(location.search);
      category = data.categories.some((c) => c.slug === p.get('category')) ? p.get('category') : '';
      search.value = p.get('q') || '';
      visibleCount = BLOG_PAGE_SIZE;
      searchUI.sync();
      update({ persist: false });
    });
    update({ persist: false });
  } catch (error) {
    console.warn('Blog data unavailable:', error);
    if (root.hasAttribute('data-static-blog')) {
      root.querySelector('#blog-tools')?.setAttribute('hidden', '');
      if (document.body.dataset.page === 'blog') root.prepend(h('p', { class: 'demo-note', text: t('blog.searchDown') }));
    } else {
      root.replaceChildren(h('div', { class: 'state state--error' }, h(document.body.dataset.page === 'article' ? 'h1' : 'h2', { text: t('blog.loadErrorTitle') }), h('p', { text: t('blog.loadErrorText') }), h('button', { type: 'button', class: 'btn btn--primary', text: t('error.retry'), onclick: () => init({ site }) })));
    }
  }
}
