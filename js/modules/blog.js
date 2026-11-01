import { getBlog } from './data-loader.js';
import { blogCard, blogIndexMarkup, blogArticleMarkup } from './blog-markup.js';
import { filterBlogPosts, blogPostUrl, BLOG_PAGE_SIZE, paginateBlogPosts } from '../utils/blog.js';
import { initBlogSearch } from './blog-search.js';
import { setMeta } from './seo.js';
import { h } from '../utils/dom.js';

export async function init({ site }) {
  const root = document.querySelector('#blog-root');
  try {
    const data = await getBlog();
    if (document.body.dataset.page === 'article') {
      const slug = location.pathname.match(/\/blog\/([a-z0-9-]+)(?:\/(?:index\.html)?)?$/)?.[1] || new URLSearchParams(location.search).get('slug') || '';
      const post = data.posts.find((p) => p.slug === slug);
      if (!post) {
        root.replaceChildren(h('div', { class: 'state blog-not-found' }, h('h1', { text: 'We couldn’t find that story' }), h('p', { text: 'It may have moved or is no longer published. Find something fresh in the journal.' }), h('a', { class: 'btn btn--primary', href: 'blog.html', text: 'Back to the blog' })));
        setMeta({ title: 'Story not found · Crumb & Oven', noindex: true });
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
      root.querySelector('#blog-empty').hidden = page.total !== 0;
      count.textContent = `Showing ${page.visiblePosts.length} of ${page.total} ${page.total === 1 ? 'article' : 'articles'}${category ? ` in ${data.categories.find((c) => c.slug === category).name}` : ''}${query ? ` for “${query}”` : ''}`;
      pagination.hidden = page.total <= BLOG_PAGE_SIZE;
      loadMore.hidden = !page.hasMore;
      progress.textContent = page.hasMore ? `You’ve seen ${page.visiblePosts.length} of ${page.total} stories.` : `You’re all caught up — ${page.total} stories.`;
      reset.hidden = !category && !query;
      for (const chip of chips) chip.setAttribute('aria-pressed', String(chip.dataset.blogCategory === category));
      if (persist) {
        const url = new URL(location.href);
        for (const [name, value] of [['q', query], ['category', category]]) {
          if (value) url.searchParams.set(name, value); else url.searchParams.delete(name);
        }
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
      loadMore.hidden = !page.hasMore;
      progress.textContent = page.hasMore ? `You’ve seen ${page.visiblePosts.length} of ${page.total} stories.` : `You’re all caught up — ${page.total} stories.`;
      count.textContent = `Showing ${page.visiblePosts.length} of ${page.total} articles${category ? ` in ${data.categories.find((c) => c.slug === category).name}` : ''}${search.value.trim() ? ` for “${search.value.trim()}”` : ''}`;
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
      if (document.body.dataset.page === 'blog') root.prepend(h('p', { class: 'demo-note', text: 'Search is temporarily unavailable. You can still browse the stories below.' }));
    } else {
      root.replaceChildren(h('div', { class: 'state state--error' }, h(document.body.dataset.page === 'article' ? 'h1' : 'h2', { text: 'The journal couldn’t load' }), h('p', { text: 'Please check your connection and try again.' }), h('button', { type: 'button', class: 'btn btn--primary', text: 'Try again', onclick: () => init({ site }) })));
    }
  }
}
