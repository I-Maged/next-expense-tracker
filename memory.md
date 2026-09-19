# Memory — 10 Stats + Recent Real Data

Last updated: 2026-09-19

## What was built

- `app/dashboard/page.tsx` (rewritten): seeds categories, then one `Promise.all` — EXPENSE + INCOME `aggregate` SUMs in current-month range, `budget.findMany` (user + month, `include category`) + EXPENSE `groupBy` spent per category for over-budget count, `transaction.findMany` (`orderBy date desc`, `take 5`, `include category`); `Decimal.toNumber()` + `Date→YYYY-MM-DD` + null-note→`""` mapping at boundary; live `stats` + `recent` into `DashboardView`, charts + budget list stay on chart-only mocks.
- `app/dashboard/page.test.tsx` (2→4 tests): redirect without session; live stats + recent values when authed; Prisma scoping (userId, month range, `take: 5`, `orderBy`); zero-stats + recent empty state on null sums.
- `lib/mockDashboard.ts` trimmed to chart-only mocks: `MOCK_DASHBOARD_STATS`, `MockRecentTransaction`, `MOCK_RECENT_TRANSACTIONS` deleted (kept `MOCK_DASHBOARD_MONTH` as trend anchor); `mockDashboard.test.ts` 5→3 tests.
- `components/dashboard/DashboardView.test.tsx`: inline stats/recent fixtures instead of deleted mock imports.
- Docs: `context/ui-registry.md` (dashboard page entry rewritten for live reads), `context/progress-tracker.md` (10 checked, Phase 4 down to 11, 1 new decision line).

## Decisions made

- Balance = current-month income minus current-month spent (not all-time — matches "This Month" subtitles; documented in progress-tracker per build-plan instruction).
- Recent = latest 5 (not 8 — matches 09 UI, zero component changes).
- Mock trim (not keep-unwired): stats + recent exports deleted outright, unlike the 08 `mockBudgets` precedent.
- Zero section-component prop changes — `DashboardStats`/`RecentTransactionView` shapes already fit real data.
- Skills used: architect (plan + blueprint, all 4 answers confirmed), tdd (RED→GREEN on page test), review (0 issues, ready to ship).

## Problems solved

- None — no blockers. Page-test RED state (3 failing on still-mocked page) flipped GREEN with the rewrite; full suite holds at 188/188 (48 files: +2 page, −2 mock).

## Current state

- `npm test`: 188/188 passing (48 files). `typecheck`, `lint`, `npm run build` clean. Build shows `ƒ /dashboard` (dynamic, correct).
- Phase 4: 10 done — stats + recent live, charts + Budget-vs-Actual still mocked. Everything implemented and verified but uncommitted (01–10 now uncommitted).

## Next session starts with

- Build 11 Charts — Real Data per `context/build-plan.md`: Spending by Category (`groupBy categoryId` EXPENSE current month → `{ name, total }`), Income vs Expense (monthly sums last 6 months, `#10B981`/`#7C5CFC`), Budget vs Actual (budgets this month + live spent); `Decimal`→number at boundary; per-chart empty states; delete `lib/mockDashboard.ts` entirely once unwired.

## Open questions

- None. 11 scope is fully specified in the build plan.
