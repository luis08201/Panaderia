# Third-party resources

## Scope

The revised local demo uses illustrative AI-generated imagery. The 32 original outputs were generated from text with the built-in OpenAI image_gen tool, without reference photographs, then optimized into 92 WebP files including responsive and Blog/category copies. `docs/AI-IMAGE-PROVENANCE.json` records prompts, dates, tool and hashes. `docs/PHOTO-SOURCES.md` explains this image set and the private historical archive.

The legacy Unsplash-linked photographs were replaced in the local source, including derivatives. This does not itself deploy the website or settle rights for historical releases. AI generation is not a guarantee of exclusivity, public-domain status or non-infringement. The buyer export still excludes all demo images and supplies neutral placeholders; buyers provide their own properly licensed photos. See `docs/RIGHTS.md` for rights reporting.

## Fonts

- Inter: locally served `assets/fonts/inter-latin.woff2`. Original upstream license notice is bundled as `assets/fonts/inter-OFL.txt`, retrieved from the Google Fonts `ofl/inter/OFL.txt` record.
- Playfair Display: locally served upright and italic WOFF2 files. Original upstream notice is `assets/fonts/playfair-display-OFL.txt`, retrieved from Google Fonts `ofl/playfairdisplay/OFL.txt`.

Preserve the notices when redistributing these fonts. The files here identify the intended font families; verify their binary provenance and any marketplace-specific packaging conditions before a paid release.

## Animation library

GSAP 3.15.0 and ScrollTrigger retain their copyright and license headers in `assets/vendor/gsap/`. The headers refer to https://gsap.com/standard-license. Their use and redistribution follow that license, separately from the template's own commercial terms. Preserve these headers. Review the current license and marketplace requirements before bundling the library for paid distribution.

Review reference (2 November 2026): the [official standard license](https://gsap.com/community/standard-license/) permits commercial website implementation and reproduction for permitted uses, retains ownership/notices, and restricts competing visual-animation builders. This HTML catalog implements website animations; it is not a visual-animation authoring tool. The license remains separate from FolklorCraft's one-project license.

## Icons and original assets

The interface symbols were replaced on 2 November 2026 with Lucide SVG sources pinned to commit `4b203ec9b6002fd74fd5dadc8612220e64289305` from https://github.com/lucide-icons/lucide. The ten original SVG files and the complete upstream license are retained in `assets/icons/lucide/`. Lucide uses ISC; its license also includes the required MIT notices for Feather-derived icons. Preserve the complete `assets/icons/lucide/LICENSE` when redistributing the sprite or source assets. These third-party icons retain those permissions independently of FolklorCraft's template license.

`assets/icons/PROVENANCE.json` records the exact source URL, SHA-256 and license path for each imported icon. `scripts/build-icons.mjs` generates the sprite while preserving the existing symbol IDs. The `whatsapp` symbol now contains the generic Lucide `message-circle` icon, rather than a WhatsApp brand logo. The label/link still identifies the WhatsApp inquiry feature; the generic artwork does not imply brand endorsement.

The oven mark was newly generated as basic SVG code with AI assistance in Codex and reviewed in `scripts/build-icons.mjs`. The same source generates the sprite mark, favicon, downloadable oven mark and editable-text wordmark. No external vector source was imported for that mark. The neutral photo placeholder is custom SVG code created with AI assistance for this delivery. This provenance record is not trademark clearance or a certification of exclusive copyright. AI assistance is disclosed; it does not convert third-party materials into public-domain assets.

See `docs/ICON-PROVENANCE.md` for the replacement decision and verification steps.

## Inventory

`docs/ASSET-INVENTORY.csv` records paths, SHA-256 hashes and preview/package status for the current assets. Matching hashes help trace copied blog/category images to their source files. No photo rights are transferred by this inventory.
