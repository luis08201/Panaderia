import { t } from '../i18n.js';
import { localeTag } from '../locale-data.js';

export const blogPostUrl = (post) => `blog/${encodeURIComponent(post.slug)}/`;
export const BLOG_PAGE_SIZE = 6;
export function paginateBlogPosts(posts, visibleCount = BLOG_PAGE_SIZE) {
  const limit = Number.isFinite(visibleCount) ? Math.max(BLOG_PAGE_SIZE, Math.floor(visibleCount)) : BLOG_PAGE_SIZE;
  const visiblePosts = posts.slice(0, limit);
  return { visiblePosts, total: posts.length, hasMore: visiblePosts.length < posts.length };
}
export const normalizeBlogQuery = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
export function filterBlogPosts(posts, { category = '', query = '' } = {}) {
  const terms = normalizeBlogQuery(query).split(' ').filter(Boolean);
  return posts.filter((post) => (!category || post.category.slug === category) && terms.every((term) => normalizeBlogQuery([post.title, post.excerpt, post.category.name, post.introduction, ...post.sections.map((s) => `${s.heading} ${s.text}`)].join(' ')).includes(term)));
}
export const blogDate = (date) => new Intl.DateTimeFormat(localeTag(), { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

export function rememberBlogQuery(history, query) {
  const value = String(query).trim().replace(/\s+/g, ' ').slice(0, 100);
  const safeHistory = Array.isArray(history) ? history.filter((item) => typeof item === 'string' && item.trim().length >= 2).map((item) => item.slice(0, 100)) : [];
  if (value.length < 2) return safeHistory.slice(0, 5);
  return [value, ...safeHistory.filter((item) => normalizeBlogQuery(item) !== normalizeBlogQuery(value))].slice(0, 5);
}

export function blogSearchSuggestions(posts, { category = '', query = '', recent = [] } = {}) {
  const term = normalizeBlogQuery(query);
  const remembered = rememberBlogQuery(recent, '').filter((value) => !term || normalizeBlogQuery(value).includes(term)).slice(0, term ? 2 : 3).map((value) => ({ value, label: value, detail: t('blog.recentDetail'), kind: 'recent' }));
  const articles = filterBlogPosts(posts, { category, query }).slice(0, term ? 5 : 3).map((post) => ({ value: post.title, label: post.title, detail: post.category.name, kind: 'article' }));
  const seen = new Set();
  return [...remembered, ...articles].filter((item) => { const key = normalizeBlogQuery(item.value); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 6);
}
