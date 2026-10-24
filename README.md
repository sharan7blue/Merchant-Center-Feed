# FeedCraft — Free Google Merchant Center Feed Doctor & AI Optimizer

> **Find out why Google is rejecting your products — and fix it in 60 seconds. Free.**

FeedCraft is an open-source, client-side web application designed to help e-commerce merchants, agencies, and Google Shopping / PMax managers audit, clean, enrich, and convert product feeds into Google Merchant Center (GMC) compliant feeds and OpenAI Agentic Commerce shopping feeds.

Runs 100% locally in your browser. Your catalog data never leaves your device unless you explicitly opt in to the optional Gemini AI rewrite feature.

---

## 🚀 Key Features

- **Instant GMC Feed Audit & Health Score:**
  - Calculates an overall Feed Health Score (0–100) and per-product scores.
  - Detects critical disapprovals: missing required attributes (`id`, `title`, `description`, `price`, `availability`, `link`, `image_link`), invalid price formats (`12.99 USD`), invalid availability values, and GTIN checksum failures.
  - Warns on policy risks: promotional titles ("FREE SHIPPING", "BEST SELLER"), all-caps text, HTML in descriptions, missing categories, and missing apparel attributes (`color`, `gender`, `age_group`, `size`).

- **Rule-Based Smart Fix (1-Click Auto-Fix):**
  - **Title Formula:** Reconstructs titles adhering to Google Shopping best practices (`Brand + Product Type + Color + Material + Size`).
  - **Attribute Extraction:** Automatically extracts color and material from descriptions and titles.
  - **Category Mapping:** Maps products to the official Google Product Taxonomy.
  - **Data Normalization:** Formats prices, cleans HTML, fixes `http` to `https`, and sets compliant `identifier_exists` logic.

- **✨ Optional AI Rewrite (Google Gemini):**
  - Bring your own Gemini API key (free from Google AI Studio).
  - Uses `gemini-2.5-flash` to craft high-converting Shopping titles without hallucinating facts.
  - Infers nuanced categories and apparel demographics directly from raw product copy.

- **Multi-Format Export Studio:**
  1. **Google Supplemental Feed (TSV)** — Safely overrides titles, categories, and attributes in GMC Next by `id` without overwriting or breaking live Shopify/WooCommerce inventory and price syncs.
  2. **Full Google Primary Feed (TSV)** — Standard complete product catalog feed.
  3. **OpenAI / ChatGPT Merchant Feed (TSV & JSONL)** — Strictly compliant with OpenAI's Agentic Commerce Product Feed specifications (`item_id`, `url`, `image_url`, `seller_name`, `is_eligible_search`, `is_eligible_checkout`).

---

## 🛠️ Quick Start

FeedCraft requires **no build step, no npm install, and no backend server**.

1. Clone or download this repository:
   ```bash
   git clone https://github.com/sharan7blue/Merchant-Center-Feed.git
   cd Merchant-Center-Feed
   ```
2. Open `index.html` directly in any modern browser (Chrome, Safari, Edge, Firefox):
   - On macOS: `open index.html`
   - Or serve with any static server: `npx serve .` / `python3 -m http.server 8080`

3. The app loads with sample e-commerce data pre-audited so you can see the before/after results immediately.
4. Drag and drop your own store's CSV/TSV export to audit your live catalog.

---

## 📋 Google Merchant Center Setup Guide

To apply fixes without breaking your store's live inventory or price syncing:
1. Fix your feed in FeedCraft and select **Google Supplemental Feed (TSV)**.
2. Click **Download file** (saves as `gmc-supplemental-feed.tsv`).
3. Log in to [Google Merchant Center](https://merchants.google.com/).
4. Navigate to **Products** > **Data sources**.
5. Under **Supplemental sources**, click **Add supplemental source** and upload your TSV.
6. Google will automatically overlay the optimized titles and attributes onto your primary feed by matching the `id` column.

---

## 🔒 Privacy & Security

- **Client-Side Processing:** File parsing, auditing, transformation, and exports are executed entirely in JavaScript in your browser memory.
- **Zero Telemetry / Zero Storage:** No cookies, trackers, or remote database storage.
- **AI Privacy:** Your Gemini API key is stored only in tab memory (never in `localStorage`). Catalog data is only sent to Google's Gemini API when you explicitly click "Rewrite with AI".

---

## 📄 License

MIT License. Free to use, modify, and distribute.
