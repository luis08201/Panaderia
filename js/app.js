import { PAGE_TITLES } from "./config.js";
import { bindContent } from "./modules/content.js";
import { getCategories, getProducts, getSite } from "./modules/data-loader.js";
import { initMotion, refreshMotion } from "./modules/motion.js";
import { applySettings, initMenu } from "./modules/navigation.js";
import { addBusinessJsonLd, setMeta } from "./modules/seo.js";

const PAGES = {
  inicio: () => import("./modules/home.js"),
  catalogo: () => import("./modules/catalog.js"),
  producto: () => import("./modules/product-detail.js"),
  nosotros: () => import("./modules/about.js"),
  blog: () => import('./modules/blog.js'),
  article: () => import('./modules/blog.js'),
};

const PATHS = { inicio: "", catalogo: "catalogo.html", nosotros: "nosotros.html", contacto: "contacto.html", blog: 'blog.html' };

async function start() {
  initMotion();
  initMenu();
  const page = document.body.dataset.page;
  // Start the page's data requests right away instead of after site.json.
  if (["inicio", "catalogo", "producto"].includes(page)) getProducts().catch(() => {});
  if (["inicio", "catalogo"].includes(page)) getCategories().catch(() => {});

  let site = null;
  try {
    site = await getSite();
    applySettings(site.settings);
    bindContent(site.pages);
    if (page in PATHS) {
      const seo = site.settings.seo ?? {};
      const business = site.settings.businessName;
      setMeta({
        title: page === "inicio" ? seo.title : `${PAGE_TITLES[page]} · ${business}`,
        description: page === "inicio" ? seo.description : undefined,
        image: seo.ogImage,
        siteUrl: seo.siteUrl,
        path: PATHS[page],
      });
    }
    if (page === "inicio") addBusinessJsonLd(site.settings);
  } catch (error) {
    // The static HTML already has fallback content; page modules show their own error states.
    console.warn(error);
  }

  const loadPage = PAGES[page];
  if (loadPage) {
    const module = await loadPage();
    await module.init({ site });
  }
  refreshMotion();
}

start();
