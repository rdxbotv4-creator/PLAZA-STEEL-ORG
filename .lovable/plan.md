# Plaza Steel & Crockery — Rate List Website

## What you get

**1. Public rate list (home page)**
- Search any item by name or code; shows only the **sale rate** (cost stays hidden).
- Category filter (Diner Set, Cooker, Blender, Cooler… all 110 categories from your file).
- "Budget" box: pick a category and type an amount (e.g. 10000) to see every item at or under that price.
- Big WhatsApp button + number **+92 546501637** for orders.

**2. West Point page**
- Only West Point (WP) items, searchable.
- Each item shows **available quantity** and a **Buy Now** button that opens WhatsApp with that item pre-filled.

**3. Estimate bill maker**
- Add any items to a bill, change quantity.
- Change the price of any line by hand.
- Give discount as a percentage or as a fixed amount.
- Live total; print / save the estimate and send it on WhatsApp.

**4. Admin portal (private)**
- Login with username `adminplaza`, password `34402`.
- Full stock view: cost, sale rate, profit margin, quantity in hand, category, brand, vendor.
- Search, category filter, low-stock highlighting, and export.
- Cost figures are only sent after a correct login — they are never inside the public pages.

**5. Your list folder**
- A `list/` folder in the project root holds the rate list files.
- Drop a new JSON file in there (same shape as `ALL_STOCK.json`) and the whole site — public, West Point, estimate and admin — updates from it. Newer files override older ones by item code.
- `ALL_STOCK.json` (1,317 items) goes in as the starting list. Your file is missing its outer brackets and repeats the `description` key for the supplier name, so the loader is written to tolerate both: first `description` = product name, second = vendor.

**6. Design**
- Your PLAZA logo as the site logo and the browser icon (favicon).
- Deep steel-grey and chrome surfaces with the logo's red/gold as accents.
- Animated glow on the logo and buttons, 3D tilt on product cards, shine sweep on the header, soft float and reveal-on-scroll animations.
- Small floating WhatsApp button crediting **SARDAR RDX — Website Creator, +92 330 1068874**.

## Technical notes

- Route files: `src/routes/index.tsx` (public list), `westpoint.tsx`, `estimate.tsx`, `admin.tsx`, plus a login gate.
- `list/*.json` is read through a server-only module (`import.meta.glob`), merged and normalised (numbers coerced, WP detection by `code` prefix, category/brand normalised). Public pages receive a payload with `cost` and `vendor` stripped; admin receives the full record after auth.
- Admin auth: `createServerFn` + encrypted session cookie, timing-safe compare, credentials stored as server-only secrets (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, plus a generated `SESSION_SECRET`). No password in the browser bundle.
- Estimate builder is client state only (no database needed).
- Design tokens (colors, gradients, glow shadows, animations) defined in `src/styles.css`; no hardcoded colors in components.
- Deployment: the project builds on Lovable hosting as-is. For Vercel I will add a Vercel build/output config and note the two environment variables you must set there (`ADMIN_PASSWORD`, `SESSION_SECRET`), since a Vercel deploy needs those set in Vercel's dashboard. If the Vercel preset conflicts with the Lovable preview build, I will keep the preview working and hand you the exact Vercel settings instead.
