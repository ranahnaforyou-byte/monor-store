# MONOR STORE

Professional football-shoe e-commerce for an Algerian store. Arabic-first (RTL),
mobile-first, Cash on Delivery, private admin panel. One Next.js application — no
microservices.

- **Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · PostgreSQL · Prisma
- **Storefront:** `/` `/products` `/products/[slug]` `/categories/[slug]` `/search` `/cart` `/checkout` `/order/[reference]`
- **Admin:** `/admin` (dashboard, orders, products, categories, inventory, customers, payments, shipping, statistics, settings)
- **Payments:** Cash on Delivery (default) + BaridiMob manual verification
- **Shipping:** Yalidine integration (server-only client + webhook + cron)
- **Images:** `sharp` pipeline → object storage (local disk now, Cloudflare R2 in Phase 6); Google Drive is cold storage / backups only and never in the visitor request path.

See **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** for phase-by-phase status, decisions, and remaining work.

## Getting started

Requirements: Node 20.9+ (tested on 24), npm.

```bash
npm install

# Local database (no Docker needed — runs an embedded Postgres 18 on :5432).
# Keep this shell open while developing:
npm run db:up

# In a second shell:
cp .env.example .env.local        # then fill in the required values
npm run db:migrate                # apply migrations
npm run db:seed                   # owner account, store settings, 58 wilayas, categories
npm run import:products           # import the 7 supplied product images
npm run dev                       # http://localhost:3000
```

Default admin (from the seed — **change after first login**):
`admin@monor.store` / `MonorAdmin!2026`

Production uses a real managed Postgres — set `DATABASE_URL` and run `npm run db:deploy`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run check` | `tsc --noEmit` + ESLint |
| `npm run db:up` / `db:down` | Start / stop the local embedded Postgres |
| `npm run db:migrate` / `db:deploy` | Prisma migrate (dev / prod) |
| `npm run db:seed` | Seed reference data + owner account |
| `npm run db:studio` | Prisma Studio |
| `npm run import:products -- <folder>` | Batch-import product images (idempotent; re-run as more are added) |
| `npm run backup:db` | `pg_dump` → gzip → `./backups` (Drive upload: Phase 6) |

## Environment

All variables are documented in [`.env.example`](./.env.example) and validated at boot by
`src/lib/env.ts`. Integrations (R2, Google Drive, Yalidine, BaridiMob) are **optional** — when
their variables are empty the app runs with safe fallbacks (local image disk, manual payment
verification, disabled courier sync) and the admin **Settings → integration status** panel shows
what is connected.

Never commit real secrets. `.env`, `.env.local` are git-ignored; `.env.example` is not.

## Project layout

```
prisma/              schema, migrations, seed
scripts/             pg-dev, import-products, backup-db
src/
  app/(store)/       public storefront + route group layout
  app/(admin)/admin/ private admin panel
  app/api/           webhooks (yalidine, baridimob), cron, revalidate
  app/actions/       server actions (cart, checkout, payment, admin-*)
  components/ui|store|admin|layout
  server/services/   business logic (catalog, orders, admin-*, stats, shipping, settings)
  lib/               db, env, auth, crypto, i18n, images, cart, algeria, yalidine, baridimob, cache
  messages/          ar.json (launch default), fr.json
  proxy.ts           admin edge gate (Next 16 renamed `middleware` → `proxy`)
```

## Security notes

- Admin: argon2id hashing, signed httpOnly session cookie, login rate-limit + lockout, RBAC
  (`OWNER` > `MANAGER` > `STAFF`) enforced server-side in every action.
- Order totals, shipping and stock are always recomputed server-side; the browser is never trusted.
- Stock decrements are transactional and cannot go negative or oversell under concurrency.
- Webhooks verify a shared secret and are idempotent (`WebhookEvent` unique on `source + externalId`).
- Integration secrets in the DB are AES-256-GCM encrypted with `APP_ENCRYPTION_KEY`.
- `/admin` is `noindex` and blocked in `robots.txt`.
