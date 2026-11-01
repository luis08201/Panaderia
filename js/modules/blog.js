import { getBlog } from './data-loader.js';
import { blogCard, blogIndexMarkup, blogArticleMarkup } from './blog-markup.js';
import { filterBlogPosts, blogPostUrl } from '../utils/blog.js';
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
    const params = new URLSearchParams(location.search);
    let category = data.categories.some((c) => c.slug === params.get('category')) ? params.get('category') : '';
    search.value = params.get('q') || '';
    const chips = [...root.querySelectorAll('[data-blog-category]')];
    const update = ({ persist = true } = {}) => {
      const query = search.value.trim();
      const filtered = filterBlogPosts(data.posts, { category, query });
      grid.innerHTML = filtered.map((post) => blogCard(post)).join('');
      root.querySelector('#blog-empty').hidden = filtered.length !== 0;
      count.textContent = `${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'}${category ? ` in ${data.categories.find((c) => c.slug === category).name}` : ''}${query ? ` for “${query}”` : ''}`;
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
    let timer;
    search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 150); });
    for (const chip of chips) chip.addEventListener('click', () => { clearTimeout(timer); category = chip.dataset.blogCategory; update(); });
    for (const button of root.querySelectorAll('#blog-reset, [data-blog-reset]')) button.addEventListener('click', () => { clearTimeout(timer); category = ''; search.value = ''; update(); search.focus(); });
    window.addEventListener('popstate', () => {
      const p = new URLSearchParams(location.search);
      category = data.categories.some((c) => c.slug === p.get('category')) ? p.get('category') : '';
      search.value = p.get('q') || '';
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
