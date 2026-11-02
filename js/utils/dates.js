import { TIMEZONE } from "../config.js";
import { localeTag } from "../locale-data.js";

// Today in the configured bakery time zone as YYYY-MM-DD.
export function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

// "2026-11-30" -> "November 30" or "30 de noviembre"
export function formatDate(isoDate) {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat(localeTag(), { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function isCurrent({ startDate, endDate }, day = today()) {
  return (!startDate || startDate <= day) && (!endDate || day <= endDate);
}
