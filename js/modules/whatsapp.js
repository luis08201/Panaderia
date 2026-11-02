import { t } from "../i18n.js";

// Links for questions only: the messages never place or confirm an order.

export function whatsappUrl(number, message) {
  const digits = String(number ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function productMessage(product) {
  return t("wa.product", { name: product.name });
}

export function productWhatsappUrl(number, product) {
  return whatsappUrl(number, productMessage(product));
}
