# Default language and currency — Crumb & Oven

The commercial starter template uses **English (United States)** and **USD** by default.

## Original price conversion

The original demo prices were entered in Nicaraguan córdobas (NIO). They were converted once, not dynamically, using the **Central Bank of Nicaragua (BCN) official 2026 exchange rate**:

- **1 USD = 36.6243 NIO**
- **Formula:** `USD = round(NIO / 36.6243, 2)`
- **Source:** https://bcn.gob.ni/node/10376
- **Conversion date:** November 1, 2026
- **Rounding:** nearest US cent, standard mathematical rounding.

Examples: C$25 → $0.68; C$70 → $1.91; C$750 → $20.48.

These are **demo prices only**, not US market prices. The buyer must set prices, tax, location, and contact details for their own business. Historical NIO amounts are preserved in Git history; the published product JSON stores USD values only.

## Platform migration

- HTML/JS: `js/config.js`, `js/utils/currency.js`, `content/products/*.json`, and `.pages.yml`.
- Webflow: use Webflow CMS product price fields in USD and native locale-aware price formatting.
- Framer: use Framer CMS product price fields in USD and native localization.

Product slugs and internal CMS IDs remain unchanged to preserve existing links and references. The demo business location and baking schedule are still sample data from Nicaragua and should be replaced by each buyer.
