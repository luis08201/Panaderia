// Local development server: rebuilds public-data/ whenever content/ changes
// and serves the site. Development only; production is plain static hosting.

import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, statSync, watch, mkdirSync, copyFileSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 47823;
const HOST = process.env.HOST || "127.0.0.1";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};
let publishedBlogSlugs = new Set();

function build() {
  const result = spawnSync(process.execPath, [join(ROOT, "scripts/build-content.mjs")], { stdio: "inherit" });
  if (result.status !== 0) throw new Error('Content validation failed; preview stopped.');
  publishedBlogSlugs = new Set(JSON.parse(readFileSync(join(ROOT, 'public-data/blog.json'), 'utf8')).posts.map((post) => post.slug));
  // Blog previews use the same generated HTML as production, including deep links.
  mkdirSync(join(ROOT, 'dist/public-data'), { recursive: true });
  copyFileSync(join(ROOT, 'public-data/blog.json'), join(ROOT, 'dist/public-data/blog.json'));
  copyFileSync(join(ROOT, 'public-data/site.json'), join(ROOT, 'dist/public-data/site.json'));
  copyFileSync(join(ROOT, 'blog.html'), join(ROOT, 'dist/blog.html'));
  copyFileSync(join(ROOT, 'article.html'), join(ROOT, 'dist/article.html'));
  const rendered = spawnSync(process.execPath, [join(ROOT, 'scripts/prerender-blog.mjs'), join(ROOT, 'dist')], { stdio: 'inherit' });
  if (rendered.status !== 0) throw new Error('Blog rendering failed.');
}

build();
let timer;
watch(join(ROOT, "content"), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(build, 150);
});

createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(ROOT, path);
  if (url.pathname === '/blog.html' || /^\/blog\/[a-z0-9-]+\/(?:index\.html)?$/.test(url.pathname)) file = join(ROOT, 'dist', path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");

  const articleSlug = url.pathname.match(/^\/blog\/([a-z0-9-]+)\/(?:index\.html)?$/)?.[1];
  const blocked = /^\/(content|scripts|node_modules|\.git)/.test(url.pathname) || (articleSlug && !publishedBlogSlugs.has(articleSlug));
  if (blocked || !existsSync(file)) {
    response.writeHead(404, { "Content-Type": TYPES[".html"] });
    createReadStream(join(ROOT, "404.html")).pipe(response);
    return;
  }
  response.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  createReadStream(file).pipe(response);
}).listen(PORT, HOST, () => {
  console.log(`Panadería en http://${HOST}:${PORT}`);
});
