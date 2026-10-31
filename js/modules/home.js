import { FEATURED_LIMIT } from "../config.js";
import { isCurrent } from "../utils/dates.js";
import { $ } from "../utils/dom.js";
import { categoryCard, loadError, productCard, promoCard } from "./cards.js";
import { getCategories, getProducts, getPromotions } from "./data-loader.js";
import { revealItems } from "./motion.js";

export async function init({ site }) {
  const whatsapp = site?.settings?.whatsapp;
  await Promise.all([renderCategories(), renderProducts(whatsapp), renderPromotions()]);
}

async function renderCategories() {
  const list = $("#category-list");
  try {
    const categories = await getCategories();
    list.replaceChildren(...categories.filter((c) => c.productCount > 0).map(categoryCard));
    revealItems(list, { stagger: 0.06 });
  } catch {
    list.replaceChildren(loadError(renderCategories, 3));
  }
}

async function renderProducts(whatsapp) {
  const featuredList = $("#featured-list");
  const freshList = $("#fresh-list");
  try {
    const products = await getProducts();
    const featured = products.filter((p) => p.featured).slice(0, FEATURED_LIMIT);
    const fresh = products.filter((p) => p.newArrival).slice(0, 4);

    featuredList.replaceChildren(...featured.map((p) => productCard(p, { whatsapp, showFeatured: false })));
    $("#destacados").hidden = !featured.length;

    freshList.replaceChildren(...fresh.map((p) => productCard(p, { whatsapp, showFeatured: false })));
    $("#recien-horneados").hidden = !fresh.length;
    revealItems(featuredList);
    revealItems(freshList);
  } catch {
    featuredList.replaceChildren(loadError(() => renderProducts(whatsapp), 3));
    $("#recien-horneados").hidden = true;
  }
}

async function renderPromotions() {
  const section = $("#promociones");
  try {
    const promotions = (await getPromotions()).filter((promotion) => isCurrent(promotion));
    $("#promo-list").replaceChildren(...promotions.map(promoCard));
    section.hidden = !promotions.length;
    revealItems($("#promo-list"));
  } catch {
    section.hidden = true;
  }
}
