// Blog validation is separate from the product catalog and reusable in tests.
export function normalizeBlog(categoryEntries, postEntries, { imageInfo = (src) => ({ src }) } = {}) {
  const errors = [];
  const text = (value) => typeof value === 'string' ? value.trim() : '';
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const unique = (entries, key, label) => {
    const seen = new Set();
    for (const { data, file } of entries) {
      const value = text(data[key]);
      if (!value) errors.push(`${file}: missing ${key}`);
      else if (seen.has(value)) errors.push(`${label}: duplicate ${key} "${value}"`);
      seen.add(value);
    }
  };
  if (categoryEntries.length !== 4) errors.push('Blog categories: exactly four entries are required. All is a filter, not a category.');
  unique(categoryEntries, 'id', 'Blog categories');
  unique(categoryEntries, 'slug', 'Blog categories');
  unique(postEntries, 'id', 'Blog posts');
  unique(postEntries, 'slug', 'Blog posts');
  const categories = categoryEntries.map(({ data, file }) => {
    if (!text(data.name)) errors.push(`${file}: missing category name`);
    if (!slugPattern.test(text(data.slug)) || text(data.slug) === 'all') errors.push(`${file}: invalid or reserved category slug`);
    return { id: text(data.id), slug: text(data.slug), name: text(data.name), description: text(data.description), position: Number.isFinite(data.position) ? data.position : 100 };
  }).sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, 'en'));
  const byId = new Map(categories.map((c) => [c.id, c]));
  const posts = postEntries.map(({ data, file }) => {
    for (const key of ['title', 'excerpt', 'introduction', 'author', 'date', 'categoryId', 'image', 'imageAlt']) {
      if (!text(data[key])) errors.push(`${file}: missing ${key}`);
    }
    if (!slugPattern.test(text(data.slug))) errors.push(`${file}: invalid post slug`);
    const date = text(data.date);
    const parsed = new Date(`${date}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) errors.push(`${file}: invalid publication date`);
    const category = byId.get(text(data.categoryId));
    if (!category) errors.push(`${file}: unknown blog category "${data.categoryId}"`);
    const sections = Array.isArray(data.sections) ? data.sections.map((section) => ({ heading: text(section.heading), text: text(section.text) })) : [];
    if (!sections.length || sections.some((section) => !section.heading || !section.text)) errors.push(`${file}: add at least one complete article section`);
    const words = [data.introduction, ...sections.map((s) => `${s.heading} ${s.text}`)].join(' ').trim().split(/\s+/).length;
    return { id: text(data.id), slug: text(data.slug), title: text(data.title), excerpt: text(data.excerpt), introduction: text(data.introduction), author: text(data.author), date, categoryId: text(data.categoryId), category, image: imageInfo(text(data.image), file), imageAlt: text(data.imageAlt), sections, readingMinutes: Math.max(1, Math.ceil(words / 200)), featured: data.featured === true, published: data.published === true, seoTitle: text(data.seoTitle), seoDescription: text(data.seoDescription) };
  }).filter((p) => p.published).map(({ published, ...post }) => post).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'en'));
  return { categories: categories.map((c) => ({ ...c, postCount: posts.filter((p) => p.categoryId === c.id).length })), posts, errors };
}
