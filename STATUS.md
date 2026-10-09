# STATUS — Hanout expo demo (branch `expo-demo`)

**Ready for the expo.** Read `DEMO.md` first (links, 60-second script, deploy, reset).

- [x] Branch + design refs + frontend-design skill installed in `.claude/skills/`
- [x] Local DB backed up (`backups/pgdata-pre-expo-demo/`)
- [x] 1. Data models + seed + reset (`npm run seed:hanout`, `-- --reset`)
- [x] 2. Brand (Hanout tokens, store = «متجر نور» at `/shop`)
- [x] 3. Team app `/team` — orders per department, confirmation desk, chat, staff, me
- [x] 4. Customer order page `/order/[ref]` (AR/FR, live timeline)
- [x] 5. Owner dashboard `/team/dashboard` (+ `/owner`) with leads list + reset
- [x] 6. Landing `/` + `/system` (match design-ref 01/02/03)
- [x] 7. QA: typecheck + lint + `next build` green; impeccable audit fixes; DEMO.md

## Verified in the browser
- Customer orders → coral alert + chime on the confirmer's phone → customer self-confirms →
  prepare → ship (ZR Express) → customer timeline updates live.
- Three customers back-to-back: separate references, separate cards, Arabic place names,
  "لم يرد" recorded with attempt counter, confirm moves the order to التحضير.
- Lead form saves (survives the 2.5 s live refresh while typing); leads listed on the dashboard.
- Mobile 375 px + desktop 1440 px: no horizontal overflow; AA contrast on action buttons.

## Needs the owner (morning)
1. `git push origin expo-demo`, then deploy as a **separate** Vercel project + new Neon DB (DEMO.md §4).
2. Real WhatsApp / Telegram links in `src/config/hanout.ts`.
3. Optional: real product photos (same file names in `public/uploads/hanout/`).
