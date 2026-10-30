// Local development server: rebuilds public-data/ whenever content/ changes
// and serves the site. Development only; production is plain static hosting.

import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, statSync, watch } from "node:fs";
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

function build() {
  spawnSync(process.execPath, [join(ROOT, "scripts/build-content.mjs")], { stdio: "inherit" });
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
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");

  const blocked = /^\/(content|scripts|node_modules|\.git)/.test(path);
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
