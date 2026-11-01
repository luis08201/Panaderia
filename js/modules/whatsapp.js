// Links for questions only: the messages never place or confirm an order.

export function whatsappUrl(number, message) {
  const digits = String(number ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function productMessage(product) {
  return `Hi! I would like to ask about ${product.name} and its availability.`;
}

export function productWhatsappUrl(number, product) {
  return whatsappUrl(number, productMessage(product));
}
