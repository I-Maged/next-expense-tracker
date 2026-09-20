# Memory — 11 Charts — Real Data

Last updated: 2026-09-19

## What was built

- `app/dashboard/page.tsx` (rewritten): same `Promise.all` extended — existing 5 reads + `category.findMany` (user-scoped, name asc) + 12 trend `aggregate` SUMs (6 months via `shiftMonth(month, -5..0)` ranges, EXPENSE then INCOME per month); reuses `spentRows` groupBy map for over-budget count + `categorySpending` + `budgetRows`; `categorySpending` mapped with live name/color, zero/orphan filtered, sorted total desc; all-zero 6-month trend collapses to `[]` so the empty state renders; budgets `orderBy category name asc`; `Decimal` null→0 mapping at boundary; zero section-component prop changes.
- `app/dashboard/page.test.tsx` (4→7 tests): live budget rows (`$320.00 / $500.00`, 2 rows, no Rent); category + 6-month trend scoping (`category.findMany` userId, 14 aggregates, `orderBy category name asc`, bars/lines testids); per-chart empty states on null sums; `beforeEach` switched `clearAllMocks`→`resetAllMocks`.
- Deleted `lib/mockDashboard.ts` + `lib/mockDashboard.test.ts` entirely per build plan.
- `components/dashboard/DashboardView.test.tsx`: all mock imports replaced with inline `CATEGORY_SPENDING` / `TREND` / `BUDGET_ROWS` fixtures.
- Docs: `context/progress-tracker.md` (11 checked, Phase 4 complete, 1 new decision line), `context/ui-registry.md` (dashboard page entry rewritten for fully-live reads).

## Decisions made

- Trend = 12 `aggregate` SUMs inside the existing `Promise.all` (not raw SQL or findMany+bucket — matches the 10 pattern, type-safe).
- Category spending reuses the over-budget `groupBy` map + one `category.findMany` (zero extra aggregates); sorted total desc for deterministic bar order.
- All-zero trend maps to `[]` (otherwise `TrendChart` would draw a flat zero line instead of its empty state).
- Budget rows ordered by category name asc (budgets-page parity).
- Skills used: architect (plan + blueprint, 4 answers confirmed), tdd (RED 3-fail → GREEN), review (1 minor unplanned-sort note, ready to ship).

## Problems solved

- Test pollution: queuing 14 aggregates while old code consumed 2 left `mockResolvedValueOnce` leftovers across tests (`clearAllMocks` does not clear the once-queue) — fixed by switching `beforeEach` to `vi.resetAllMocks()`.
- `getByText("Food")` matched twice (budget row + recent category pill) — switched to `getAllByText` length check plus unique `$320.00 / $500.00` assertion.

## Current state

- `npm test`: 188/188 passing (47 files: +3 page, −3 mock, net 0). `typecheck`, `lint`, `npm run build` clean. Build shows `ƒ /dashboard` (dynamic, correct).
- Phase 4 complete: 11 done — dashboard fully live, zero mocks remain. Everything implemented and verified but uncommitted.

## Next session starts with

- Build 12 Responsive + Empty-State Pass per `context/build-plan.md`: stat cards stack on mobile, charts stack, table scrolls, dialogs full-width; verify every empty state renders; currency via `formatCurrency()` everywhere; over-budget states unmissable but not noisy.

## Open questions

- None. 12 scope is fully specified in the build plan.
