import { PAGE_TITLES } from "../config.js";
import { $, h } from "../utils/dom.js";
import { normalize } from "../utils/normalize.js";
import { loadError, productCard, skeletons, stateBlock } from "./cards.js";
import { getCategories, getProducts } from "./data-loader.js";
import { SORT_OPTIONS, filterProducts, sortProducts } from "./filters.js";
import { setMeta } from "./seo.js";

const state = { query: "", category: "", order: "recomendados" };
let products = [];
let categories = [];
let whatsapp = "";
let siteSettings = {};

const elements = {};

export async function init({ site }) {
  whatsapp = site?.settings?.whatsapp ?? "";
  siteSettings = site?.settings ?? {};
  elements.search = $("#search");
  elements.sort = $("#sort");
  elements.chips = $("#category-chips");
  elements.grid = $("#product-list");
  elements.status = $("#results-status");
  elements.clear = $("#clear-filters");

  elements.sort.replaceChildren(...SORT_OPTIONS.map((option) => h("option", { value: option.value, text: option.label })));
  readUrl();
  elements.search.value = state.query;
  elements.sort.value = state.order;

  let timer;
  elements.search.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => update({ query: elements.search.value }), 150);
  });
  $("#catalog-search").addEventListener("submit", (event) => {
    event.preventDefault();
    clearTimeout(timer);
    update({ query: elements.search.value });
  });
  elements.sort.addEventListener("change", () => update({ order: elements.sort.value }));
  elements.clear.addEventListener("click", resetFilters);
  window.addEventListener("popstate", () => {
    readUrl();
    elements.search.value = state.query;
    elements.sort.value = state.order;
    render();
  });

  await load();
}

async function load() {
  elements.grid.replaceChildren(...skeletons(8));
  elements.grid.setAttribute("aria-busy", "true");
  elements.status.textContent = "Cargando productos…";
  try {
    [products, categories] = await Promise.all([getProducts(), getCategories()]);
    categories = categories.filter((category) => category.productCount > 0);
    if (state.category && !categories.some((c) => c.slug === state.category)) state.category = "";
    render();
  } catch {
    elements.chips.replaceChildren();
    elements.status.textContent = "";
    elements.clear.hidden = true;
    elements.grid.replaceChildren(h("li", { class: "catalog-state" }, loadError(load)));
  } finally {
    elements.grid.removeAttribute("aria-busy");
  }
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  state.category = normalize(params.get("categoria") ?? "");
  state.query = params.get("q") ?? "";
  const order = params.get("orden");
  state.order = SORT_OPTIONS.some((option) => option.value === order) ? order : "recomendados";
}

function writeUrl() {
  const params = new URLSearchParams();
  if (state.category) params.set("categoria", state.category);
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.order !== "recomendados") params.set("orden", state.order);
  const query = params.toString();
  history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
}

function update(changes) {
  Object.assign(state, changes);
  writeUrl();
  render();
}

function resetFilters() {
  elements.search.value = "";
  update({ query: "", category: "" });
  elements.search.focus();
}

function renderChips() {
  const matching = filterProducts(products, { query: state.query });
  const countFor = (slug) => (slug ? matching.filter((p) => p.category.slug === slug).length : matching.length);
  const chip = (slug, label) =>
    h(
      "button",
      {
        class: "chip",
        type: "button",
        "aria-pressed": String(state.category === slug),
        onclick: () => update({ category: slug }),
      },
      label,
      h("span", { class: "chip__count", text: `(${countFor(slug)})` })
    );
  elements.chips.replaceChildren(
    h("legend", { class: "visually-hidden", text: "Filtrar por categoría" }),
    chip("", "Todos"),
    ...categories.map((category) => chip(category.slug, category.name))
  );
  const active = elements.chips.querySelector('[aria-pressed="true"]');
  if (active) elements.chips.scrollLeft = Math.max(0, active.offsetLeft - elements.chips.offsetLeft - 16);
}

function render() {
  renderChips();
  const visible = sortProducts(filterProducts(products, state), state.order);
  const category = categories.find((c) => c.slug === state.category);
  const filtered = Boolean(state.query.trim() || state.category);

  if (visible.length) {
    elements.grid.replaceChildren(...visible.map((product) => productCard(product, { whatsapp, headingLevel: 2 })));
  } else {
    elements.grid.replaceChildren(
      h(
        "li",
        { class: "catalog-state" },
        stateBlock({
          title: "No encontramos productos",
          text: state.query.trim()
            ? `No hay resultados para «${state.query.trim()}»${category ? ` en ${category.name}` : ""}. Prueba con otra palabra o revisa todas las categorías.`
            : "Esta categoría no tiene productos publicados por ahora.",
          action: h("button", { class: "btn btn--primary", type: "button", onclick: resetFilters }, "Ver todos los productos"),
        })
      )
    );
  }

  const count = visible.length === 1 ? "1 producto" : `${visible.length} productos`;
  const where = category ? ` en ${category.name}` : "";
  const search = state.query.trim() ? ` para «${state.query.trim()}»` : "";
  elements.status.textContent = `${count}${where}${search}`;
  elements.clear.hidden = !filtered;

  const title = category ? `${category.name} · ${PAGE_TITLES.catalogo}` : PAGE_TITLES.catalogo;
  setMeta({
    title: `${title} · ${siteSettings.businessName ?? ""}`.replace(/ · $/, ""),
    description: category?.description,
    siteUrl: siteSettings.seo?.siteUrl,
    path: category ? `catalogo.html?categoria=${category.slug}` : "catalogo.html",
  });
}
