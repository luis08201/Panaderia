import { hasPrice } from "../utils/currency.js";
import { normalize } from "../utils/normalize.js";

export const SORT_OPTIONS = [
  { value: "recomendados", label: "Recommended" },
  { value: "nombre", label: "Name (A–Z)" },
  { value: "precio-asc", label: "Price: low to high" },
  { value: "precio-desc", label: "Price: high to low" },
];

export function searchText(product) {
  return normalize([product.name, product.shortDescription, product.description, product.category?.name].join(" "));
}

// Every word of the query must appear (in any order) in the product text.
export function filterProducts(products, { query = "", category = "" } = {}) {
  const words = normalize(query).split(" ").filter(Boolean);
  return products.filter((product) => {
    if (category && product.category?.slug !== category) return false;
    if (!words.length) return true;
    const haystack = searchText(product);
    return words.every((word) => haystack.includes(word));
  });
}

const byName = (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });

// Products without a price always go last when sorting by price.
function byPrice(direction) {
  return (a, b) => {
    const pa = hasPrice(a.price);
    const pb = hasPrice(b.price);
    if (pa !== pb) return pa ? -1 : 1;
    if (!pa) return byName(a, b);
    return (a.price - b.price) * direction || byName(a, b);
  };
}

export function sortProducts(products, order) {
  const list = [...products];
  switch (order) {
    case "nombre":
      return list.sort(byName);
    case "precio-asc":
      return list.sort(byPrice(1));
    case "precio-desc":
      return list.sort(byPrice(-1));
    default:
      // public-data/products.json already comes in the CMS order; sold-out items move to the end.
      return list.sort((a, b) => Number(b.available) - Number(a.available));
  }
}
