import { TIMEZONE } from "../config.js";

// Today's date in Managua as "AAAA-MM-DD", regardless of the visitor's time zone.
export function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

const longDate = new Intl.DateTimeFormat("es-NI", { day: "numeric", month: "long", timeZone: "UTC" });

// "2026-11-30" -> "30 de noviembre"
export function formatDate(isoDate) {
  if (!isoDate) return "";
  return longDate.format(new Date(`${isoDate}T00:00:00Z`));
}

export function isCurrent({ startDate, endDate }, day = today()) {
  return (!startDate || startDate <= day) && (!endDate || day <= endDate);
}
