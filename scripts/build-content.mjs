// Validates the Pages CMS content in content/ and writes the JSON the site reads
// (public-data/) plus sitemap.xml and robots.txt. It never modifies content/.
// Usage: node scripts/build-content.mjs [--check]   (--check validates without writing)

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateContentUrl } from "./url-policy.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const OUT = join(ROOT, "public-data");
const CHECK_ONLY = process.argv.includes("--check");

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const errors = [];
const warnings = [];

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${rel(file)}: JSON inválido (${error.message})`);
    return null;
  }
}

function readCollection(folder) {
  const dir = join(CONTENT, folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => ({ file: join(dir, name), data: readJson(join(dir, name)) }))
    .filter((entry) => entry.data);
}

const rel = (file) => file.replace(ROOT + "/", "");
const text = (value) => (typeof value === "string" ? value.trim() : "");
const bool = (value, fallback) => (typeof value === "boolean" ? value : fallback);
const list = (value) => (Array.isArray(value) ? value : []);

// Pages CMS may store media paths with or without a leading slash; the site uses
// paths relative to its root so it also works from a subdirectory.
function imagePath(value, where, { required = false } = {}) {
  const path = text(value).replace(/^\/+/, "");
  if (!path) {
    if (required) errors.push(`${where}: falta la imagen`);
    return "";
  }
  if (/^https?:\/\//.test(path)) {
    try { return validateContentUrl(path, { externalOnly: true }); }
    catch (error) { errors.push(`${where}: imagen externa inválida (${error.message})`); return ""; }
  }
  if (path.split("/").includes("..") || path.includes("\\")) {
    errors.push(`${where}: ruta de imagen no permitida`);
    return "";
  }
  if (!existsSync(join(ROOT, path))) {
    errors.push(`${where}: la imagen "${path}" no existe`);
    return "";
  }
  return path;
}

// Optional smaller copy in a sibling "sm/" folder, used for srcset.
function smallImage(path) {
  if (!path || /^https?:/.test(path)) return "";
  const small = posix.join(posix.dirname(path), "sm", posix.basename(path));
  return existsSync(join(ROOT, small)) ? small : "";
}

// Reads width and height from WebP, PNG or JPEG headers (no dependencies).
function imageSize(path) {
  if (!path || /^https?:/.test(path)) return null;
  const b = readFileSync(join(ROOT, path));
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (chunk === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
    }
  }
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    let offset = 2;
    while (offset < b.length) {
      const marker = b[offset + 1];
      const length = b.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return [b.readUInt16BE(offset + 7), b.readUInt16BE(offset + 5)];
      }
      offset += 2 + length;
    }
  }
  return null;
}

// { src, small, width, height, smallWidth } for the frontend's <img> helper.
function imageInfo(path) {
  if (!path) return null;
  const size = imageSize(path);
  const small = smallImage(path);
  const smallSize = small ? imageSize(small) : null;
  return {
    src: path,
    small: small || undefined,
    width: size?.[0],
    height: size?.[1],
    smallWidth: smallSize?.[0],
  };
}

function requireFields(data, fields, where) {
  for (const field of fields) {
    if (!text(data[field])) errors.push(`${where}: falta el campo obligatorio "${field}"`);
  }
}

function checkUnique(entries, key, label) {
  const seen = new Map();
  for (const { file, data } of entries) {
    const value = text(data[key]);
    if (!value) continue;
    if (seen.has(value)) errors.push(`${label} duplicado "${value}" en ${rel(seen.get(value))} y ${rel(file)}`);
    else seen.set(value, file);
  }
}

function checkLink(url, where) {
  const value = text(url);
  try { return validateContentUrl(value); }
  catch (error) { errors.push(`${where}: enlace no válido "${value}" (${error.message})`); return ""; }
}

// ---------- Categories ----------
const categoryEntries = readCollection("categories");
checkUnique(categoryEntries, "id", "ID de categoría");
checkUnique(categoryEntries, "slug", "Slug de categoría");

const allCategories = categoryEntries.map(({ file, data }) => {
  const where = rel(file);
  requireFields(data, ["id", "slug", "name"], where);
  if (text(data.slug) && !SLUG.test(data.slug)) errors.push(`${where}: el slug "${data.slug}" solo puede tener minúsculas, números y guiones`);
  return {
    id: text(data.id),
    slug: text(data.slug),
    name: text(data.name),
    description: text(data.description),
    image: imageInfo(imagePath(data.image, where)),
    position: Number.isFinite(data.position) ? data.position : 999,
    published: bool(data.published, true),
  };
});
const categoriesById = new Map(allCategories.map((category) => [category.id, category]));

// ---------- Products ----------
const productEntries = readCollection("products");
checkUnique(productEntries, "id", "ID de producto");
checkUnique(productEntries, "slug", "Slug de producto");

const allProducts = productEntries.map(({ file, data }) => {
  const where = rel(file);
  requireFields(data, ["id", "slug", "name", "categoryId"], where);
  if (text(data.slug) && !SLUG.test(data.slug)) errors.push(`${where}: el slug "${data.slug}" solo puede tener minúsculas, números y guiones`);

  const category = categoriesById.get(text(data.categoryId));
  if (text(data.categoryId) && !category) errors.push(`${where}: la categoría "${data.categoryId}" no existe`);

  // Empty price means "Precio a consultar"; a price is never invented.
  let price = null;
  if (data.price !== undefined && data.price !== null && data.price !== "") {
    price = Number(data.price);
    if (!Number.isFinite(price) || price < 0) {
      errors.push(`${where}: el precio "${data.price}" no es válido`);
      price = null;
    }
  }
  if (data.currency && data.currency !== "NIO") errors.push(`${where}: la moneda debe ser NIO`);

  const image = imagePath(data.image, where, { required: true });
  return {
    id: text(data.id),
    slug: text(data.slug),
    name: text(data.name),
    categoryId: text(data.categoryId),
    category: category ? { slug: category.slug, name: category.name, published: category.published } : null,
    shortDescription: text(data.shortDescription),
    description: text(data.description),
    price,
    unit: text(data.unit),
    currency: "NIO",
    image: imageInfo(image),
    imageAlt: text(data.imageAlt) || text(data.name),
    gallery: list(data.gallery)
      .map((item, index) => imageInfo(imagePath(typeof item === "string" ? item : item?.image, `${where} (galería ${index + 1})`)))
      .filter(Boolean),
    ingredients: list(data.ingredients).map(text).filter(Boolean),
    allergens: list(data.allergens).map(text).filter(Boolean),
    available: bool(data.available, true),
    featured: bool(data.featured, false),
    newArrival: bool(data.newArrival, false),
    published: bool(data.published, false),
    sortOrder: Number.isFinite(data.sortOrder) ? data.sortOrder : 999,
    seoTitle: text(data.seoTitle),
    seoDescription: text(data.seoDescription),
  };
});

const visibleCategoryIds = new Set(allCategories.filter((c) => c.published).map((c) => c.id));
const products = allProducts
  .filter((product) => product.published && visibleCategoryIds.has(product.categoryId))
  .map(({ published, category, ...product }) => ({ ...product, category: { slug: category.slug, name: category.name } }))
  .sort((a, b) => {
    const ca = categoriesById.get(a.categoryId).position;
    const cb = categoriesById.get(b.categoryId).position;
    return ca - cb || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es");
  });

const categories = allCategories
  .filter((category) => category.published)
  .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, "es"))
  .map(({ published, ...category }) => ({
    ...category,
    productCount: products.filter((product) => product.categoryId === category.id).length,
  }));

for (const category of categories) {
  if (!category.productCount) warnings.push(`La categoría "${category.name}" no tiene productos publicados`);
}
const hiddenByCategory = allProducts.filter((p) => p.published && p.categoryId && !visibleCategoryIds.has(p.categoryId) && categoriesById.has(p.categoryId));
for (const product of hiddenByCategory) warnings.push(`"${product.name}" está publicado pero su categoría no; no se mostrará`);

// ---------- Promotions ----------
const promotionEntries = readCollection("promotions");
checkUnique(promotionEntries, "id", "ID de promoción");
const promotions = promotionEntries
  .map(({ file, data }) => {
    const where = rel(file);
    requireFields(data, ["id", "title"], where);
    for (const key of ["startDate", "endDate"]) {
      if (text(data[key]) && !DATE.test(text(data[key]))) errors.push(`${where}: la fecha "${data[key]}" debe tener el formato AAAA-MM-DD`);
    }
    if (text(data.startDate) && text(data.endDate) && data.startDate > data.endDate) errors.push(`${where}: la fecha de inicio es posterior a la de fin`);
    return {
      id: text(data.id),
      title: text(data.title),
      description: text(data.description),
      image: imageInfo(imagePath(data.image, where)),
      startDate: text(data.startDate),
      endDate: text(data.endDate),
      active: bool(data.active, false),
      linkUrl: checkLink(data.linkUrl, where),
      linkLabel: text(data.linkLabel),
    };
  })
  .filter((promotion) => promotion.active)
  .sort((a, b) => (a.endDate || "9999").localeCompare(b.endDate || "9999"));

// ---------- Settings and pages ----------
const settingsFile = join(CONTENT, "settings.json");
const settings = existsSync(settingsFile) ? readJson(settingsFile) ?? {} : {};
requireFields(settings, ["businessName"], "content/settings.json");
const whatsapp = text(settings.whatsapp).replace(/\D/g, "");
if (!whatsapp) warnings.push("settings.json: no hay número de WhatsApp; los botones de consulta se ocultarán");
else if (whatsapp.length < 8) errors.push(`settings.json: el número de WhatsApp "${settings.whatsapp}" debe incluir el código de país (505…)`);
checkLink(settings.announcement?.linkUrl, "settings.json (anuncio)");
for (const field of ["mapsUrl"]) {
  try { validateContentUrl(settings[field], { externalOnly: true }); }
  catch (error) { errors.push(`settings.json (${field}): ${error.message}`); }
}
if (settings.seo?.siteUrl) {
  try { validateContentUrl(settings.seo.siteUrl, { externalOnly: true, siteBase: true }); }
  catch (error) { errors.push(`settings.json (seo.siteUrl): ${error.message}`); }
}
for (const [index, item] of list(settings.social).entries()) {
  try { validateContentUrl(item?.url, { externalOnly: true }); }
  catch (error) { errors.push(`settings.json (red social ${index + 1}): ${error.message}`); }
}
if (settings.seo?.ogImage) settings.seo.ogImage = imagePath(settings.seo.ogImage, "settings.json (imagen para redes)");

function readPage(name) {
  const file = join(CONTENT, "pages", `${name}.json`);
  if (!existsSync(file)) {
    errors.push(`Falta content/pages/${name}.json`);
    return {};
  }
  const page = readJson(file) ?? {};
  // Resolve every "image" field in the page into an image object.
  const walk = (node, path) => {
    if (Array.isArray(node)) node.forEach((item, i) => walk(item, `${path}[${i}]`));
    else if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node)) {
        if (key === "image" && typeof value === "string") {
          node.image = imageInfo(imagePath(value, `content/pages/${name}.json (${path}.image)`));
        } else walk(value, `${path}.${key}`);
      }
    }
  };
  walk(page, name);
  return page;
}

const site = {
  settings: { ...settings, whatsapp },
  pages: { home: readPage("home"), nosotros: readPage("nosotros") },
  generatedAt: new Date().toISOString(),
};

// ---------- Report and write ----------
for (const warning of warnings) console.warn(`aviso: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\n${errors.length} error(es) en el contenido. Corrígelos en Pages CMS o en content/.`);
  process.exit(1);
}

const unpublished = allProducts.length - products.length;
console.log(`Contenido válido: ${products.length} productos publicados (${unpublished} ocultos), ${categories.length} categorías, ${promotions.length} promociones activas.`);
if (CHECK_ONLY) process.exit(0);

mkdirSync(OUT, { recursive: true });
const write = (name, data) => writeFileSync(join(OUT, name), JSON.stringify(data) + "\n");
write("products.json", products);
write("categories.json", categories);
write("promotions.json", promotions);
write("site.json", site);

const siteUrl = text(settings.seo?.siteUrl).replace(/\/+$/, "");
if (siteUrl) {
  const urls = ["", "catalogo.html", "nosotros.html", "contacto.html", ...products.map((p) => `producto.html?slug=${p.slug}`)];
  const xml = urls.map((path) => `  <url><loc>${siteUrl}/${path.replace(/&/g, "&amp;")}</loc></url>`).join("\n");
  writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`);
  writeFileSync(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  console.log("sitemap.xml y robots.txt actualizados.");
}
console.log(`Datos escritos en ${rel(OUT)}/`);
