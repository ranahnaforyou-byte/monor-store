# Hanout expo demo — plan (branch `expo-demo`)

Goal: a live two-phone demo for ECSEL Expo (2026-10-10). «النظام — كلّ واحد ودوره»:
a customer order travels through team departments (تأكيد ← تحضير ← شحن), each
department has a group chat with automatic event messages, and order
confirmation is the headline feature. Built on MONOR; `main` is untouched.

## Story
- **حانوت** is the platform. The demo merchant running on it is **متجر نور**.
- `/` Hanout landing (design-ref/01-landing) · `/system` live «النظام» page (02/03)
- `/shop` Noor's storefront (MONOR's store home, moved) — cart/checkout unchanged
- `/order/[reference]` customer confirmation + live timeline, AR/FR (04-confirm-fr)
- `/team` one-tap demo login per role → mobile team app (orders · chat · team · me · dashboard)
- `/owner` → owner dashboard · `/admin` MONOR's full admin, rebranded

## Steps
1. Data: Department, Channel, Message, Lead models; Order confirmation fields; demo seed
   (departments, channels, staff, 12 products, history orders + messages); reset.
2. Brand: Hanout tokens (emerald/saffron/off-white/coral/mint), store name «متجر نور».
3. Team app + confirmation actions + automatic chat messages + live refresh (2 s polling),
   new-order sound + vibration.
4. Customer order page: confirm / edit address / cancel, AR↔FR, in-page notification.
5. Owner dashboard: confirmation rate, orders by status, leaderboard, reset.
6. Landing + /system matching design-ref; QR to /shop; lead form; WhatsApp/Telegram.
7. QA: two tabs (customer + confirmer), 3 concurrent customers, 375 px + 1440 px,
   zero console/server errors, `npm run build`, impeccable review, DEMO.md.
