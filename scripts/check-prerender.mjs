// Build smoke test: product pages must contain indexable content without JS.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const products = JSON.parse(readFileSync("dist/public-data/products.json", "utf8"));
assert.ok(products.length > 0, "Debe existir al menos un producto publicado");
const sitemap = existsSync("dist/sitemap.xml") ? readFileSync("dist/sitemap.xml", "utf8") : "";
const settings = JSON.parse(readFileSync("dist/public-data/site.json", "utf8")).settings;
for (const p of products) {
  const path = join("dist", "productos", p.slug, "index.html");
  assert.ok(existsSync(path), `Falta ficha estática: ${p.slug}`);
  const html = readFileSync(path, "utf8");
  assert.ok(html.includes("data-static-product"), `Falta HTML pre-renderizado: ${p.slug}`);
  assert.ok(html.includes("<h1>"), `Falta encabezado principal: ${p.slug}`);
  assert.ok(html.includes('<meta name="description"'), `Falta descripción: ${p.slug}`);
  assert.ok(!html.includes('<meta name="robots" content="noindex"'), `Ficha indexable marcada noindex: ${p.slug}`);
  if (settings.seo?.siteUrl) assert.ok(sitemap.includes(`productos/${p.slug}/`), `Falta en sitemap: ${p.slug}`);
}
const legacy = readFileSync("dist/producto.html", "utf8");
assert.ok(legacy.includes('<meta name="robots" content="noindex"'), "La URL antigua debe evitar duplicación");
console.log(`SEO estático comprobado para ${products.length} productos.`);
