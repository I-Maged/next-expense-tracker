# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 3 — Budgets
**Last completed:** 07 Budgets Page — Full UI
**Next:** 08 Budget Logic

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth — UI only (login/signup pages, forms, social buttons, `lib/auth-client.ts`, `proxy.ts` guard; 22 new tests). Backend deferred: `lib/auth.ts`, `app/api/auth/[...all]`, Prisma schema, live OAuth exchange.
- [x] 02 Auth wiring — `lib/auth.ts`, `app/api/auth/[...all]` route, session-aware homepage CTAs (server flag, no Context), live-verified email + OAuth flows
- [x] 03 Database + Docker — `docker-compose.yml`, `prisma.config.ts`, `prisma/schema.prisma` (auth + app models, migrated), `lib/prisma.ts`, `lib/validations.ts`, `lib/utils.ts` extensions (11 new tests)

### Phase 2 — Transactions (Core)

- [x] 04 Transactions Page — Full UI (TDD, 18 new tests): `app/transactions/page.tsx` (server session guard → /login), `components/transactions/` (TransactionFilters, TransactionsTable, TransactionsPagination, TransactionsView client orchestrator), `components/layout/` (AppNavbar authenticated variant + SignOutButton), `lib/mockTransactions.ts` (48 deterministic rows). Filters + pagination functional over mock client-side; empty + no-results states; Add/Edit/Delete buttons dead until 05.
- [x] 05 Transaction CRUD Logic (TDD, 25 new tests, 88 total): `actions/transactions.ts` (create/update/delete — session + zod + category-ownership + user-scoped Prisma, revalidate `/transactions` + `/dashboard`), `actions/categories.ts` (`seedDefaultCategories` — 8 defaults only when zero), `components/ui/dialog.tsx` (hand-rolled, no radix), `components/transactions/` (TransactionForm reused create/edit, DeleteTransactionDialog, types.ts view types; Table/Filters on real types; View URL-driven via `router.push` + `router.refresh()`), `app/transactions/page.tsx` (searchParams → Prisma count+findMany 20/page, month defaults to current, Decimal/Date mapping at boundary). `lib/validations.ts` (+ coerce amount, update/delete schemas, dynamic future-date check).
- [x] 06 Settings Page — Categories (TDD, 36 new tests, 124 total): `actions/categories.ts` (+ `createCategory` / `updateCategory` / `deleteCategory` — session + zod + duplicate pre-check + `P2002` friendly error + transaction/budget block counts, revalidate `/settings` + `/transactions` + `/dashboard` + `/budgets`), `components/settings/` (`CategoryForm` shared add/edit with swatches, `DeleteCategoryDialog`, `CategoryManager` shell with `key` remount + `router.refresh()`, `types.ts` view type), `app/settings/page.tsx` (session guard, seed, `findMany` with `_count` ordered by name). `lib/validations.ts` (+ create/update/delete category schemas), `lib/utils.ts` (+ `CATEGORY_COLORS` 8-swatch palette).

### Phase 3 — Budgets

