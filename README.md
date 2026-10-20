# Shraddha Ki Dhara

Royal, spiritual puja-kit website. Next.js 15 (static export) · React 19 · Tailwind 4 · Decap CMS.
English and Hindi, orders through WhatsApp, advance payment by UPI, and a no-code admin panel at `/admin/`.

## Run it
```bash
npm install
npm run dev          # site on http://localhost:3000
npm run dev:cms      # site + CMS on your computer: http://localhost:3000/admin/ (no login needed)
npm run check        # type check + tests
npm run build        # static site in ./out
```
`npm run dev` and `npm run build` first run `prepare:content`, which turns everything edited in the CMS (`content/`)
into `src/generated/` and copies the CMS app into `public/admin/`. A mistake in the content stops the build with a plain message.

## Where things live
| What | Where | Edited by |
|---|---|---|
| Puja kits (name, Hindi name, photo, 3 prices, contents, visibility, order) | `content/products/*.json` | CMS → **Puja Kits** |
| WhatsApp, UPI, notice hours, advance %, delivery pincodes | `content/settings/site.json` | CMS → Website Content → **Site details** |
| Add-ons, videos, reviews, daily mantras, festival countdown, gallery photos | `content/settings/*.json` | CMS → **Website Content** |
| Categories (shared by site and CMS form) | `src/lib/categories.json` + `public/admin/config.yml` | developer (keep both in step; a test checks it) |
| Banners | `public/banner-mobile.webp` (phones), `public/banner-desktop.webp` (laptops) | replace the files |
| CMS login helper (Cloudflare Worker) | `cms-auth-worker/` | developer |
| Deployment (GitHub Pages) | `.github/workflows/deploy.yml` | developer |

## Checkout flow (`src/components/checkout/Checkout.tsx`)
Cart → **Details** (field-by-field validation, gift option, delivery date/time that respects the notice period) →
**Pay advance** (UPI app button on phones, UPI ID with copy, QR code with the amount filled in) →
**Send on WhatsApp** (the cart is only cleared after the customer confirms they sent it).

## Go-live checklist
1. CMS → Website Content → **Site details**: your real WhatsApp number and UPI ID.
2. `src/lib/site.ts`: your live domain (or set `NEXT_PUBLIC_SITE_URL`).
3. `public/admin/config.yml`: `repo` and `base_url` (see `docs/CMS-SETUP.md`).
4. `cms-auth-worker/wrangler.toml`: `ALLOWED_ORIGINS` = your domain.
5. Check the festival dates against your panchang (CMS → Festival countdown).
6. Replace the sample reviews with real ones (CMS → Reviews).

Guides: `docs/CMS-SETUP.md` (one-time setup, GitHub Pages + login worker) · `docs/CLIENT-GUIDE.md` (day-to-day, for the owner).
