import { LOCALE } from "../config.js";

const whole = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const PRICE_ON_REQUEST = "Precio a consultar";

export function hasPrice(price) {
  return typeof price === "number" && Number.isFinite(price);
}

// 180 -> "C$ 180", 1250.5 -> "C$ 1,250.50"
export function formatPrice(price) {
  if (!hasPrice(price)) return PRICE_ON_REQUEST;
  const formatter = Number.isInteger(price) ? whole : cents;
  return `C$ ${formatter.format(price)}`;
}
