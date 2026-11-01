import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { normalizeBlog } from '../scripts/blog-content.mjs';
import { filterBlogPosts } from '../js/utils/blog.js';
import { blogArticleMarkup, blogIndexMarkup } from '../js/modules/blog-markup.js';
const readEntries = (folder) => readdirSync(new URL(`../content/${folder}/`, import.meta.url)).filter((p) => p.endsWith('.json')).map((name) => ({ file: name, data: JSON.parse(readFileSync(new URL(`../content/${folder}/${name}`, import.meta.url), 'utf8')) }));
const categories = readEntries('blog-categories');
const posts = readEntries('blog-posts');
const normalize = (c = categories, p = posts) => normalizeBlog(structuredClone(c), structuredClone(p));

test('sample blog has four categories, twelve articles, three features and newest-first order', () => {
  const data = normalize();
  assert.deepEqual(data.errors, []);
  assert.equal(data.categories.length, 4);
  assert.equal(data.posts.length, 12);
  assert.equal(data.posts.filter((p) => p.featured).length, 3);
  assert.ok(data.categories.every((c) => c.postCount === 3));
  assert.ok(data.posts.every((p, i) => i === 0 || p.date <= data.posts[i - 1].date));
});
test('All is a UI filter and cannot become a fifth or reserved category', () => {
  const fifth = [...categories, { file: 'all.json', data: { id: 'all', slug: 'all', name: 'All' } }];
  assert.ok(normalize(fifth).errors.some((e) => e.includes('exactly four')));
  assert.ok(normalize(fifth).errors.some((e) => e.includes('reserved')));
});
test('draft articles are excluded from output and category counts', () => {
  const draft = structuredClone(posts);
  draft[0].data.published = false;
  const data = normalize(categories, draft);
  assert.equal(data.posts.length, 11);
  assert.equal(data.categories.reduce((sum, c) => sum + c.postCount, 0), 11);
  assert.ok(!data.posts.some((p) => p.slug === draft[0].data.slug));
});
test('unknown references, duplicate slugs, impossible dates and empty sections are rejected', () => {
  const invalid = structuredClone(posts);
  invalid[0].data.categoryId = 'missing';
  invalid[1].data.slug = invalid[0].data.slug;
  invalid[2].data.date = '2026-02-31';
  invalid[3].data.sections = [];
  const errors = normalize(categories, invalid).errors.join('\n');
  for (const expected of ['unknown blog category', 'duplicate slug', 'invalid publication date', 'complete article section']) assert.ok(errors.includes(expected), expected);
});
test('search combines category and multiple case/accent/space-insensitive terms', () => {
  const data = normalize();
  const match = filterBlogPosts(data.posts, { category: 'ingredients-and-craft', query: '  BÚTTER   layers ' });
  assert.equal(match.length, 1);
  assert.equal(match[0].slug, 'butter-layers-and-patience');
  assert.equal(filterBlogPosts(data.posts, { category: 'serving-and-sharing', query: 'sourdough' }).length, 0);
  assert.equal(filterBlogPosts(data.posts, { query: 'zz-no-match' }).length, 0);
});
test('CMS content is escaped in article and card markup', () => {
  const data = normalize();
  const post = { ...data.posts[0], title: '<script>alert("title")</script>', introduction: '<img src=x onerror=alert(1)>', sections: [{ heading: '<b>Heading</b>', text: '<script>alert("body")</script>' }] };
  const html = blogArticleMarkup(post, [post]) + blogIndexMarkup({ categories: data.categories, posts: [post] });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;b&gt;Heading&lt;/b&gt;'));
});
test('article section links keep the article path when a base URL is present', () => {
  const data = normalize();
  const post = data.posts[0];
  const html = blogArticleMarkup(post, data.posts);
  assert.ok(html.includes(`href="blog/${post.slug}/#article-section-1"`));
  assert.ok(!html.includes('href="#article-section-'));
});
test('static listing contains twelve latest cards plus three featured cards', () => {
  const data = normalize();
  const html = blogIndexMarkup(data);
  assert.equal((html.match(/<article class="blog-card/g) || []).length, 15);
  assert.equal((html.match(/data-blog-category=/g) || []).length, 5);
  assert.ok(html.includes('id="blog-tools" hidden'));
});
