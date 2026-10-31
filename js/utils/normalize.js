// Lowercase and strip accents so "pina" finds "Piña" and "PASTEL" finds "pastel".
export function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
