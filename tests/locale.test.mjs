import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { EN, ES } from "../js/i18n.js";
import { applyEntity } from "../js/locale-data.js";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));

test("spanish overlay replaces text, keeps the price and drops the es payload", () => {
  const product = { id: "prd-019", name: "Butter Croissant", price: 1.64, unit: "Each", category: { slug: "reposteria", name: "Pastry" }, es: { name: "Croissant de mantequilla", unit: "Unidad", category: { name: "Repostería" } } };
  const spanish = applyEntity(product, undefined, "es");
  assert.equal(spanish.name, "Croissant de mantequilla");
  assert.equal(spanish.unit, "Unidad");
  assert.equal(spanish.category.name, "Repostería");
  assert.equal(spanish.category.slug, "reposteria");
  assert.equal(spanish.price, 1.64);
  assert.equal(spanish.es, undefined);
  assert.equal(applyEntity(product).name, "Butter Croissant");
});

test("english and spanish interface dictionaries use the same keys", () => {
  assert.deepEqual(Object.keys(ES).sort(), Object.keys(EN).sort());
});

test("every published content entry has a Spanish name or title", () => {
  const es = read("content/locales/es.json");
  for (const file of readdirSync("content/products")) {
    const product = read(`content/products/${file}`);
    assert.ok(es.products[product.id]?.name, product.id);
  }
  for (const file of readdirSync("content/categories")) {
    const category = read(`content/categories/${file}`);
    assert.equal(es.categories[category.id].name.length > 0, true);
  }
  for (const file of readdirSync("content/blog-posts")) {
    const post = read(`content/blog-posts/${file}`);
    const copy = es.blogPosts[post.id];
    assert.equal(copy.sections.length, post.sections.length, post.id);
    assert.ok(copy.title && copy.introduction);
  }
});
