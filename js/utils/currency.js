import { t } from "../i18n.js";
import { localeTag } from "../locale-data.js";

export function hasPrice(price) {
  return typeof price === "number" && Number.isFinite(price);
}

// Prices stay in USD. The locale only changes how the amount is written.
export function formatPrice(price) {
  if (!hasPrice(price)) return t("price.ask");
  return new Intl.NumberFormat(localeTag(), { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
}
