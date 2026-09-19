# Memory — 08 Budget Logic

Last updated: 2026-09-19

## What was built

- `actions/budgets.ts` (+ test, 12 tests): `upsertBudget` (session + zod + category-ownership + find-then-create/update, `P2002` race falls back to update), `deleteBudget` (ownership + delete, "Budget not found"), `copyLastMonth({month})` (source derived server-side via `shiftMonth`, skip-existing + `skipDuplicates`, returns `{copied, skipped}`, "No budgets in <month> to copy" when source empty); `revalidatePath("/budgets")` + `("/dashboard")`, never throws.
- `components/budgets/types.ts`: `BudgetCategoryView` / `BudgetView { id, categoryId, category, month, limit: number, spent: number }` (server maps Prisma `Decimal`/`_sum` null→0 at boundary).
- `components/budgets/BudgetForm.tsx` (+ test, 6 tests): one dialog form for create + edit (`initial` prop, category select locked `disabled` on edit so edits can't fork rows, limit `inputMode="decimal"` + `autoFocus`, client checks + server error `role="alert"`), always submits `upsertBudget({categoryId, month, limit})`.
- `components/budgets/DeleteBudgetDialog.tsx` (+ test, 3 tests): confirm with month/name/limit summary, danger Delete, server error `role="alert"`.
- `components/budgets/BudgetCard.tsx` (+2 tests): ghost Pencil/Trash2 buttons (`aria-label="Edit|Delete budget <id>"`, optional `onEdit`/`onDelete`, render fine without); header restructured to justify-between.
- `components/budgets/BudgetsView.tsx` (rewritten, 8 tests): URL-driven shell (`month` prop, `router.push` new query, current-month default deleted), immediate Copy with "Copying…" pending + `role="alert"` error, dialogs remounted via `key`, success calls `router.refresh()`.
- `app/budgets/page.tsx` (rewritten, 4 tests): awaits `searchParams` month (defaults current), seeds categories, Prisma categories + month budgets + live EXPENSE `groupBy` spent in month range.
- Follow-up fix: `why` comments added to all three uncommented type assertions (`isUniqueViolation` in `actions/budgets.ts` + `actions/categories.ts`, palette `includes` in `CategoryForm.tsx`) — closes the style debt flagged in the 06 and 08 reviews.
- Docs: `context/ui-registry.md` (6 entries rewritten/added), `context/progress-tracker.md` (08 checked, Phase 3 nearly done, 1 new decision line).

## Decisions made

- Single shared `BudgetForm` whose submit always calls `upsertBudget`; category locked on edit (06/08 review aftermath: assertion comments now required inline, debt closed).
- `copyLastMonth` derives source month server-side, skip-existing, immediate run with pending + inline error (no confirm — non-destructive).
- `lib/mockBudgets.ts` kept on disk but unwired (developer decision, against the 07 note).
- `shiftMonth` promoted to `lib/utils.ts` next to `monthKey`; `upsertBudgetSchema.limit` is `z.coerce.number()` (forms send strings, same as 05's amount).
- Skills used: architect (plan + blueprint, all 4 answers confirmed), tdd (vertical slices), tailwind-v4 (no visual changes), review (1 minor → fixed same session).

## Problems solved

- None — no blockers. Upsert race handled the same way as categories (`P2002` → re-read + update) instead of a separate code path.

## Current state

- `npm test`: 169/169 passing (40 files, +31 new this session). `typecheck`, `lint`, `npm run build` clean. Build shows `ƒ /budgets` (dynamic, correct).
- Phase 3: 08 done, budgets fully wired. Everything implemented and verified but uncommitted (01–08 now uncommitted).

## Next session starts with

- Build 09 Dashboard Page — Full UI per `context/build-plan.md`: four stat cards (Spent/Income/Balance/Over-Budget mock numbers), Spending by Category bar chart (mock), Income vs Expense line chart (mock 6 months), Budget vs Actual progress list (mock), Recent Transactions list (mock), empty states; mock-data UI first, no logic (10/11 wire it).

## Open questions

- None. 09 scope is fully specified in the build plan.
