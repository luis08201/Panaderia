import { LOCALE } from "../config.js";




export const PRICE_ON_REQUEST = "Price on request";

export function hasPrice(price) {
  return typeof price === "number" && Number.isFinite(price);
}

// Prices are stored in USD and displayed using en-US currency formatting.
export function formatPrice(price) {
  if (!hasPrice(price)) return PRICE_ON_REQUEST;
  
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
}
