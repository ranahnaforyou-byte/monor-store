# MONOR STORE — Project Status

_Last updated: 2026-08-30_

Production football-shoe store for Algeria. Single Next.js 16 app, PostgreSQL + Prisma,
Arabic-first (RTL), Cash on Delivery, admin at `/admin`. Built data-driven for 50 → hundreds
of products with no code changes.

---

## Environment / stack (as installed)

| Piece | Version / choice | Notes |
|---|---|---|
| Next.js | **16.3.3** (App Router, Turbopack) | newer than the spec assumed; code follows the v16 docs bundled in `node_modules/next/dist/docs` |
| React | 19.2 | |
| Prisma | **6.19.3** (pinned) | `latest` currently points at an 8.0 RC — pinned to the newest stable 6.x |
| Styling | Tailwind CSS v4 | tokens in `src/app/globals.css` |
| Auth | **hand-rolled** (jose JWT + `@node-rs/argon2` argon2id) | replaces Auth.js for clean Next 16 compat; meets every stated auth requirement (httpOnly/Secure/SameSite cookie, rate-limit + lockout, RBAC OWNER/MANAGER/STAFF) |
| `middleware.ts` | now **`src/proxy.ts`** | Next 16 renamed the convention; Node runtime |
| i18n | hand-rolled dictionaries (`src/messages/ar.json` / `fr.json`) | Arabic default; FR gated behind `NEXT_PUBLIC_ENABLE_FRENCH` so storefront stays statically optimizable until FR is turned on |
| Local DB | `embedded-postgres` (Postgres 18, UTF-8) via `npm run db:up` | no Docker on the build machine; production uses a real managed Postgres via `DATABASE_URL` |
| Image storage | local disk (`public/uploads`) behind `ObjectStorage` interface | Cloudflare R2 implementation is the Phase 7 task; the seam already exists |

## How to run locally

```bash
npm install
npm run db:up          # start local Postgres (keep this shell open)
npm run db:migrate     # apply migrations
npm run db:seed        # owner account + settings + 58 wilayas + categories
npm run import:products # import the 7 supplied images as products
npm run dev
```

Admin: `http://localhost:3000/admin/login` — `admin@monor.store` / `MonorAdmin!2026`
(**change immediately after first login**).

`npm run check` = typecheck + lint. `npm run build` = production build.

---

## Phase progress

### ✅ Phase 0 — Foundation
- Next.js + TS strict + Tailwind v4 + ESLint flat config, folder structure per spec §18.
- `src/lib/env.ts` (Zod-validated server env), `.env.example` with the spec's variable names.
- Design tokens + RTL base layer; fonts (Cairo / IBM Plex Sans Arabic / IBM Plex Mono) self-hosted via `next/font`.
- i18n + `dir="rtl"` wiring, `formatDZD()` → `"12 900 دج"`.
- Prisma schema (all 14 spec models + Wilaya/Commune/OrderEvent/LoginAttempt), first migration applied.
- `PROJECT_STATUS.md`, `README.md`. Build + typecheck + lint green.

### ✅ Phase 1 — Data & catalog
- Full schema + seed + `scripts/import-products.ts` (idempotent batch importer — re-run for the next 40 images, **no code changes**).
- `sharp` pipeline: EXIF strip, resize (never upscales the small source images), WebP, blur placeholder, dimensions.
- Homepage (announcement bar, hero, featured, categories, new arrivals, product grid, trust strip, footer).
- Catalog `/products` with brand/size/price/availability filters + sort + pagination (URL-driven).
- Category pages `/categories/[slug]`, product pages `/products/[slug]` with pro multi-image gallery (swipe / arrows / keyboard / hover-zoom), size-per-stock picker.
- Search `/search` (Postgres `ILIKE` across name/brand/description/SKU — trigram/tsvector upgrade noted below).
- SEO: metadata API, canonical URLs, `sitemap.ts`, `robots.ts` (admin `noindex`), Product + BreadcrumbList JSON-LD, OG.
- 7 supplied images imported as **ACTIVE products with clearly-flagged placeholder** name/price/sizes/stock.

