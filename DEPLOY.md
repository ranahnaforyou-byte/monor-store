# Deploying MONOR STORE to Vercel (review / DEMO)

One repo → Vercel (Next.js host) + Neon (serverless Postgres). ~20 minutes.
Both have a free tier and both let you sign in with GitHub.

This deploys the store **with DEMO mode ON** (test-price banner). Turning it into
a real production shop is the same deployment with different env values +
`npm run clear:demo` + real products — see the last section.

---

## 1. Create the database (Neon)

1. Go to **https://neon.tech** → **Sign up with GitHub**.
2. **Create project** → name `monor-store`, region closest to Algeria
   (e.g. *Europe (Frankfurt)*). Postgres 16 is fine.
3. On the project dashboard, open **Connection Details** and copy the
   **Pooled connection** string. It looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   Keep this — it is your `DATABASE_URL`.

---

## 2. Schema + data

Two ways, pick one:

**A — from your PC** (only if your network allows outbound TCP :5432; many
mobile / Algerian ISPs block it):

```bash
DATABASE_URL="<NEON_URL>" npm run db:deploy
DATABASE_URL="<NEON_URL>" SEED_ADMIN_EMAIL="you@example.com" SEED_ADMIN_PASSWORD="ChooseAStrongPass1!" npm run db:seed
DATABASE_URL="<NEON_URL>" npm run seed:demo -- --fresh
```
PowerShell: `$env:DATABASE_URL="<NEON_URL>"; npm run db:deploy` (repeat per line).

**B — let Vercel do it (recommended if :5432 is blocked):**
- Migrations run automatically during the Vercel build (`vercel-build` →
  `prisma migrate deploy`), because Vercel's network is unrestricted.
- After the first deploy, open **once** in your browser:
  ```
  https://<your-project>.vercel.app/api/setup?key=<CRON_SECRET>
  ```
  That creates the admin account (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
  env vars), store settings, the 58 wilayas + communes, categories, and the 40
  demo products. It's idempotent — safe to call again. Add `&fresh=1` to rebuild
  the demo products, or `&demo=0` for core data only.

The demo images already live in the repo at `public/uploads/demo/`, so they show
on Vercel with no object storage.

---

## 3. Deploy on Vercel

1. Go to **https://vercel.com** → **Sign up with GitHub**.
2. **Add New… → Project** → **Import** `ranahnaforyou-byte/monor-store`.
3. Framework preset: **Next.js** (auto-detected). Leave build/output settings default.
4. Expand **Environment Variables** and add these (Production + Preview):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Neon **pooled** URL from step 1 |
   | `APP_URL` | `https://<your-project>.vercel.app` (you can fix this after the first deploy) |
   | `AUTH_SECRET` | run `openssl rand -base64 48` (or any 48+ random chars) |
   | `APP_ENCRYPTION_KEY` | run `openssl rand -base64 32` (must be 32 bytes base64) |
   | `CRON_SECRET` | any long random string |
   | `NEXT_PUBLIC_DEMO_MODE` | `1` |
   | `NEXT_PUBLIC_ENABLE_FRENCH` | `0` |

   Leave every integration variable **unset** (`R2_*`, `GOOGLE_*`, `YALIDINE_*`,
   `BARIDIMOB_*`) — the app runs fine without them.

5. Click **Deploy**. First build takes 2–4 minutes.
6. When it's live, copy the real URL, then **Project → Settings → Environment
   Variables**, set `APP_URL` to that exact URL, and **Redeploy** once so SEO /
   canonical links are correct.

Done. Share the Vercel URL with the store owner.

- Storefront: `https://<project>.vercel.app`
- Admin: `https://<project>.vercel.app/admin/login` — the email + password you
  chose in step 2.

---

## Notes / limits of this review deployment

- **Admin image uploads won't persist** on Vercel (its filesystem is read-only).
  The 40 demo images work because they're committed to the repo. For real product
  photos, set the `R2_*` variables (Cloudflare R2) — the code already supports it,
  no change needed.
- **Schema changes**: after editing `prisma/schema.prisma`, run
  `DATABASE_URL="<NEON_URL>" npm run db:deploy` again, then push (Vercel redeploys).
- **Cron** (`/api/cron`) is manual for now; wire Vercel Cron later when Yalidine
  is connected.

## Going from DEMO to production (later)

1. `DATABASE_URL="<NEON_URL>" npm run clear:demo` — removes all demo/placeholder products.
2. Add real products from `/admin` (with `R2_*` configured for real photos).
3. Set `NEXT_PUBLIC_DEMO_MODE=0` in Vercel → Redeploy. The test banner disappears.
4. Add a custom domain in Vercel → Settings → Domains; update `APP_URL`.
5. Connect Yalidine (`YALIDINE_*`) and BaridiMob (`BARIDIMOB_*`) when ready.
