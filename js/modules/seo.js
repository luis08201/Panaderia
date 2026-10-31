import { $, h } from "../utils/dom.js";

function setMetaContent(selector, attribute, key, value) {
  if (!value) return;
  let tag = $(selector);
  if (!tag) {
    tag = h("meta", { [attribute]: key });
    document.head.append(tag);
  }
  tag.setAttribute("content", value);
}

// Absolute URL for canonical/og tags, only when the final domain is configured in the CMS.
export function absoluteUrl(siteUrl, path = "") {
  if (!siteUrl) return "";
  return `${siteUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function setMeta({ title, description, image, path, siteUrl, noindex = false }) {
  if (title) {
    document.title = title;
    setMetaContent('meta[property="og:title"]', "property", "og:title", title);
  }
  if (description) {
    setMetaContent('meta[name="description"]', "name", "description", description);
    setMetaContent('meta[property="og:description"]', "property", "og:description", description);
  }
  if (image) setMetaContent('meta[property="og:image"]', "property", "og:image", absoluteUrl(siteUrl, image) || image);
  if (noindex) setMetaContent('meta[name="robots"]', "name", "robots", "noindex");

  const url = absoluteUrl(siteUrl, path ?? "");
  if (url && path !== undefined) {
    let link = $('link[rel="canonical"]');
    if (!link) {
      link = h("link", { rel: "canonical" });
      document.head.append(link);
    }
    link.href = url;
    setMetaContent('meta[property="og:url"]', "property", "og:url", url);
  }
}

export function addJsonLd(data) {
  document.head.append(h("script", { type: "application/ld+json", text: JSON.stringify(data) }));
}

// LocalBusiness data is only published once the business details are real.
export function addBusinessJsonLd(settings) {
  if (settings.demoNotice || !settings.seo?.siteUrl) return;
  addJsonLd({
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: settings.businessName,
    url: settings.seo.siteUrl,
    telephone: settings.phone || undefined,
    address: settings.address ? { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "NI" } : undefined,
    image: settings.seo.ogImage ? absoluteUrl(settings.seo.siteUrl, settings.seo.ogImage) : undefined,
    currenciesAccepted: "NIO",
  });
}
