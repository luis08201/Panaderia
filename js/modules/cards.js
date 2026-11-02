import { t } from "../i18n.js";
import { formatPrice, hasPrice } from "../utils/currency.js";
import { formatDate } from "../utils/dates.js";
import { h, icon, img } from "../utils/dom.js";
import { productWhatsappUrl } from "./whatsapp.js";

export const productUrl = (product) => `productos/${encodeURIComponent(product.slug)}/`;
export const categoryUrl = (category) => `catalogo.html?categoria=${encodeURIComponent(category.slug)}`;

export function productBadges(product, { includeFeatured = true } = {}) {
  const badges = [];
  if (!product.available) badges.push(h("span", { class: "badge badge--sold-out", text: t("badge.sold") }));
  if (product.newArrival) badges.push(h("span", { class: "badge badge--new", text: t("badge.new") }));
  if (includeFeatured && product.featured) badges.push(h("span", { class: "badge badge--featured", text: t("badge.featured") }));
  return badges;
}

export function priceBlock(product, className = "price") {
  return h(
    "p",
    { class: className },
    h("span", { class: `price__amount${hasPrice(product.price) ? "" : " price__amount--ask"}`, text: formatPrice(product.price) }),
    product.unit && h("span", { class: "price__unit", text: product.unit })
  );
}

const CARD_SIZES = "(min-width: 1280px) 290px, (min-width: 768px) 30vw, (min-width: 480px) 50vw, 100vw";

export function productCard(product, { whatsapp = "", headingLevel = 3, showFeatured = true } = {}) {
  const url = productUrl(product);
  const contactUrl = productWhatsappUrl(whatsapp, product);
  const badges = productBadges(product, { includeFeatured: showFeatured });

  return h(
    "li",
    {},
    h(
      "article",
      { class: `product-card${product.available ? "" : " is-sold-out"}` },
      h(
        "a",
        { class: "product-card__media", href: url, tabindex: "-1", "aria-hidden": "true" },
        img(product.image, { alt: "", sizes: CARD_SIZES }),
        badges.length ? h("span", { class: "product-card__badges" }, badges) : null
      ),
      h(
        "div",
        { class: "product-card__body" },
        h("p", { class: "product-card__category", text: product.category.name }),
        h(`h${headingLevel}`, { class: "product-card__name" }, h("a", { href: url, text: product.name })),
        product.shortDescription && h("p", { class: "product-card__text", text: product.shortDescription }),
        // Screen readers get the badges as text, since the image link is hidden from them.
        badges.length ? h("p", { class: "visually-hidden", text: badges.map((b) => b.textContent).join(", ") }) : null,
        h(
          "div",
          { class: "product-card__footer" },
          priceBlock(product),
          h(
            "div",
            { class: "product-card__actions" },
            h("a", { class: "btn btn--outline btn--sm", href: url, "aria-label": t("card.detailsFor", { name: product.name }) }, t("card.details")),
            contactUrl &&
              h(
                "a",
                {
                  class: "icon-btn",
                  href: contactUrl,
                  target: "_blank",
                  rel: "noopener",
                  "aria-label": t("card.whatsappFor", { name: product.name }),
                  title: t("card.whatsapp"),
                },
                icon("whatsapp")
              )
          )
        )
      )
    )
  );
}

export function categoryCard(category) {
  const count = category.productCount === 1 ? t("card.one") : t("card.many", { count: category.productCount });
  return h(
    "li",
    {},
    h(
      "a",
      { class: "category-card", href: categoryUrl(category) },
      h("span", { class: "category-card__media" }, img(category.image, { alt: "", sizes: "(min-width: 992px) 180px, 45vw" })),
      h("span", { class: "category-card__name" }, category.name, h("span", { class: "category-card__count", text: count }))
    )
  );
}

export function promoCard(promotion) {
  let dates = "";
  if (promotion.endDate) dates = t("promo.until", { date: formatDate(promotion.endDate) });
  else if (promotion.startDate) dates = t("promo.from", { date: formatDate(promotion.startDate) });

  return h(
    "li",
    {},
    h(
      "article",
      { class: "promo" },
      promotion.image ? h("div", { class: "promo__media" }, img(promotion.image, { alt: "", sizes: "(min-width: 768px) 280px, 100vw" })) : null,
      h(
        "div",
        { class: "promo__body" },
        dates && h("p", { class: "promo__dates", text: dates }),
        h("h3", { text: promotion.title }),
        promotion.description && h("p", { text: promotion.description }),
        promotion.linkUrl && h("a", { class: "link-arrow", href: promotion.linkUrl, text: promotion.linkLabel || t("promo.more") })
      )
    )
  );
}

export function skeletons(count, className = "skeleton skeleton--card") {
  return Array.from({ length: count }, () => h("li", { "aria-hidden": "true" }, h("div", { class: className })));
}

export function stateBlock({ title, text, action, variant = "", headingLevel = 2, role } = {}) {
  return h(
    "div",
    { class: `state${variant ? ` state--${variant}` : ""}`, role },
    h(`h${headingLevel}`, { text: title }),
    text && h("p", { text }),
    action
  );
}

export function loadError(onRetry, headingLevel = 2) {
  return stateBlock({
    variant: "error",
    role: "alert",
    headingLevel,
    title: t("error.title"),
    text: t("error.text"),
    action: h("button", { class: "btn btn--primary", type: "button", onclick: onRetry }, t("error.retry")),
  });
}
