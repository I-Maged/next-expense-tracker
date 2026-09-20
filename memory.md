# Memory — 12 Responsive + Empty-State Pass

Last updated: 2026-09-20

## What was built

- 4× `app/*/page.tsx` mains (`dashboard`, `transactions`, `budgets`, `settings`): `px-8 py-8` → `px-4 py-6 sm:px-6 md:px-8 md:py-8`.
- `components/layout/AppNavbar.tsx`: added mobile scroll row (`data-testid="app-navbar-mobile-nav"`, `md:hidden`, inner `overflow-x-auto`, same 4 links with identical active/inactive tokens + `aria-current`).
- `components/transactions/TransactionsTable.tsx`: table `w-full` → `w-full min-w-[640px]` (wrapper already `overflow-x-auto`).
- `components/ui/dialog.tsx`: panel `card w-full max-w-md` → `card max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto` via `cn()`.
- `components/transactions/TransactionsView.tsx` + `components/settings/CategoryManager.tsx`: headers `flex items-center justify-between` → `flex-col items-start sm:flex-row sm:items-center sm:justify-between`.
- Tests (+7, 188→195): `dialog.test` (max-h/scroll), `TransactionsTable.test` (min-w/scroll), `AppNavbar.test` (mobile row + updated active-link test to `getAllByRole`), `TransactionsView.test` + `CategoryManager.test` (header stacking), `app/dashboard/page.test` (responsive gutters), `StatCards.test` (over-budget `text-error` only when >0).
- Empty states (all 9, verified not redesigned): CategoryChart, TrendChart, BudgetVsActual, RecentTransactions, TransactionsView empty + no-results, BudgetsView empty, CategoryManager empty, dashboard per-chart empties.
- Currency + over-budget verified: all live amounts via `formatCurrency()`; over-budget stays red text/bar only (`StatCards` count, `BudgetCard`/`BudgetVsActual` bar + `+$X over`).
- Docs: `context/ui-registry.md` (7 entries: navbar, 4 mains, table, view/manager headers, dialog), `context/progress-tracker.md` (12 checked, Phase 5, next → 13, 1 decision line).

## Decisions made

- Class-only pass, zero component prop/API and zero server/client boundary changes.
- Gutters `px-4 py-6 sm:px-6 md:px-8 md:py-8` (32px eats ~17% of a 375px phone).
- Mobile nav = `md:hidden overflow-x-auto` scroll row — ui-rules forbids sidebar/drawer, so this is the only fitting pattern.
- Table scroll forced with `min-w-[640px]`; dialog safety with `max-h-[calc(100vh-2rem)] overflow-y-auto`; headers copy the `BudgetsView` stacking pattern.
- Charts/stat/budget grids unchanged (already stack correctly).
- Skills used: architect (blueprint, 3 answers: responsive px, add scroll row, TDD+verify), tdd (vertical RED→GREEN slices), tailwind-v4 + tailwind-responsive-design (breakpoint classes), review (ready to ship, 1 minor note).

## Problems solved

- New mobile nav duplicated desktop links, breaking the old `getByRole("Transactions")` (multiple elements) — updated active-link test to `getAllByRole` asserting both copies.
- Mobile-nav test asserted `overflow-x-auto` on the `nav` itself but the scroll container is the inner div — fixed test to check `firstElementChild`.

## Current state

- `npm test`: 195/195 passing (47 files). `typecheck`, `lint`, `npm run build` clean. Routes `ƒ /dashboard /transactions /budgets /settings` (dynamic, correct).
- Phase 5: 12 done — responsive verified, zero visual redesign. Everything implemented and verified but uncommitted (18 files: 9 source + 7 tests + 2 docs).
- Review: 1 minor note only (duplicate links in DOM, one `display:none` per breakpoint — accepted as-is pending developer call).

## Next session starts with

- Build 13 Auth Edge Cases + Seed Check per `context/build-plan.md`: new user gets exactly 8 default categories once; logged-out → `/login`, logged-in `/login`+`/signup` → `/dashboard`; invalid inputs (negative amount, >2 decimals, future date, bad month) rejected with friendly text.

## Open questions

- None. 13 scope is fully specified in the build plan.
