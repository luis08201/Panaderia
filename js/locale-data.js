// Language preference and CMS overlays. English stays the stored content; Spanish arrives as an `es` object.

const STORAGE_KEY = "site-lang";

export function getLang() {
  try {
    const query = typeof location !== "undefined" ? new URLSearchParams(location.search).get("lang") : "";
    if (query === "es" || query === "en") return query;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : "";
    if (saved === "es" || saved === "en") return saved;
  } catch {
    // Private browsing can block storage. English remains the default.
  }
  return "en";
}

export function rememberLang(lang) {
  try {
    if (lang === "es" || lang === "en") localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // The choice still applies to this page load.
  }
}

export function localeTag() {
  return getLang() === "es" ? "es-NI" : "en-US";
}

// Keeps a shared Spanish link when catalog, blog, or search rewrite the query string.
export function withLang(params) {
  if (getLang() === "es") params.set("lang", "es");
  else params.delete("lang");
  return params;
}

// Replaces text fields with the Spanish overlay. Images, prices and identifiers stay as published.
export function applyEntity(entity, extra, lang = getLang()) {
  if (!entity || typeof entity !== "object") return entity;
  const translation = extra === undefined ? entity.es : extra;
  const rest = Array.isArray(entity) ? entity.map((item) => (item && typeof item === "object" ? { ...item } : item)) : { ...entity };
  if (!Array.isArray(rest)) delete rest.es;
  if (lang !== "es" || !translation) return rest;

  const assign = (target, source) => {
    if (!source || typeof source !== "object") return target;
    for (const [key, value] of Object.entries(source)) {
      if (!(key in target) || key === "es") continue;
      if (typeof value === "string") {
        if (value.trim()) target[key] = value;
      } else if (Array.isArray(value) && Array.isArray(target[key]) && value.length) {
        if (value.every((item) => typeof item === "string")) target[key] = value;
        else target[key] = target[key].map((item, index) => (item && typeof item === "object" ? assign({ ...item }, value[index]) : item));
      } else if (value && typeof value === "object" && target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
        target[key] = assign({ ...target[key] }, value);
      }
    }
    return target;
  };
  return assign(rest, translation);
}

export function localizePayload(name, data) {
  if (!data) return data;
  if (name === "products" || name === "categories" || name === "promotions") return data.map((item) => applyEntity(item));
  if (name === "site") return { ...data, settings: applyEntity(data.settings), pages: applyEntity(data.pages) };
  if (name === "blog") {
    return { ...data, categories: (data.categories || []).map((item) => applyEntity(item)), posts: (data.posts || []).map((item) => applyEntity(item)) };
  }
  if (name === "search") {
    return data.map((item) => applyEntity({ ...item, title: item.title, description: item.description, es: { title: item.titleEs, description: item.descriptionEs } }));
  }
  return data;
}
