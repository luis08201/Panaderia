# Crumb & Oven — buyer guide

HTML edition 0.2.0, by FolklorCraft. [Guía en español](BUYER-GUIDE.md). Support: [luismgnictech@gmail.com](mailto:luismgnictech@gmail.com), email only.

## What you receive

HTML, CSS and JavaScript source; a prebuilt static `dist/` folder; Pages CMS configuration; English/Spanish demo content; 27 published sample products; 12 articles in four Blog categories; product and article templates; catalog and Blog filters; site-wide search; information pages; style guide and setup instructions. Prices use USD. This is an informational catalog with WhatsApp inquiries, without checkout, payments or customer accounts.

Figma and native Webflow/Framer editions are excluded. Hosting, domain names and third-party accounts are separate. Basic file-editing and static-site publishing skills are needed. Pages CMS simplifies editing existing content; code changes and new translation schemas require technical knowledge. Demo photographs are excluded; neutral placeholders are included instead.

## 1. Extract and preview

1. Extract the entire ZIP. Open the extracted folder that contains `package.json`.
2. Install Node.js 22 or newer (a supported LTS release) from https://nodejs.org/. Open a new terminal and check `node --version` and `npm --version`.
3. Open a terminal in the project folder. In Windows File Explorer, type `powershell` in that folder's address bar and press Enter.
4. Run `npm run dev`. No `npm install` is needed: this edition has no npm dependencies.
5. Wait for the build to complete. Open http://127.0.0.1:47823 in a browser. Keep the terminal open; use `Ctrl+C` to stop the server.

Open the HTTP address, rather than double-clicking `index.html`: the site fetches its content over HTTP. If PowerShell blocks `npm.ps1`, use `npm.cmd run dev`, `npm.cmd test` and `npm.cmd run build`. Do not weaken your security policy. If the port is already in use, run `$env:PORT=47824` before `npm run dev` in PowerShell; on macOS/Linux use `PORT=47824 npm run dev`.

## 2. Content and CMS

Use your own GitHub repository. Preserve hidden files, including `.pages.yml` and `.nvmrc`, when uploading the extracted source. Connect the repository to Pages CMS; `.pages.yml` defines the editing fields. Connect the publishing branch to your hosting provider so content commits trigger a rebuild.

| Change | Source |
|---|---|
| Business name, tagline, address, hours, WhatsApp, phone, social links and domain | Settings / `content/settings.json` |
| Home copy and media | Home / `content/pages/home.json` |
| About, values and process | About / `content/pages/nosotros.json` |
| Products, prices, categories and availability | Product and category collections |
| Promotions and expiry dates | Promotion collection |
| Articles and featured stories | Blog posts |
| Four Blog categories | Blog categories; All is an automatic filter |
| Spanish content | “Contenido en español” / `content/locales/es.json` |
| Shared visual design | `css/tokens.css` and `styleguide.html` |

Edit `content/`, not generated `public-data/` or `dist/`. Build output is replaced on every build. Test a sample edit in your own copy before connecting production accounts.

## 3. Languages

English is the base content. Edit existing Spanish entries in the CMS file entry “Contenido en español”. Keep IDs unchanged and preserve section/gallery order. Each new product or article needs a Spanish entry under its ID in `content/locales/es.json`; add matching fields to `.pages.yml` to expose that new entry in the CMS. Shared interface strings are in `js/i18n.js`. Missing translations fall back to English.

Test `?lang=en`, `?lang=es` and the language switch. Search covers both languages. The language switch uses JavaScript; independent prerendered language routes and multilingual SEO are not included. The technical style guide is in English.

## 4. Photos and branding

Replace `assets/placeholder.svg` references through the CMS with photographs you own or have permission to use. Update alternative text in both languages. Optimized WebP images are recommended. If using responsive `srcset`, provide a matching smaller image in `sm/` as described by the existing content model.

Change the business name and tagline in Settings and their translated equivalents. Replace the `oven` symbol in `assets/icons/icons.svg` and the favicon in `favicon.svg`. Header/footer marks share that symbol. Also review fallback text in HTML, `styleguide.html`, `template.html` and `start-here.html` to complete your rebranding.

## 5. Demo contacts and real contacts

Keep `demoNotice: true` until your business details are complete. In demo mode, phone and WhatsApp controls display a local notice instead of dialing or sending a message. The sample WhatsApp number `50500000000` remains a demo destination even when entered accidentally.

Set valid phone and WhatsApp numbers with country codes, address, opening hours, map URL and social links. Update the Spanish settings too. Turn the demo notice off, rebuild and check the actual link destinations before launch. The sample map points to Managua; replace it.

The bakery contact controls are part of your customer's website. They are not FolklorCraft's template-support channel.

## 6. Build and publish

Run these commands from the project root:

```text
npm test
npm run build
node scripts/check-prerender.mjs
```

Publish only the complete `dist/` folder. A local preview is not a deployment. Set your own domain in Settings → SEO → Site URL and rebuild to generate your canonical URLs and sitemap. The buyer export deliberately leaves this URL blank.

For Cloudflare Workers, use your own account and Worker name in `wrangler.jsonc`; keep `npm run build` as the build command and `dist/` as the assets directory. Other static hosts must also receive the full build, including generated product/article folders. Do not upload source `content/`, tests, scripts or credentials as public assets.

## 7. Currency and technical boundaries

This edition uses USD in both languages. Changing currency requires coordinated changes in `js/utils/currency.js`, `scripts/prerender-products.mjs`, `scripts/build-content.mjs`, content prices, translations, promotions and tests. Changing the visible symbol alone is insufficient. Extra currencies, checkout, account systems, new integrations and platform migrations are separate work.

## 8. Troubleshooting

| Symptom | Check |
|---|---|
| `node` or `npm` is not recognized | Install Node.js and reopen your terminal. |
| `package.json` or another file is not found | Open the terminal in the extracted project root. |
| `EADDRINUSE` | Use a different preview port, as described above. |
| Content is missing | Use the HTTP preview address and confirm that the build completed successfully. |
| Product/article deep links return 404 | Rebuild and publish the full `dist/` directory. |
| Content validation fails | Fix the first reported file/field error, then rebuild. Include the exact error in your support email if needed. |

## 9. License and support

Read `COMMERCIAL-LICENSE.md`, `docs/SUPPORT.md` and `THIRD-PARTY.md` with the listing accepted at purchase. The HTML license covers one project; six months of email-only support are included. Seller identification and sales-channel delivery/refund terms are provided with the purchase information. Support requests go to luismgnictech@gmail.com. Include an order reference, template version, URL or local-preview details, language/browser, reproduction steps and the exact error. Never send passwords, tokens or private customer data.
