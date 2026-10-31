import { DATA_URL } from "../config.js";

const cache = new Map();

function load(name) {
  if (!cache.has(name)) {
    const request = fetch(`${DATA_URL}${name}.json`).then((response) => {
      if (!response.ok) throw new Error(`No se pudo cargar ${name}.json (${response.status})`);
      return response.json();
    });
    // A failed request is not cached, so "Reintentar" fetches again.
    request.catch(() => cache.delete(name));
    cache.set(name, request);
  }
  return cache.get(name);
}

export const getSite = () => load("site");
export const getProducts = () => load("products");
export const getCategories = () => load("categories");
export const getPromotions = () => load("promotions");
