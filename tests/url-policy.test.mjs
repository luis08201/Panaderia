import test from "node:test";
import assert from "node:assert/strict";
import { validateContentUrl } from "../scripts/url-policy.mjs";

test("allows safe relative URLs used by catalog CTAs", () => {
  assert.equal(validateContentUrl("catalogo.html?categoria=pan-dulce"), "catalogo.html?categoria=pan-dulce");
  assert.equal(validateContentUrl("contacto.html#horarios"), "contacto.html#horarios");
  assert.equal(validateContentUrl("/catalogo.html"), "/catalogo.html");
});

test("allows HTTPS for external social, map and SEO links", () => {
  assert.equal(validateContentUrl("https://www.google.com/maps/search/?api=1"), "https://www.google.com/maps/search/?api=1");
  assert.equal(validateContentUrl("https://example.com/", { externalOnly: true, siteBase: true }), "https://example.com/");
  assert.equal(validateContentUrl(""), "");
});

test("rejects executable and unsafe URL schemes", () => {
  for (const value of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,hello", "file:///etc/passwd", "//evil.example", "#", "catalogo.html\\evil", "catalogo.html\nfoo"]) {
    assert.throws(() => validateContentUrl(value), value);
  }
});

test("rejects parent-directory traversal in CMS paths", () => {
  for (const value of ["../secrets", "assets/../secrets", "/assets/../../config"]) {
    assert.throws(() => validateContentUrl(value), value);
  }
});

test("requires HTTPS absolute URLs for external fields", () => {
  for (const value of ["http://example.com", "contacto.html", "mailto:test@example.com"]) {
    assert.throws(() => validateContentUrl(value, { externalOnly: true }), value);
  }
});

test("rejects credentials and SEO base URL query strings", () => {
  assert.throws(() => validateContentUrl("https://user:password@example.com"));
  assert.throws(() => validateContentUrl("https://example.com/?q=test", { externalOnly: true, siteBase: true }));
});
