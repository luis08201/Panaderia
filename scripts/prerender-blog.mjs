import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { blogIndexMarkup, blogArticleMarkup, escapeBlogHtml as e } from '../js/modules/blog-markup.js';
import { blogPostUrl } from '../js/utils/blog.js';
const root = process.argv[2];
if (!root) throw new Error('Output directory is required.');
const data = JSON.parse(readFileSync(join(root, 'public-data/blog.json'), 'utf8'));
const settings = JSON.parse(readFileSync(join(root, 'public-data/site.json'), 'utf8')).settings;
const siteUrl = String(settings.seo?.siteUrl || '').replace(/\/+$/, '');
const absolute = (path) => /^https:\/\//.test(path) ? path : siteUrl ? `${siteUrl}/${path}` : path;
const fillRoot = (html, markup) => html.replace(/<div id="blog-root"[^>]*>[\s\S]*?<!-- BLOG_ROOT_END -->/, () => `<div id="blog-root" data-static-blog>${markup}</div><!-- BLOG_ROOT_END -->`);
function metadata(html, { title, description, image, path, article }) {
  html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${e(title)}</title>`);
  for (const [key, value] of [['name="description"', description], ['property="og:title"', title], ['property="og:description"', description], ['property="og:image"', absolute(image || settings.seo?.ogImage || '')], ['property="og:site_name"', settings.businessName]]) {
    html = html.replace(new RegExp(`(<meta ${key} content=")[^"]*(")`), (_, start, end) => start + e(value) + end);
  }
  if (article) html = html.replace('property="og:type" content="website"', 'property="og:type" content="article"');
  if (siteUrl) html = html.replace('</head>', `<link rel="canonical" href="${e(absolute(path))}"><meta property="og:url" content="${e(absolute(path))}"></head>`);
  return html;
}
let listing = readFileSync(join(root, 'blog.html'), 'utf8');
listing = fillRoot(listing, blogIndexMarkup(data));
listing = metadata(listing, { title: `Blog · ${settings.businessName}`, description: 'Baking stories, thoughtful ingredients, and simple ideas for sharing good food.', path: 'blog.html' });
writeFileSync(join(root, 'blog.html'), listing);
const template = readFileSync(join(root, 'article.html'), 'utf8');
for (const post of data.posts) {
  let html = template.replace('<head>', '<head>\n    <base href="../../">').replace(/<meta name="robots" content="noindex"\s*\/?>/, '');
  html = fillRoot(html, blogArticleMarkup(post, data.posts));
  html = html.replace('href="#main"', `href="${e(blogPostUrl(post))}#main"`);
  html = html.replace('<span data-blog-current>Article</span>', () => `<span data-blog-current>${e(post.title)}</span>`);
  html = metadata(html, { title: `${post.seoTitle || post.title} · ${settings.businessName}`, description: post.seoDescription || post.excerpt, image: post.image?.src, path: blogPostUrl(post), article: true });
  if (siteUrl) {
    const schema = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.seoDescription || post.excerpt, datePublished: post.date, author: { '@type': 'Organization', name: post.author }, image: absolute(post.image.src), mainEntityOfPage: absolute(blogPostUrl(post)) };
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></head>`);
  }
  const directory = join(root, 'blog', post.slug);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), html);
}
console.log(`Generated blog listing and ${data.posts.length} static articles.`);
