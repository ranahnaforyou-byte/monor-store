# Decisions log — Hanout expo demo

Decisions taken overnight without the owner (he was asleep). Each is reversible.

1. **Built on branch `expo-demo` of MONOR**, not a new project. `main` untouched.
2. **Backup**: `pg_dump` is not installed, so the local DB was backed up by stopping
   Postgres and copying `.pgdata` → `backups/pgdata-pre-expo-demo/` (gitignored).
   Restore: stop db, replace `.pgdata` with that folder.
3. **Platform vs merchant**: «حانوت» is the platform; the demo store is «متجر نور»
   (matches design-ref/04 "#1258 chez Noor").
4. **Non-sized products** use one size «مقاس واحد» + one SizeStock row; the size
   picker is hidden when a product has a single size. Catalog code unchanged.
5. **Realtime = polling**: client calls `router.refresh()` every 2 s on live pages.
   No websockets (Vercel serverless), no new service.
6. **Department mapping** onto MONOR's existing order state machine:
   تأكيد = PENDING · تحضير = CONFIRMED (done → PREPARING = ready to ship) ·
   شحن = PREPARING → SHIPPED → DELIVERED.
7. **Customer self-confirm** from `/order/[reference]` moves PENDING → CONFIRMED;
   actor recorded as "customer" (no AuditLog row, since AuditLog needs an admin).
8. **Demo login** (`/team`) issues a normal admin session for seeded demo staff; it only
   works when `NEXT_PUBLIC_DEMO_MODE=1`. Demo staff have random unusable passwords.
9. **Reset demo** wipes orders + chat messages and reseeds history; it never deletes
   collected leads (`Lead` table).
10. **Placeholder product images** are generated SVG→WebP tiles (no third-party photos,
    no licensing questions) until the Astra product grids arrive.
11. **Demo data** is labelled «بيانات تجريبية». No invented testimonials or public
    claims like "+10,000 sellers"; no flags. WhatsApp/Telegram buttons use placeholder
    links (`HANOUT_CONTACT` in `src/config/hanout.ts`) to replace tomorrow.
