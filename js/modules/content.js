import { $$, paragraphs } from "../utils/dom.js";

const resolve = (data, path) => path.split(".").reduce((node, key) => node?.[key], data);

// Binds CMS page content to the markup:
//   data-content="home.hero.title"          -> textContent
//   data-content-paragraphs="nosotros.story.text" -> one <p> per paragraph
//   data-content-image="home.hero"           -> <img> using hero.image and hero.imageAlt
// The HTML keeps fallback text, so the page still reads well if the data fails to load.
export function bindContent(pages) {
  for (const element of $$("[data-content]")) {
    const value = resolve(pages, element.dataset.content);
    if (typeof value === "string" && value.trim()) element.textContent = value;
    else if (value === "" && element.dataset.optional !== undefined) element.hidden = true;
  }

  for (const element of $$("[data-content-paragraphs]")) {
    const value = resolve(pages, element.dataset.contentParagraphs);
    if (typeof value === "string" && value.trim()) element.replaceChildren(...paragraphs(value));
  }

  for (const element of $$("[data-content-image]")) {
    const block = resolve(pages, element.dataset.contentImage);
    const image = block?.image;
    if (!image?.src) continue;
    element.src = image.src;
    if (image.width) element.width = image.width;
    if (image.height) element.height = image.height;
    if (image.small && image.smallWidth) element.srcset = `${image.small} ${image.smallWidth}w, ${image.src} ${image.width}w`;
    else element.removeAttribute("srcset");
    element.alt = block.imageAlt ?? element.alt;
  }
}
