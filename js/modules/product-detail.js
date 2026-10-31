import { RELATED_LIMIT } from "../config.js";
import { hasPrice } from "../utils/currency.js";
import { $, h, icon, img, paragraphs } from "../utils/dom.js";
import { categoryUrl, loadError, priceBlock, productBadges, productCard, stateBlock } from "./cards.js";
import { getProducts } from "./data-loader.js";
import { revealItems, swapImage } from "./motion.js";
import { absoluteUrl, addJsonLd, setMeta } from "./seo.js";
import { productWhatsappUrl } from "./whatsapp.js";

let site = {};

export async function init(context) {
  site = context.site ?? {};
  await load();
}

async function load() {
  const root = $("#product-root");
  root.setAttribute("aria-busy", "true");
  const slug = new URLSearchParams(location.search).get("slug")?.trim() ?? "";
  try {
    const products = await getProducts();
    const product = products.find((p) => p.slug === slug);
    if (!product) renderNotFound(root, slug);
    else renderProduct(root, product, products);
  } catch {
    root.replaceChildren(h("div", { class: "container section" }, loadError(load)));
  } finally {
    root.removeAttribute("aria-busy");
  }
}

function renderNotFound(root, slug) {
  const business = site.settings?.businessName;
  setMeta({ title: `Producto no encontrado${business ? ` · ${business}` : ""}`, noindex: true });
  $("#breadcrumb-current").textContent = "Producto no encontrado";
  root.replaceChildren(
    h(
      "div",
      { class: "container not-found" },
      stateBlock({
        headingLevel: 1,
        title: "No encontramos este producto",
        text: slug
          ? "Es posible que ya no esté en el catálogo o que el enlace tenga un error. Revisa los productos disponibles."
          : "El enlace no indica qué producto quieres ver. Revisa los productos disponibles en el catálogo.",
        action: h("a", { class: "btn btn--primary", href: "catalogo.html" }, "Ir al catálogo"),
      })
    )
  );
}

function gallery(product) {
  const images = [product.image, ...product.gallery].filter((image) => image?.src);
  const main = h("div", { class: `product__main-image${product.available ? "" : " is-sold-out"}` });
  const show = (image, index) => {
    main.replaceChildren(
      img(image, {
        alt: index === 0 ? product.imageAlt : `${product.name}, foto ${index + 1} de ${images.length}`,
        sizes: "(min-width: 900px) 55vw, 100vw",
        eager: true,
      })
    );
  };
  show(images[0], 0);

  if (images.length < 2) return h("div", { class: "product__gallery" }, main);

  const buttons = images.map((image, index) =>
    h(
      "button",
      {
        type: "button",
        "aria-pressed": String(index === 0),
        "aria-label": `Ver foto ${index + 1} de ${images.length}`,
        onclick: (event) => {
          show(image, index);
          swapImage(main);
          for (const button of buttons) button.setAttribute("aria-pressed", String(button === event.currentTarget));
        },
      },
      img({ src: image.small || image.src }, { alt: "" })
    )
  );
  return h("div", { class: "product__gallery" }, main, h("ul", { class: "thumbs" }, buttons.map((button) => h("li", {}, button))));
}

function renderProduct(root, product, products) {
  const settings = site.settings ?? {};
  const contactUrl = productWhatsappUrl(settings.whatsapp, product);
  const business = settings.businessName ?? "";
  const description = product.seoDescription || product.shortDescription || product.description.slice(0, 155);

  setMeta({
    title: `${product.seoTitle || product.name}${business ? ` · ${business}` : ""}`,
    description,
    image: product.image?.src,
    siteUrl: settings.seo?.siteUrl,
    path: `producto.html?slug=${product.slug}`,
  });
  $("#breadcrumb-category").replaceChildren(h("a", { href: categoryUrl(product.category), text: product.category.name }));
  $("#breadcrumb-current").textContent = product.name;

  const status = product.available
    ? h("span", { class: "badge badge--available" }, "Disponible hoy")
    : h("span", { class: "badge badge--unavailable" }, "Agotado por hoy");
  const extraBadges = productBadges(product, { includeFeatured: true }).filter((b) => !b.classList.contains("badge--sold-out"));

  const details = [];
  if (product.ingredients.length) {
    details.push(h("div", {}, h("h2", { text: "Ingredientes" }), h("ul", { class: "tag-list" }, product.ingredients.map((item) => h("li", { text: item })))));
  }
  if (product.allergens.length) {
    details.push(
      h("div", {}, h("h2", { text: "Alérgenos" }), h("ul", { class: "tag-list tag-list--warning" }, product.allergens.map((item) => h("li", { text: item }))))
    );
  }

  const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, RELATED_LIMIT);

  root.replaceChildren(
    h(
      "div",
      { class: "container" },
      h(
        "article",
        { class: "product" },
        gallery(product),
        h(
          "div",
          { class: "product__info" },
          h("div", {}, h("a", { class: "product__category", href: categoryUrl(product.category), text: product.category.name }), h("h1", { text: product.name })),
          priceBlock(product, "price product__price"),
          h("div", { class: "product__status" }, status, extraBadges),
          product.shortDescription && h("p", { class: "product__lead", text: product.shortDescription }),
          h("div", { class: "product__description prose" }, paragraphs(product.description)),
          h(
            "div",
            { class: "product__actions" },
            contactUrl &&
              h(
                "a",
                { class: "btn btn--whatsapp", href: contactUrl, target: "_blank", rel: "noopener" },
                icon("whatsapp"),
                "Consultar por WhatsApp",
                h("span", { class: "visually-hidden", text: " (se abre en una pestaña nueva)" })
              ),
            h("a", { class: "btn btn--outline", href: categoryUrl(product.category) }, `Más de ${product.category.name.toLowerCase()}`)
          ),
          h(
            "p",
            { class: "availability-note" },
            icon("info"),
            h("span", {
              text:
                settings.availabilityNote ||
                "La disponibilidad es informativa y puede cambiar durante el día. Confírmala por WhatsApp.",
            })
          ),
          details.length ? h("div", { class: "details" }, details) : null
        )
      )
    ),
    related.length
      ? h(
          "section",
          { class: "section section--tint", "aria-labelledby": "related-title" },
          h(
            "div",
            { class: "container" },
            h("div", { class: "section-head" }, h("div", { class: "section-head__text" }, h("h2", { id: "related-title", text: "También te puede gustar" }))),
            h("ul", { class: "product-grid" }, related.map((p) => productCard(p, { whatsapp: settings.whatsapp })))
          )
        )
      : null
  );
  revealItems(root.querySelector(".product-grid"));

  if (!settings.demoNotice && settings.seo?.siteUrl) {
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description,
      image: absoluteUrl(settings.seo.siteUrl, product.image.src),
      category: product.category.name,
      offers: hasPrice(product.price)
        ? {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "NIO",
            availability: `https://schema.org/${product.available ? "InStock" : "OutOfStock"}`,
          }
        : undefined,
    });
  }
}

