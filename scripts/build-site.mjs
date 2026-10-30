// Copies the publishable files into dist/ (after build-content has run).
// The hosting service publishes dist/, so content/, scripts/ and config stay private.

import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const PUBLIC = [
  "index.html",
  "catalogo.html",
  "producto.html",
  "nosotros.html",
  "contacto.html",
  "404.html",
  "favicon.svg",
  "css",
  "js",
  "assets",
  "public-data",
  "sitemap.xml",
  "robots.txt",
];

rmSync(DIST, { recursive: true, force: true });
for (const entry of PUBLIC) {
  const from = join(ROOT, entry);
  if (existsSync(from)) cpSync(from, join(DIST, entry), { recursive: true });
}
console.log("Sitio listo en dist/");
