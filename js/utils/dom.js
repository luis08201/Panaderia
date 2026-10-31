export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Small element builder. Content always goes in as text nodes, never as HTML,
// so text coming from the CMS cannot inject markup.
export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") element.className = value;
    else if (key === "text") element.textContent = value;
    else if (key.startsWith("on")) element.addEventListener(key.slice(2).toLowerCase(), value);
    else element.setAttribute(key, value === true ? "" : value);
  }
  append(element, children);
  return element;
}

function append(element, children) {
  for (const child of children.flat(Infinity)) {
    if (child === undefined || child === null || child === false) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function icon(name, className = "icon") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `assets/icons/icons.svg#${name}`);
  svg.append(use);
  return svg;
}

// Image object from public-data: { src, small, width, height, smallWidth }.
export function img(image, { alt = "", sizes = "100vw", eager = false } = {}) {
  if (!image?.src) return null;
  const element = h("img", {
    src: image.src,
    alt,
    width: image.width,
    height: image.height,
    loading: eager ? "eager" : "lazy",
    decoding: "async",
    fetchpriority: eager ? "high" : undefined,
  });
  if (image.small && image.smallWidth && image.width) {
    element.srcset = `${image.small} ${image.smallWidth}w, ${image.src} ${image.width}w`;
    element.sizes = sizes;
  }
  return element;
}

// Plain text with blank lines -> <p> elements.
export function paragraphs(text, className) {
  return String(text ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => h("p", { class: className, text: part }));
}

export function setText(selector, value, root = document) {
  for (const element of $$(selector, root)) {
    if (value) element.textContent = value;
  }
}
