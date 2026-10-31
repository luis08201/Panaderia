// Scroll animations with GSAP + ScrollTrigger. The above-the-fold intro is plain CSS (global.css) so it plays
// at first paint; GSAP is fetched only after the window load event, so it never competes with the content.
// Anything rendered before GSAP arrives is left as is, except items still below the fold, which get revealed.
// The inline script in <head> adds html.motion only when the visitor allows motion.
// Hero and product photos are never scaled or faded: Chrome would log a new LCP when their size changes.

const root = document.documentElement;
const DESKTOP = window.matchMedia("(min-width: 992px)");
const SCRIPTS = ["gsap.min.js", "ScrollTrigger.min.js"].map((file) => new URL(`../../assets/vendor/gsap/${file}`, import.meta.url).href);
const REVEAL = ".section-head, .split, .info-card, .cta-band, .promo-list + .note, .demo-note, .values, .process";

let gsap;
let ScrollTrigger;
const pending = new Map();
const listTriggers = new WeakMap();

const wanted = () => root.classList.contains("motion");

const belowFold = (element) => {
  const rect = element.getBoundingClientRect();
  return rect.height > 0 && rect.top > window.innerHeight;
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

export function initMotion() {
  if (!wanted()) return;
  const load = () =>
    Promise.all(SCRIPTS.map(loadScript))
      .then(start)
      .catch(() => pending.clear());
  // A short wait after load keeps GSAP out of the critical path even when everything loads from cache.
  const later = () => setTimeout(load, 400);
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later, { once: true });
}

function start() {
  ({ gsap, ScrollTrigger } = window);
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });

  heroScroll();
  revealOnScroll(gsap.utils.toArray(REVEAL).filter((element) => !element.closest(".about-hero") && belowFold(element)));
  imageScroll();
  headerShadow();
  for (const [list, options] of pending) revealItems(list, { ...options, late: true });
  pending.clear();
  ScrollTrigger.refresh();
}

function heroScroll() {
  if (!document.querySelector(".hero__frame")) return;
  // .hero__media is taller than the frame (components.css), so moving it never uncovers an edge.
  gsap.to(".hero__media", {
    yPercent: 6,
    ease: "none",
    scrollTrigger: { trigger: ".hero__frame", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__content", {
    y: -40,
    opacity: 0.35,
    ease: "none",
    scrollTrigger: { trigger: ".hero__frame", start: "center center", end: "bottom top", scrub: true },
  });
}

function imageScroll() {
  for (const image of gsap.utils.toArray(".section .split__media img")) {
    if (image.closest(".about-hero")) continue;
    gsap.fromTo(
      image,
      { scale: 1.15 },
      { scale: 1, ease: "none", scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom center", scrub: true } }
    );
  }
}

function headerShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  ScrollTrigger.create({ start: 8, end: "max", onToggle: (self) => header.classList.toggle("is-scrolled", self.isActive) });
}

// Opacity and transform only (no visibility), so hidden items stay focusable; focusing one scrolls it in and reveals it.
function revealOnScroll(elements, { stagger = 0.08, y = 32 } = {}) {
  if (!elements.length) return [];
  gsap.set(elements, { opacity: 0, y });
  return ScrollTrigger.batch(elements, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger, overwrite: true }),
  });
}

// Call right after a list's children are rendered (same task), so the starting state is set before paint.
export function revealItems(list, { late = false, ...options } = {}) {
  if (!list || !wanted()) return;
  if (!gsap) {
    pending.set(list, options);
    return;
  }
  for (const trigger of listTriggers.get(list) ?? []) trigger.kill();
  // Items already painted before GSAP arrived stay as they are.
  const items = [...list.children].filter((item) => item.getAttribute("aria-hidden") !== "true" && (!late || belowFold(item)));
  listTriggers.set(list, revealOnScroll(items, { stagger: 0.07, y: 24, ...options }));
}

export function swapImage(container) {
  if (!gsap) return;
  gsap.fromTo(container.querySelector("img"), { opacity: 0.3, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.45 });
}

export function openMenu(nav) {
  if (!gsap || DESKTOP.matches) return;
  gsap.from(nav.querySelectorAll(".nav__link, .nav__cta"), { opacity: 0, y: -10, duration: 0.35, stagger: 0.04, overwrite: true });
}

export function refreshMotion() {
  ScrollTrigger?.refresh();
}