- [x] 07 Budgets Page — Full UI (TDD, 14 new tests, 138 total): `app/budgets/page.tsx` (server session guard → /login, pure mocks, no Prisma/seeding), `components/budgets/` (BudgetCard presentational with threshold fills, BudgetsView client orchestrator with month `useState` defaulting to current), `lib/mockBudgets.ts` (7 deterministic rows: 5 current month covering under/near/over, 2 prior month). Copy Last Month / Set Budget buttons dead until 08; URL params deferred to 08.
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
- 2026-09-18: Homepage built TDD (vitest + @testing-library/react + jsdom, `npm test`): Server Components in `components/layout/` (Navbar, Footer) + `components/homepage/` (Hero, Features, HowItWorks, BottomCta), one component per file, named exports (default export only for `app/page.tsx` as Next requires). Token utilities only, no raw Tailwind colors. Homepage CTAs are static links (`/signup`, `/login`) until 02 Auth wires session-aware redirects.
- 2026-09-18: Font warning fixed — Google Sans Flex has no entry in Next's fallback-metrics table and Turbopack ignores `adjustFontFallback: false` for the lookup, so `app/layout.tsx` now passes a manual `fallback: ["ui-sans-serif", "system-ui", "sans-serif"]` (bypasses lookup, kills warning) + `adjustFontFallback: false` (no size-adjust CSS). Variable resolves to `"Google Sans Flex", ui-sans-serif, system-ui, sans-serif`; .woff2 still self-hosted.
- 2026-09-18: 02 Auth split into UI-first + wiring-later (developer decision). UI slice done TDD: `app/(auth)/login|signup`, `components/auth/` (SocialButtons, LoginForm, SignupForm), `components/ui/` (Button, Input, Label), `lib/utils.ts` (`cn()` dependency-free — `clsx`/`tailwind-merge` deliberately not installed), `lib/auth-client.ts`, `proxy.ts` cookie guard. Deferred to 03/wiring: `lib/auth.ts`, `app/api/auth/[...all]/route.ts`, Prisma schema + migrate, seeding, homepage session-aware CTAs, live OAuth verification (Google/GitHub buttons call `signIn.social` with `callbackURL: "/dashboard"`, mock-verified only).
- 2026-09-18: Route guard lives in `proxy.ts` (`export function proxy`), NOT `middleware.ts` — Next 16 deprecated the middleware file convention (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Same cookie-presence logic as library-docs, plus explicit `matcher` for protected + auth routes so static assets never hit the guard. Fixed in `architecture.md` + `library-docs.md` during 03.
- 2026-09-18: 03 built DB-only (developer decision) — auth wiring (`lib/auth.ts`, API route, homepage CTAs, live OAuth) is a separate next step.
- 2026-09-18: Auth tables are singular (`user`, `session`, `account`, `verification`) — better-auth default, verified via `getExpectedSchema` from the installed 1.7.5 package. `architecture.md` prose said plural; fixed. Wiring step uses plain `prismaAdapter(prisma, { provider: "postgresql" })` (no `usePlural`).
- 2026-09-18: Auth models hand-written into `prisma/schema.prisma` (developer decision) instead of CLI generate — fields copied from better-auth 1.7.5 expected schema. App models reference `User` with back-relations (Prisma requires both sides) and `onDelete: Restrict` on category refs (DB-level delete block).
- 2026-09-18: Prisma 7.10 specifics — datasource URL lives in `prisma.config.ts` (schema keeps provider-only `datasource db` block or Decimal validation fails with "Default connector"); `.env` is loaded via `process.loadEnvFile()` in the config (Prisma does not auto-load; dotenv deliberately not installed); generator is `prisma-client-js` (the `prisma-client` generator demands a custom output path, `-js` keeps default `@prisma/client` output per architecture); `lib/prisma.ts` passes `PrismaPg` adapter.
- 2026-09-18: Postgres image is `postgres:16-alpine` (smaller pull, same server behavior; no app-code impact — only the compose `image:` line references it).
- 2026-09-18: Compose credentials via `${POSTGRES_USER}` / `${POSTGRES_PASSWORD}` / `${POSTGRES_DB}` with no defaults (fail loudly without `.env`); values live in gitignored `.env`, kept consistent with `DATABASE_URL`. Committed `.env.example` holds placeholders only.
- 2026-09-18: Auth wired end to end — `lib/auth.ts` (plain `prismaAdapter`, `?? ""` for OAuth keys instead of `!` assertions per code-standards), `app/api/auth/[...all]` route. Homepage CTAs use a server flag (`page.tsx` async `getSession`, `authenticated` boolean props) — Context rejected: session truth is an httpOnly cookie JS cannot read, and every auth transition is a redirect that re-renders the server tree anyway.
- 2026-09-18: Footer has a 4th "Get Started" account link — threaded the same flag through it (all four CTAs → `/dashboard` when authed).
- 2026-09-18: `app/page.test.tsx` mocks `@/lib/auth` + `next/headers` and renders `await Home()` — async server pages cannot render unmocked in jsdom (no request scope, no `.env`/DB). Live-verified against dev server: signup (7-day httpOnly cookie + user row), get-session, signin, sign-out (needs `Origin` header — better-auth CSRF), Google/GitHub authorize URLs built with correct callback URIs. Test user removed after.
- 2026-09-18: Local Postgres was already listening on 5432 (Docker Desktop daemon down), so `expense_tracker` DB was created on it and `docker compose up` deferred — `docker-compose.yml` is validated (`docker compose config`) and ready for when the daemon runs. Quoted `DATABASE_URL` in `.env` left as-is (works: Next/dotenv strip quotes).

- 2026-09-18: 04 month filter defaults to all months (""), not current month — so the full 48-row mock set shows on first paint and "Showing 1 to 20 of 48" holds. 05 wires the picker to real Prisma queries defaulting to the current month.
- 2026-09-18: 04 `TransactionsView` client orchestrator holds filter + pagination `useState` (URL params deferred to 05); page stays a Server Component with the session guard, mock arrays cross the server/client boundary as plain data.
- 2026-09-19: 05 filters are server URL params (`?search=&category=&type=&month=&page=`) — page awaits `searchParams`, Prisma `count` + `findMany` (user-scoped, month `gte/lt`, note `contains insensitive`, 20/page via `take/skip`); View pushes query on change (defaults deleted, page reset) and `router.refresh()` after mutations. Month defaults to current month (04's all-months default retired with mocks).
- 2026-09-19: 05 dialog is hand-rolled (`components/ui/dialog.tsx`, overlay + `.card` panel, Escape/backdrop close) — no `@radix-ui/react-dialog` dep per code-standards simpler-native rule.
- 2026-09-19: 05 `TransactionForm` is one component for create + edit (`initial` prop, Expense default, `inputMode="decimal"`, date `max` today, note max 200); remount via `key` (no setState-in-effect) for fresh state per open. Delete is a separate confirm dialog.
- 2026-09-19: 05 category seeding lives in `actions/categories.ts` `seedDefaultCategories()` (8 names from `DEFAULT_CATEGORIES` + mock palette colors, `count==0` guard), triggered on transactions page load before reads.
- 2026-09-19: 05 `createTransactionSchema.amount` is `z.coerce.number()` (forms send strings) + new `updateTransactionSchema` (create + `id`) and `deleteTransactionSchema`; future-date check is dynamic (`getTime() <= Date.now()`), not module-load `new Date()`. Empty-string notes normalize to `undefined` in actions.
- 2026-09-19: 06 category actions are create/update/delete (update covers rename + recolor) with one shared `CategoryForm`; swatches-only palette (`CATEGORY_COLORS`, 8 seed colors, no free hex); page follows 05 pattern (server guard + seed + `_count` read, client manager + dialogs + `router.refresh()`); components split like 05 (`CategoryManager` + `CategoryForm` + `DeleteCategoryDialog` + `types.ts`); revalidate `/settings` + `/transactions` + `/dashboard` + `/budgets`; delete blocked when transactions or budgets reference (counts in message); `P2002` maps to "Category name already exists".

- 2026-09-19: 06 category actions are create/update/delete (update covers rename + recolor) with one shared `CategoryForm`; swatches-only palette (`CATEGORY_COLORS`, 8 seed colors, no free hex); page follows 05 pattern (server guard + seed + `_count` read, client manager + dialogs + `router.refresh()`); components split like 05 (`CategoryManager` + `CategoryForm` + `DeleteCategoryDialog` + `types.ts`); revalidate `/settings` + `/transactions` + `/dashboard` + `/budgets`; delete blocked when transactions or budgets reference (counts in message); `P2002` maps to "Category name already exists".
- 2026-09-19: 07 budgets UI-first over dynamic mocks (`MOCK_CURRENT_MONTH`/`MOCK_PREV_MONTH` derived from `monthKey(new Date())` so first paint always has data); `BudgetForm` deferred to 08 with dead Copy/Set buttons (04 precedent); `MockBudget` shape mirrors future `BudgetView` (plain numbers) for a clean 08 swap; progress fill `bg-success` <80% / `bg-warning` 80–100% / `bg-error` >100%, width capped at 100%.

_Add decisions here as they are made during implementation._

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._
