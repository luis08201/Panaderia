import { TIMEZONE } from "../config.js";

// Today in the configured bakery time zone as YYYY-MM-DD.
export function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

const longDate = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", timeZone: "UTC" });

// "2026-11-30" -> "November 30"
export function formatDate(isoDate) {
  if (!isoDate) return "";
  return longDate.format(new Date(`${isoDate}T00:00:00Z`));
}

export function isCurrent({ startDate, endDate }, day = today()) {
  return (!startDate || startDate <= day) && (!endDate || day <= endDate);
}
