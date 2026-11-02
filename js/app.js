import { initLanguage, t } from "./i18n.js";
import { bindContent } from "./modules/content.js";
import { getCategories, getProducts, getSite } from "./modules/data-loader.js";
import { initMotion, refreshMotion } from "./modules/motion.js";
import { applySettings, initMenu } from "./modules/navigation.js";
import { addBusinessJsonLd, setMeta } from "./modules/seo.js";
import { initSiteSearch } from './modules/site-search.js';
import { initDemoContacts } from './modules/demo-contacts.js';

const PAGES = {
  inicio: () => import("./modules/home.js"),
  catalogo: () => import("./modules/catalog.js"),
  producto: () => import("./modules/product-detail.js"),
  nosotros: () => import("./modules/about.js"),
  blog: () => import('./modules/blog.js'),
  article: () => import('./modules/blog.js'),
  search: () => import('./modules/site-search.js'),
};

const PATHS = { inicio: "", catalogo: "catalogo.html", nosotros: "nosotros.html", contacto: "contacto.html", blog: 'blog.html' };

async function start() {
  initLanguage();
  initMotion();
  initMenu();
  initSiteSearch();
  const page = document.body.dataset.page;
  // Start the page's data requests right away instead of after site.json.
  if (["inicio", "catalogo", "producto"].includes(page)) getProducts().catch(() => {});
  if (["inicio", "catalogo"].includes(page)) getCategories().catch(() => {});

  let site = null;
  try {
    site = await getSite();
    applySettings(site.settings);
    initDemoContacts(site.settings);
    bindContent(site.pages);
    if (page in PATHS) {
      const seo = site.settings.seo ?? {};
      const business = site.settings.businessName;
      setMeta({
        title: page === "inicio" ? seo.title : `${t(`page.${page}`)} · ${business}`,
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