### ✅ Phase 2 — Cart & checkout (COD)
- Cookie cart (`monor_cart`, httpOnly), server-validated against live DB price + per-size stock; resilient to deleted/changed products.
- `/cart` (qty steppers, remove, live subtotal), `/checkout` (wilaya→commune cascading, address, home/stop-desk, notes, payment method).
- `createOrder` (`src/server/services/orders.ts`): Zod validate → re-read prices → re-check stock → compute subtotal/shipping/total **server-side** → **transactional guarded per-size decrement** (`updateMany … quantity: { gte } ` so concurrent checkouts can't oversell) → `InventoryMovement` → `Customer` upsert by phone → `MNR-26-XXXXXX` reference.
- `/order/[reference]` confirmation + status + BaridiMob instructions + customer reference submission.

### ✅ Phase 3 — Admin
- Login + rate-limit + lockout + audit; `proxy.ts` edge gate; `requireAdmin()` / `requireRole()` on every page and action.
- Dashboard (revenue today/7d/30d, orders by status, COD outstanding, low stock, top products, latest orders).
- Orders list + detail (guarded state machine, payment status, internal notes/timeline, Yalidine panel).
- Products CRUD + image manager (upload / reorder / set primary / delete) + per-size stock + duplicate + archive/activate + SEO fields.
- Categories, Inventory (per-size adjust with movement log), Customers (+ block/unblock), Payments (BaridiMob queue: verify/mark-paid/reject + COD reconciliation), Shipping (per-wilaya fee editor + parcels), Statistics (hand-rolled SVG charts, no chart dependency), Store settings.
- Every mutation: `requireRole` → Zod → transaction → `revalidateTag` → `AuditLog`.

### ◻ Phase 4 — Yalidine  (interface built, credentials pending)
- `src/lib/yalidine/client.ts` — full client (wilayas/communes/centers/fees/create-parcel/get/cancel), server-only, throws `YalidineNotConfiguredError` until `YALIDINE_API_ID` / `YALIDINE_API_TOKEN` are set.
- Admin order detail: "Create parcel / Refresh status / Open label"; `/api/webhooks/yalidine` (secret-verified, idempotent, status→order mapping, COD-delivered → `PAID`); `/api/cron?job=yalidine-sync` polling fallback.
- **Remaining:** real credentials + a `Wilaya`/`Commune`/`ShippingRate` sync job from the live fees API (replaces the starter dataset), weight defaults in settings.

### ◻ Phase 5 — BaridiMob  (manual flow live; gateway stubbed)
- Manual verification flow fully working end-to-end (checkout option → PENDING order → customer submits ref → admin Payments queue → mark paid → order `PAID`).
- `src/lib/baridimob/client.ts` `createGatewayPayment()` throws `BaridimobGatewayUnavailableError`; `/api/webhooks/baridimob` records events behind a secret.
- **Remaining:** an official merchant/e-paiement gateway contract, then implement `createGatewayPayment` + webhook processing.

### ◻ Phase 6 — Google Drive + media pipeline
- `ObjectStorage` seam + local-disk implementation in place; `scripts/backup-db.ts` (pg_dump → gzip → local, Drive upload TODO).
- **Remaining:** `src/lib/drive` (`googleapis` service account), R2 `put/delete` implementation, `incoming/` batch importer, originals → Drive archival, nightly DB backup to Drive with retention, `/img/[driveFileId]` emergency proxy.

### ◻ Phase 7 — Hardening + launch
- Done: security headers (`next.config.ts`), `noindex` on admin, Zod at every boundary, `server-only` on secret modules, transactional stock, webhook idempotency + secret verification, server-side totals, argon2id, session lockout.
- **Remaining:** CSP header, Upstash/edge rate-limit for storefront endpoints (login/checkout/search currently DB-throttled only on login), Lighthouse/CWV pass, `next/font` weight trimming (currently preloads many faces), Sentry wiring, analytics, backup *restore* drill, full UAT with a real order.

---

## Known follow-ups / tech debt

- **Search** is `ILIKE`; spec wants Postgres full-text + `pg_trgm`. Add a migration enabling `pg_trgm`, a generated `tsvector` column + GIN index, and switch `catalog.searchProducts` to a ranked `$queryRaw`.
- **Communes**: starter set (82). Replace with the full ~1541 from the Yalidine sync; checkout already reads the DB cache, and the cascading select should move to an API route when the list gets large.
- **`next/font`** preloads many weights (Cairo + Plex Arabic + Plex Mono). Trim to the used weights and `preload:false` on display/mono.
- **Prisma** `package.json#prisma` key warns on every command — harmless on 6.x; migrate to `prisma.config.ts` + `dotenv` when convenient.
- Product/category pages render dynamically (the header reads the cart cookie). Expensive queries are `unstable_cache`-tagged, so this is fine, but a cached header variant would let them prerender.
- R2 client (`put`) not implemented — images serve from `public/uploads` until Phase 6.

## Human setup still required (spec §38)

`DATABASE_URL` (prod) · `AUTH_SECRET` / `APP_ENCRYPTION_KEY` / `APP_URL` · Cloudflare R2 keys ·
Google Cloud service account + Drive folder id · Yalidine `API_ID` / `API_TOKEN` / webhook secret ·
BaridiMob account details (+ gateway creds if a contract exists) · real store identity, prices,
sizes, stock, brand assets · domain + hosting account · a real end-to-end test order.
