import { $, h, img } from "../utils/dom.js";
import { revealItems } from "./motion.js";

export function init({ site }) {
  const page = site?.pages?.nosotros;
  if (!page) return;

  const values = (page.values ?? []).filter((item) => item?.title);
  if (values.length) {
    $("#values-list").replaceChildren(...values.map((item) => h("li", { class: "value" }, h("h3", { text: item.title }), h("p", { text: item.text }))));
  }

  const steps = (page.process ?? []).filter((item) => item?.title);
  if (steps.length) {
    $("#process-list").replaceChildren(...steps.map((item) => h("li", {}, h("h3", { text: item.title }), h("p", { text: item.text }))));
  }

  const photos = (page.gallery ?? []).filter((item) => item?.image?.src);
  $("#galeria").hidden = !photos.length;
  $("#gallery-list").replaceChildren(
    ...photos.map((item) => h("li", {}, img(item.image, { alt: item.alt ?? "", sizes: "(min-width: 992px) 33vw, (min-width: 600px) 50vw, 100vw" })))
  );
  revealItems($("#gallery-list"));
}
