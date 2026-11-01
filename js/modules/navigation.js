import { $, $$, h, setText } from "../utils/dom.js";
import { openMenu } from "./motion.js";
import { whatsappUrl } from "./whatsapp.js";

const DESKTOP = window.matchMedia("(min-width: 992px)");

export function initMenu() {
  const toggle = $(".nav-toggle");
  const nav = $("#menu");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".nav-toggle__label").textContent = open ? "Close" : "Menu";
    nav.classList.toggle("is-open", open);
    if (open) openMenu(nav);
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setOpen(false);
  });
  DESKTOP.addEventListener("change", () => setOpen(false));

  const page = document.body.dataset.page;
  for (const link of $$(".nav__link")) {
    if (link.dataset.nav === page || (page === "producto" && link.dataset.nav === "catalogo") || (page === 'article' && link.dataset.nav === 'blog')) {
      link.setAttribute("aria-current", "page");
    }
  }
}

function renderAnnouncement(announcement) {
  const bar = $("#announcement");
  if (!bar) return;
  if (!announcement?.enabled || !announcement.text) {
    bar.hidden = true;
    return;
  }
  const inner = $(".announcement__inner", bar);
  inner.replaceChildren(
    h("p", { text: announcement.text }),
    announcement.linkUrl && announcement.linkLabel ? h("a", { href: announcement.linkUrl, text: announcement.linkLabel }) : null
  );
  bar.hidden = false;
}

export function hoursList(hours = []) {
  return h(
    "ul",
    { class: "hours" },
    hours.filter((row) => row?.days).map((row) => h("li", {}, h("span", { text: row.days }), h("span", { text: row.time })))
  );
}

export function socialLinks(social = []) {
  return social.filter((item) => item?.url && item?.network);
}

export function telHref(phone) {
  const digits = String(phone ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

// Fills the header, footer and every [data-site] / [data-whatsapp] placeholder with the CMS settings.
export function applySettings(settings) {
  setText("[data-site='businessName']", settings.businessName);
  setText("[data-site='tagline']", settings.tagline);
  setText("[data-site='address']", settings.address);
  setText("[data-site='availabilityNote']", settings.availabilityNote);
  renderAnnouncement(settings.announcement);

  const generalChat = whatsappUrl(settings.whatsapp, settings.whatsappMessage || "Hi! I would like more information.");
  for (const link of $$("[data-whatsapp]")) {
    if (generalChat) link.href = generalChat;
    else (link.closest("[data-whatsapp-wrapper]") ?? link).remove();
  }

  for (const link of $$("[data-site='phone']")) {
    const href = telHref(settings.phone);
    if (href) {
      link.href = href;
      link.textContent = settings.phone;
    } else link.closest("li, p")?.remove();
  }

  for (const link of $$("[data-site='maps']")) {
    if (settings.mapsUrl) link.href = settings.mapsUrl;
    else link.remove();
  }

  for (const slot of $$("[data-site='hours']")) slot.replaceChildren(hoursList(settings.hours));

  for (const slot of $$("[data-site='social']")) {
    const links = socialLinks(settings.social);
    slot.replaceChildren(
      ...(links.length
        ? links.map((item) => h("li", {}, h("a", { href: item.url, target: "_blank", rel: "noopener", text: item.network })))
        : [h("li", { class: "muted", text: "Social links coming soon" })])
    );
  }

  for (const note of $$("[data-demo-note]")) note.hidden = !settings.demoNotice;
  setText("[data-site='year']", String(new Date().getFullYear()));
}

