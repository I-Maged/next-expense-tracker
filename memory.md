# Memory — 05 Transaction CRUD Logic

Last updated: 2026-09-19

## What was built

- `actions/transactions.ts` (+ test, 9 tests): `createTransaction` / `updateTransaction` / `deleteTransaction` — `"use server"`, session check + zod `safeParse` + category-ownership `findFirst` + user-scoped Prisma writes, `revalidatePath("/transactions")` + `("/dashboard")`, never throws (returns `{ success }`).
- `actions/categories.ts` (+ test, 4 tests): `seedDefaultCategories()` — creates 8 defaults (names from `DEFAULT_CATEGORIES`, mock palette colors) only when user has zero categories.
- `lib/validations.ts`: `amount` is now `z.coerce.number()` (forms send strings), new `updateTransactionSchema` (create + `id`) and `deleteTransactionSchema`, future-date check is dynamic (`getTime() <= Date.now()` instead of module-load `new Date()`).
- `components/ui/dialog.tsx` (+ test, 3 tests): hand-rolled accessible dialog (no radix dep) — overlay `bg-overlay/60` with backdrop-click close, `.card w-full max-w-md` panel, `role="dialog"`, Escape to close.
- `components/transactions/TransactionForm.tsx` (+ test, 5 tests): one dialog form for create + edit (`initial` prop, Expense default type toggle, amount `inputMode="decimal"` + `autoFocus`, category select, date `max` today, note max 200, client checks + server error `role="alert"`).
- `components/transactions/DeleteTransactionDialog.tsx` (+ test, 3 tests): confirm dialog with note/amount summary, danger Delete, server error `role="alert"`.
- `components/transactions/types.ts`: `CategoryView` / `TransactionView` (server maps Prisma `Decimal`→number, `DateTime`→`YYYY-MM-DD`, null note→`""` at boundary).
- `app/transactions/page.tsx` (+ rewritten test, 3 tests): awaits `searchParams` (`search/category/type/month/page`, month defaults to `monthKey(new Date())`), seeds categories, Prisma `count` + `findMany` scoped by `userId` (month `gte/lt` range, category, type, note `contains insensitive`, `orderBy date desc`, `take/skip` 20).
- `components/transactions/TransactionsView.tsx` (rewritten, 7 tests): URL-driven shell — owns header row + Add button, filter changes `router.push` new query (defaults deleted, page reset), pagination sets `?page=`, dialogs remounted via `key`, success calls `router.refresh()`; empty vs no-results states (month excluded from active-filter check). `TransactionsTable` takes `TransactionView` + optional `onEdit`/`onDelete`; `TransactionFilters` takes `CategoryView[]`.
- Docs: `context/ui-registry.md` (5 new/updated entries), `context/progress-tracker.md` (05 checked, 6 new decisions).

## Decisions made

- Server URL filters (`?search=&category=&type=&month=&page=`) replace client `useMemo` filtering — shareable URLs, real 20/page pagination; month defaults to current month (04's all-months default retired with the mocks).
- Hand-rolled dialog over `@radix-ui/react-dialog` — no new dependency per code-standards simpler-native rule.
- Single `TransactionForm` for create + edit; separate delete-confirm dialog.
- Dialog state reset via parent `key` remount (no `setState`-in-effect, satisfies `react-hooks/set-state-in-effect` lint); closed keys namespaced per dialog (`"form-closed"` / `"delete-closed"`).
- Category seeding stays in 05, triggered on transactions page load before reads (answers the 04 open question).
- Skills used: architect (plan + blueprint, all 4 recommendations confirmed), tdd (vertical slices), tailwind-v4 (token-only classes).

## Problems solved

- `react-hooks/set-state-in-effect` lint errors from resetting form state in `useEffect` on open — replaced with `key`-based remount from the parent.
- Duplicate `key="closed"` React warning (both dialogs are siblings with the same closed key) — namespaced to `"form-closed"` / `"delete-closed"`.
- Stray file written to wrong path (`episode-tracker/` typo) during page test rewrite — removed, correct file rewritten.
- Mock `amount` objects in page test need `.toNumber()` (page maps Prisma `Decimal` at boundary) — mocked as `{ toNumber: () => n }`.

## Current state

- `npm test`: 88/88 passing (29 files, +25 new this session). `typecheck`, `lint`, `npm run build` clean. Build shows `ƒ /transactions` (dynamic, correct).
- Phase 2: 05 done. Everything implemented and verified but uncommitted (01–05 now uncommitted).

## Next session starts with

- Build 06 Settings Page — Categories per `context/build-plan.md`: category list (dot, name, transaction count, edit/delete), Add Category form (name + preset color swatches), empty state; `actions/categories.ts` create/rename/recolor/delete with per-user name uniqueness and delete-blocked-when-referenced logic.

## Open questions

- None. 04's seeding question is resolved (seeding lives in 05).
