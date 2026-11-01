// Pre-renders published product pages as real HTML for crawlers, social previews,
// accessibility and visitors without JavaScript. The client-side product module
// progressively enhances the same page with its interactive gallery.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const attr = escapeHtml;
const root = process.argv[2];
if (!root) throw new Error("Se requiere la ruta de salida.");
const products = JSON.parse(readFileSync(join(root, "public-data/products.json"), "utf8"));
const site = JSON.parse(readFileSync(join(root, "public-data/site.json"), "utf8"));
const settings = site.settings;
const base = readFileSync(join(root, "producto.html"), "utf8");
const siteUrl = String(settings.seo?.siteUrl || "").replace(/\/+$/, "");
const absolute = (path) => siteUrl ? siteUrl + "/" + path.replace(/^\/+/, "") : path;
const paragraphs = (value) => String(value ?? "").split(/\n\s*\n/).filter(Boolean).map((p) => `<p>${escapeHtml(p.trim())}</p>`).join("");
const tags = (label, items) => items?.length ? `<div><h2>${label}</h2><ul class="tag-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : "";
const priceText = (p) => typeof p.price === "number" ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.price) : "Price on request";

for (const p of products) {
  const path = `productos/${p.slug}/`;
  const title = `${p.seoTitle || p.name} · ${settings.businessName}`;
  const description = (p.seoDescription || p.shortDescription || p.description || p.name).slice(0, 160);
  const image = p.image?.src || settings.seo?.ogImage || "";
  const images = [p.image, ...(p.gallery || [])].filter((img) => img?.src);
  const mainImage = images[0] ? `<img src="${attr(images[0].src)}" alt="${attr(p.imageAlt || p.name)}" width="${images[0].width || 800}" height="${images[0].height || 600}" fetchpriority="high">` : "";
  const whatsapp = String(settings.whatsapp || "").replace(/\D/g, "");
  const message = encodeURIComponent(`Hi! I would like to ask about ${p.name}.`);
  const contact = whatsapp && !settings.demoNotice ? `<a class="btn btn--whatsapp" href="https://wa.me/${whatsapp}?text=${message}" target="_blank" rel="noopener">Ask on WhatsApp</a>` : "";
  const productMarkup = `<div class="container"><article class="product">
    <div class="product__gallery"><div class="product__main-image${p.available ? "" : " is-sold-out"}">${mainImage}</div></div>
    <div class="product__info">
      <div><a class="product__category" href="catalogo.html?categoria=${encodeURIComponent(p.category.slug)}">${escapeHtml(p.category.name)}</a><h1>${escapeHtml(p.name)}</h1></div>
      <p class="price product__price"><span class="price__amount">${escapeHtml(priceText(p))}</span>${p.unit ? `<span class="price__unit">${escapeHtml(p.unit)}</span>` : ""}</p>
      <div class="product__status"><span class="badge ${p.available ? "badge--available" : "badge--unavailable"}">${p.available ? "Available today" : "Sold out today"}</span></div>
      ${p.shortDescription ? `<p class="product__lead">${escapeHtml(p.shortDescription)}</p>` : ""}
      <div class="product__description prose">${paragraphs(p.description)}</div>
      <div class="product__actions">${contact}<a class="btn btn--outline" href="catalogo.html?categoria=${encodeURIComponent(p.category.slug)}">More ${escapeHtml(p.category.name)}</a></div>
      ${settings.availabilityNote ? `<p class="availability-note">${escapeHtml(settings.availabilityNote)}</p>` : ""}
      <div class="details">${tags("Ingredients", p.ingredients)}${tags("Allergens", p.allergens)}</div>
    </div></article></div>`;

  let html = base.replace(/<meta name="robots" content="noindex"\s*\/>/, "");
  html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1" />', '<meta name="viewport" content="width=device-width, initial-scale=1" />\n    <base href="../../" />');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${attr(description)}" />`);
  for (const [property, value] of [["og:title", title], ["og:description", description], ["og:image", absolute(image)]]) {
    const regex = new RegExp(`(<meta property="${property}" content=")[^"]*(")`);
    html = html.replace(regex, (_, start, end) => start + attr(value) + end);
  }
  html = html.replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="product" />');
  if (siteUrl) {
    html = html.replace('</head>', `<link rel="canonical" href="${attr(absolute(path))}" />\n    <meta property="og:url" content="${attr(absolute(path))}" />\n  </head>`);
  }
  html = html.replace('<li id="breadcrumb-category"></li>', `<li id="breadcrumb-category"><a href="catalogo.html?categoria=${encodeURIComponent(p.category.slug)}">${escapeHtml(p.category.name)}</a></li>`);
  html = html.replace('<li id="breadcrumb-current" aria-current="page">Producto</li>', `<li id="breadcrumb-current" aria-current="page">${escapeHtml(p.name)}</li>`);
  html = html.replace(/<div id="product-root" aria-live="polite">[\s\S]*?<\/div>\s*<noscript>/, `<div id="product-root" aria-live="polite" data-static-product>${productMarkup}</div>\n      <noscript>`);
  // Do not display the JavaScript-disabled warning on pre-rendered product pages.
  html = html.replace('<noscript><div class="container"><p class="state">Activa JavaScript para ver el detalle del producto.</p></div></noscript>', "");
  const directory = join(root, "productos", p.slug);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), html);
}
console.log(`Generated ${products.length} static product pages.`);
