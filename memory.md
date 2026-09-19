# Memory — 07 Budgets Page (Full UI)

Last updated: 2026-09-19

## What was built

- `lib/mockBudgets.ts` (+ test, 3 tests): `MockBudget { id, categoryId, category, month, limit, spent }` (plain numbers, mirrors future `BudgetView`), 7 deterministic rows — 5 in `MOCK_CURRENT_MONTH` (under/near/at/over/zero spent) + 2 in `MOCK_PREV_MONTH`; months derived from `monthKey(new Date())` so first paint always has data.
- `components/budgets/BudgetCard.tsx` (+ test, 4 tests): server presentational — dot + name, `spent / limit` via `formatCurrency()`, `h-2` progress bar (`bg-success` <80% / `bg-warning` 80–100% / `bg-error` >100%, width capped 100%, labelled `progressbar`), remaining (`text-text-secondary`) or `+$X over` (`text-error`).
- `components/budgets/BudgetsView.tsx` (+ test, 5 tests): `"use client"` shell — month `useState` defaulting to current, client-side month filter (URL params deferred to 08), header (H1 + month picker + dead secondary Copy Last Month + dead primary Set Budget), `budget-grid` (`md:grid-cols-2 xl:grid-cols-3`), empty state + dead CTA.
- `app/settings/page.tsx` equivalent for budgets — `app/budgets/page.tsx` (+ test, 2 tests): session guard → `/login`, pure mocks (no Prisma/seeding), `AppNavbar activePath="/budgets"`.
- Docs: `context/ui-registry.md` (3 new entries), `context/progress-tracker.md` (07 checked, Phase 3 opened, 1 new decision line).

## Decisions made

- BudgetForm deferred to 08 with dead Copy/Set buttons — 04 precedent (forms arrive with the logic phase).
- UI-first over dynamic mocks (not fixed month pools) so the page never first-paints empty as calendar time moves.
- `MockBudget` shape mirrors future `BudgetView` for a clean 08 swap (server maps Prisma + live spent at boundary).
- Progress thresholds locked: green <80%, orange 80–100%, red >100%; track `bg-border-light`; over-budget carried by red bar + red text only (no extra border).
- Skills used: architect (plan + blueprint, all 3 answers confirmed), tdd (vertical slices), tailwind-v4 (token-only classes), review (0 issues).

## Problems solved

- None — no blockers this session. Fixed-month mock pools (04's `MONTH_POOL`) would have left the budgets page permanently empty-state once the calendar moved past them; solved by deriving mock months from the current date.

## Current state

- `npm test`: 138/138 passing (37 files, +14 new this session). `typecheck`, `lint`, `npm run build` clean. Build shows `ƒ /budgets` (dynamic via session guard, correct).
- Phase 3 opened: 07 done. Everything implemented and verified but uncommitted (01–07 now uncommitted).

## Next session starts with

- Build 08 Budget Logic per `context/build-plan.md`: `actions/budgets.ts` (upsert one-per-category-per-month, delete, copy-last-month), `spent` aggregated live from EXPENSE transactions in the selected month (never stored), `BudgetForm` dialog wired to Set Budget buttons, URL-driven month (`?month=`, default current), `revalidatePath("/budgets")` + `("/dashboard")`; retire `lib/mockBudgets.ts` with the mocks.

## Open questions

- None. 08 scope is fully specified in the build plan.
