// Shared URL policy for content authored through Pages CMS.
// Relative links are allowed for internal CTAs; external-only fields require HTTPS.
export function validateContentUrl(input, { externalOnly = false, siteBase = false } = {}) {
  const value = typeof input === "string" ? input.trim() : "";
  if (!value) return "";

  if (/[\u0000-\u0020\u007f\\]/.test(value) || value === "#" || value.startsWith("//")) {
    throw new Error("formato de URL no permitido");
  }

  const absolute = /^[a-z][a-z\d+.-]*:/i.test(value);
  if (externalOnly && !absolute) throw new Error("se requiere una URL HTTPS absoluta");
  if (!absolute && value.split(/[?#]/, 1)[0].split("/").includes("..")) {
    throw new Error("no se permiten rutas que suban de directorio");
  }

  let parsed;
  try {
    parsed = new URL(value, "https://template.invalid/");
  } catch {
    throw new Error("URL mal formada");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("solo se permiten enlaces HTTP o HTTPS");
  }
  if (externalOnly && parsed.protocol !== "https:") {
    throw new Error("se requiere HTTPS");
  }
  if (parsed.username || parsed.password) {
    throw new Error("no se permiten credenciales en la URL");
  }
  if (siteBase && (parsed.search || parsed.hash)) {
    throw new Error("la URL base no debe incluir parámetros ni fragmentos");
  }
  return value;
}
