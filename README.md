# Crumb & Oven — HTML edition 0.2.0

Bilingual bakery, pastry-shop and café template with a product catalog, CMS Blog and WhatsApp inquiries. English and Spanish, USD prices, static HTML/CSS/JavaScript, and Pages CMS backed by GitHub. Informational catalog; payments, checkout and customer accounts are outside this edition.

## Start here

- Open `start-here.html` for the bilingual setup guide, or read [Buyer guide](docs/BUYER-GUIDE.md).
- See `template.html` for the edition overview and page previews.
- Run `npm run dev` with Node.js 22+; open http://127.0.0.1:47823.
- Run `npm test`, `npm run build`, then `node scripts/check-prerender.mjs` before publishing. Publish `dist/` only.
- Cloudflare Workers uses `wrangler.jsonc`; keep its build command enabled and use your own Worker name for another installation.

## Content and customization

Use `.pages.yml` with Pages CMS. Collections manage products, product categories, promotions, Blog posts and the four Blog categories. Settings, Home and About are file entries. Existing Spanish text can be edited in “Contenido en español”; new entity IDs require matching Spanish entries and fields. Shared interface text is in `js/i18n.js`; visual tokens are in `css/tokens.css`. See the buyer guide for logo, photos, contact, domain and currency details.

The ES/EN selector changes content with JavaScript and remembers the language. Direct `?lang=es` / `?lang=en` links are supported. Independent prerendered multilingual SEO routes are a separate extension. Webflow/Framer native editions are separate adaptations.

## Demo and buyer export

With the demo notice enabled, contact buttons show a local explanation instead of sending a message or dialing. Replace business details and translated settings before turning the notice off. Preview prices, availability, names and addresses are samples.

Run `npm run export:buyer` to create a separate source + static-build candidate in `release/`. It excludes demo photographs and evidence, rewrites photo paths to the original neutral placeholder and clears the preview's site URL. The hosted preview is unchanged. Run the exported copy, add your own licensed photographs and set your own domain before launch.

## Delivery documentation

- [Guía del comprador · Español](docs/BUYER-GUIDE.md)
- [Buyer guide · English](docs/BUYER-GUIDE.en.md)
- [Commercial license · one project](COMMERCIAL-LICENSE.md)
- [Support boundaries](docs/SUPPORT.md)
- [Distribution status and owner decisions](DISTRIBUTION.md)
- [Third-party notices](THIRD-PARTY.md)
- [Rights, AI assistance and reporting concerns](docs/RIGHTS.md)
- [Asset inventory](docs/ASSET-INVENTORY.csv)
- [Demo imagery: AI provenance and exclusions](docs/PHOTO-SOURCES.md)
- [Changelog](CHANGELOG.md)
- [Blog](docs/BLOG.md), [Search](docs/SEARCH.md), [Style guide](docs/STYLEGUIDE.md)

## Validation scope

FolklorCraft template support: **luismgnictech@gmail.com**, email only, for six months from purchase. The first-response target is two business days; see the complete support policy. Present the license/support terms, legal seller identification and sales-channel delivery/refund information before payment. Figma is excluded from this HTML edition.

Automated checks validate CMS content, safe URLs, blog categories/articles/pagination, localization, site search and generated product pages. Browser checks cover responsive headers, language switching, search/filter flows and local demo contacts. Lighthouse and accessibility scores from earlier previews are not current guarantees. Before a paid release, measure the final build on its actual host and complete the distribution decisions documented above.

## Structure

`content/` is the editable source, `public-data/` is generated browser data, and `dist/` is the published build. Product and Blog article HTML is generated during every build. `scripts/`, tests, CMS configuration and source content are not copied into the public build. `assets/images/` belongs to the hosted preview and is excluded from the buyer export.
