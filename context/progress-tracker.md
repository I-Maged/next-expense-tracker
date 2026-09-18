# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** —
**Last completed:** —
**Next:** 01 Homepage

---

## Progress

### Phase 1 — Foundation

- [ ] 01 Homepage
- [ ] 02 Auth
- [ ] 03 Database + Docker

### Phase 2 — Transactions (Core)

- [ ] 04 Transactions Page — Full UI
- [ ] 05 Transaction CRUD Logic
- [ ] 06 Settings Page — Categories

### Phase 3 — Budgets

- [ ] 07 Budgets Page — Full UI
- [ ] 08 Budget Logic

### Phase 4 — Dashboard + Reports

- [ ] 09 Dashboard Page — Full UI
- [ ] 10 Stats + Recent — Real Data
- [ ] 11 Charts — Real Data (recharts)

### Phase 5 — Polish

- [ ] 12 Responsive + Empty-State Pass
- [ ] 13 Auth Edge Cases + Seed Check

---

## Decisions Made During Build

- 2026-09-18: Auth = Better-Auth (email/password + Google + GitHub OAuth), session cookies httpOnly, 7-day expiry. No InsForge/Auth.js.
- 2026-09-18: Single currency (USD default) via `formatCurrency()` in `lib/utils.ts`. No multi-currency in v1.
- 2026-09-18: Default categories seeded per user on signup: Food, Transport, Rent, Utilities, Shopping, Health, Entertainment, Other.
- 2026-09-18: Charts = recharts, Prisma aggregates only. No PostHog or analytics vendor.
- 2026-09-18: Postgres via local Docker (`docker-compose.yml`). Migrations via `prisma migrate dev`.
- 2026-09-18: Visual system reused 1:1 from reference (purple `#7C5CFC`, white cards, Google Sans Flex, Tailwind v4 `@theme`).
- 2026-09-18: Only API route is `app/api/auth/[...all]`. All app mutations are Server Actions.
- 2026-09-18: globals.css = full `@theme` tokens verbatim from ui-tokens.md + base body/input defaults + `.card` component class. No `tailwind.config.*` (v4 CSS-first).
- 2026-09-18: Font = `Google_Sans_Flex` via `next/font/google` (`variable: --font-google-sans-flex`, latin subset), wired into `--font-sans`. Removed runtime Google Fonts `@import`. Build warns "no font override values" — benign, fallback chain covers it.
- 2026-09-18: Dark mode = CSS-variable overrides (accent/success/warning/error hues unchanged, surfaces + text + light-tints adapted), auto via `prefers-color-scheme` + `.dark` class hook (`@custom-variant`) for a future toggle. No `.light` escape hatch yet.

_Add decisions here as they are made during implementation._

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._
