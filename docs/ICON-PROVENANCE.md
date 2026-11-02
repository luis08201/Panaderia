# Icon provenance / procedencia de los iconos

Reviewed / Revisado: 2 November 2026. Applies to the updated HTML edition, not historical ZIPs, earlier commits or the excluded Figma draft.

## Why the existing artwork was replaced

The Git history records interface symbols in commit `4354129` and the earlier oven mark in `cce822d21a91f303b51df6b773b9514a36988c8b`. That establishes when they entered this repository, not the upstream origin or redistribution license of each drawing. No unsupported ownership assertion is made about those earlier files. Their artwork was replaced in the current deliverable.

El historial permite fechar la incorporación de los dibujos anteriores, pero no demuestra por sí solo su fuente ni licencia. Para cerrar esa incertidumbre se sustituyeron los símbolos de la entrega actual.

## Verified third-party source

Official repository: https://github.com/lucide-icons/lucide

Pinned commit: `4b203ec9b6002fd74fd5dadc8612220e64289305`.

| Template symbol | Lucide source |
|---|---|
| wheat | wheat.svg |
| whatsapp | message-circle.svg — generic messaging artwork |
| menu | menu.svg |
| close | x.svg |
| search | search.svg |
| clock | clock.svg |
| pin | map-pin.svg |
| phone | phone.svg |
| info | info.svg |
| share | share.svg |

The original files are stored unchanged in `assets/icons/lucide/`. `PROVENANCE.json` records their exact raw-source URLs and SHA-256 hashes. The complete upstream `LICENSE` is included, with both ISC terms and the MIT notice for Feather-derived icons. The [official license](https://lucide.dev/license) permits use, modification and distribution, including with a fee, provided the required notices remain. The template's resale restrictions do not revoke those independent icon-license permissions.

Se conserva la licencia completa junto con los SVG originales. No es necesario mostrar una atribución en cada botón; conserva los avisos dentro de los archivos distribuidos. No elimines la carpeta de licencia si redistribuyes el sprite.

## New custom brand mark

`scripts/build-icons.mjs` contains newly authored SVG geometry for a rectangular bakery oven, chimney, arched door and loaf. It generates `#oven`, `favicon.svg`, `assets/brand/oven-mark.svg` and `assets/brand/logo-alternative.svg`. The wordmark text remains editable and uses system-font names rather than imported outlined glyphs. No third-party vector artwork is used to generate this mark.

La geometría nueva del horno está definida directamente en el generador. Su procedencia queda documentada; esto no certifica exclusividad de derechos de autor ni registro/disponibilidad de marca.

## Reproduce and verify

Run `node scripts/build-icons.mjs` and then `npm test`. The provenance test compares local source hashes, complete license notices, generated sprite, favicon and downloadable mark files against the manifest. No external network is needed to rebuild the icon files from the included sources.

The buyer exporter copies `assets/`, including the original icon SVGs, license and provenance manifest. Demo photography remains excluded. Figma remains outside this HTML delivery and is not updated by this icon replacement.
