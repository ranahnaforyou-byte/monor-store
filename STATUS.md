# STATUS — Hanout expo demo (branch `expo-demo`)

_Updated as work progresses._

- [x] Branch + design refs + frontend-design skill installed in `.claude/skills/`
- [x] Local DB backed up (`backups/pgdata-pre-expo-demo/`)
- [x] 1. Data models + seed + reset (`npm run seed:hanout`, `-- --reset`)
- [x] 2. Brand (Hanout tokens, store = «متجر نور» at `/shop`)
- [x] 3. Team app `/team` — orders per department, confirmation desk, chat, staff, me
- [x] 4. Customer order page `/order/[ref]` (AR/FR, live timeline) — tested end-to-end
- [x] 5. Owner dashboard `/team/dashboard` (+ `/owner`)
- [ ] 6. Landing `/` + `/system`
- [ ] 7. QA + DEMO.md

Verified in browser: customer orders → coral alert on the confirmer's phone →
customer self-confirms → prepare → ship (ZR Express) → customer timeline updates live.
