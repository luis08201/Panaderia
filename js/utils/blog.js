export const blogPostUrl = (post) => `blog/${encodeURIComponent(post.slug)}/`;
export const normalizeBlogQuery = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
export function filterBlogPosts(posts, { category = '', query = '' } = {}) {
  const terms = normalizeBlogQuery(query).split(' ').filter(Boolean);
  return posts.filter((post) => (!category || post.category.slug === category) && terms.every((term) => normalizeBlogQuery([post.title, post.excerpt, post.category.name, post.introduction, ...post.sections.map((s) => `${s.heading} ${s.text}`)].join(' ')).includes(term)));
}
export const blogDate = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
