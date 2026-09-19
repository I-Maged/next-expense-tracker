# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Navbar — `components/layout/Navbar.tsx`

- `ctaHref` prop (default `/signup`) — homepage passes `/dashboard` when authenticated

- Header: `w-full border-b border-border bg-surface`
- Inner: `mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6`
- Logo mark: 36px (`h-9 w-9`) `rounded-[10px]`, inline gradient `linear-gradient(45deg, #7C5CFC 0%, #4A2EC5 100%)`, white bold letter
- Logo text: `text-[19px] font-bold leading-7 text-text-darkest`
- Nav: `hidden items-center gap-6 md:flex`, links `text-sm font-medium leading-5 text-text-dark hover:text-accent`
- CTA: `rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark`, href `/signup`

### Hero — `components/homepage/Hero.tsx`

- `authenticated` prop (default `false`) — both CTAs point at `/dashboard` when true

- Section: `mx-auto flex w-full max-w-[1440px] flex-col items-center px-8 pt-16 pb-12 text-center md:pt-24`
- H1: `max-w-2xl text-4xl font-bold text-text-primary md:text-6xl`
- Sub: `mt-4 max-w-xl text-base text-text-secondary md:text-lg`
- CTAs: primary `bg-accent ... px-6 py-3` → `/signup`; secondary `border border-border bg-surface ... hover:bg-surface-secondary` → `/login`
- Preview: `.card mt-12 w-full max-w-3xl text-left` + `data-testid="app-preview"`; stat `text-3xl font-semibold tabular-nums`; badge `rounded-full bg-success-lightest px-2.5 py-1 text-xs font-medium text-success-foreground`; bars track `h-2 rounded-full bg-border-light`, fills `bg-accent` / `bg-success` / `bg-warning` via inline width

### Features — `components/homepage/Features.tsx`

- Section band: `w-full bg-surface`; inner `mx-auto max-w-[1440px] px-8 py-16`
- Heading: centered `text-2xl font-semibold text-text-primary`
- Grid: `grid grid-cols-1 gap-6 md:grid-cols-3`; cards use `.card`
- Icon chip: `flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light`, icon `h-5 w-5 text-accent` (lucide: Zap, Wallet, BarChart3)

### HowItWorks — `components/homepage/HowItWorks.tsx`

- Same section shell as Features (no band bg); `ol` with `grid grid-cols-1 gap-6 md:grid-cols-3`
- Step number: `flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted text-base font-semibold text-accent`
- Cards use `.card`

### BottomCta — `components/homepage/BottomCta.tsx`

- `authenticated` prop (default `false`) — CTA points at `/dashboard` when true

- Band `w-full bg-surface`, centered; H2 `text-3xl font-bold text-text-primary`; CTA same primary style → `/signup`

### Footer — `components/layout/Footer.tsx`

- `authenticated` prop (default `false`) — Account links (Sign In, Get Started) point at `/dashboard` when true

- `w-full border-t border-border bg-surface`; inner `mx-auto max-w-[1440px] px-6 py-10 md:flex-row`
- Link groups: label `text-xs font-medium uppercase tracking-wide text-text-muted`, links `text-sm font-medium text-text-dark hover:text-accent`
- Bottom bar: `border-t border-border`, `text-xs text-text-muted` © line

### Button — `components/ui/button.tsx`

- Base: `rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed`
- Primary (default): `bg-accent text-accent-foreground hover:bg-accent-dark disabled:opacity-60`
- Secondary: `border border-border bg-surface text-text-primary hover:bg-surface-secondary disabled:opacity-60`
- Danger: `border border-border bg-surface text-error hover:bg-surface-secondary disabled:opacity-60`
- Merged via `cn()` from `lib/utils.ts`; caller `className` appended last

### Input — `components/ui/input.tsx`

- `w-full rounded-md border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent`
- Border: `border-border` default, `border-error` when `invalid`; sets `aria-invalid` when invalid

### Label — `components/ui/label.tsx`

- `text-sm font-medium leading-5 text-text-secondary`, bound via `htmlFor`

### SocialButtons — `components/auth/SocialButtons.tsx`

- Wrapper: `flex flex-col gap-3`; per-provider row `flex flex-col gap-2`
- Secondary `Button`s: "Continue with Google" / "Continue with GitHub"; pending shows "Connecting to …" and disables both
- Failure text: `text-sm text-error` with `role="alert"`, human-readable only (never raw provider error)

### LoginForm — `components/auth/LoginForm.tsx`

- Form: `flex flex-col gap-4` with `noValidate`; fields `flex flex-col gap-2`
- `Label` + `Input` pairs (`login-email`, `login-password`); field errors `text-sm text-error` with `role="alert"`
- Submit: primary `Button type="submit"`, "Sign In" / "Signing in…" while pending

### SignupForm — `components/auth/SignupForm.tsx`

- Same shell as LoginForm; fields `signup-name`, `signup-email`, `signup-password`
- Submit: "Create Account" / "Creating account…" while pending

### Login page — `app/(auth)/login/page.tsx`

- `main`: `mx-auto flex w-full max-w-144 flex-col px-8 py-16`; card: `.card flex flex-col gap-6`
- Header block centered: H1 `text-2xl font-semibold leading-8 text-text-primary` ("Welcome back"), sub `text-sm font-medium leading-5 text-text-secondary`
- Divider: `flex items-center gap-4` with `h-px flex-1 bg-border` rules + `text-xs text-text-muted` "or"
- Footer line: `text-center text-sm font-medium leading-5 text-text-secondary`, link `text-accent hover:underline` → `/signup` ("Create an account")

### Signup page — `app/(auth)/signup/page.tsx`

- Same shell as login page; H1 "Create your account"; footer link → `/login` ("Sign in")

### AppNavbar — `components/layout/AppNavbar.tsx`

- `activePath` prop (e.g. `/transactions`) + optional `userEmail`
- Same header shell as Navbar: `w-full border-b border-border bg-surface`, inner `mx-auto flex h-16 w-full max-w-360 items-center justify-between gap-4 px-6`, same logo mark/text
- Nav links: active `text-sm font-medium leading-5 text-accent` + `aria-current="page"`; inactive `text-sm font-medium leading-5 text-text-dark hover:text-accent`
- Right side: email `hidden text-sm font-medium text-text-secondary sm:block` + `SignOutButton`

### SignOutButton — `components/layout/SignOutButton.tsx`

- `"use client"`; secondary `Button` "Sign out" → `authClient.signOut()` then `router.push("/")`; failures logged with `[SignOutButton]` prefix, still redirect

### Transactions page — `app/transactions/page.tsx`

- Server guard: `auth.api.getSession()` → `redirect("/login")` when null; `AppNavbar activePath="/transactions"` + `userEmail`
- Calls `seedDefaultCategories()` before reads (8 defaults only when zero)
- Reads `searchParams` (`search/category/type/month/page`), defaults month to `monthKey(new Date())`, page to 1; Prisma `count` + `findMany` scoped by `userId` (month range `gte/lt`, category, type, note `contains insensitive`, `orderBy date desc`, `take/skip` 20); `Decimal.toNumber()` + `YYYY-MM-DD` mapping at boundary
- `main`: `mx-auto flex w-full max-w-360 flex-col gap-6 px-8 py-8`; renders `TransactionsView` with paged `TransactionView` rows + `CategoryView` list + pagination numbers

### TransactionFilters — `components/transactions/TransactionFilters.tsx`

- `"use client"` controlled component: `search/categoryId/typeFilter/month` values + `onXChange` callbacks, `categories: CategoryView[]` prop (05: same shape as mocks, real DB rows)
- Wrapper `.card` + `grid grid-cols-1 gap-4 md:grid-cols-4`; `Label` + `Input`/`select` pairs (`transaction-search` placeholder "Search notes...", `transaction-category` with "All categories" + 8, `transaction-type` All/Income/Expense, `transaction-month` `type="month"`); selects `w-full` (base chrome from globals.css)

### TransactionsTable — `components/transactions/TransactionsTable.tsx`

- Server presentational, `transactions: TransactionView[]` prop + optional `onEdit`/`onDelete` row callbacks (05: wired to dialogs; buttons still render without callbacks) wrapper `card overflow-x-auto p-0`, `table w-full border-collapse text-left` + `data-testid="transactions-table"`
- Headers: `px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary`, Amount/Actions `text-right`
- Rows `border-b border-border last:border-0 hover:bg-surface-secondary`; date `whitespace-nowrap tabular-nums`; empty note renders muted "—"
- Category pill `inline-flex items-center gap-2 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-secondary` + 8px dot via inline `backgroundColor`
- Type pill: Income `bg-success-lightest text-success-foreground`, Expense `bg-surface-secondary text-text-secondary`
- Amount `text-right tabular-nums whitespace-nowrap`, `+`/`-` prefix + `formatCurrency()`; Income `text-success`, Expense `text-text-primary`
- Actions: ghost icon buttons (`Pencil`/`Trash2` `h-4 w-4`, `rounded-md p-2`, hover `text-error` on delete), `aria-label="Edit|Delete transaction <id>"`, call `onEdit`/`onDelete` when provided

### TransactionsPagination — `components/transactions/TransactionsPagination.tsx`

- `"use client"`; `page/totalPages/total/start/end/onPageChange` props; `nav aria-label="Transactions pagination"` `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
- Range text `text-xs leading-4 text-text-muted` ("Showing 1 to 20 of 48"); secondary Previous/Next (disabled at edges) + numbered `Button`s (current = primary + `aria-current="page"`, `aria-label="Page N"`)

### TransactionsView — `components/transactions/TransactionsView.tsx`

- `"use client"` URL-driven shell: server-provided `transactions/categories/total/page/totalPages/start/end/search/categoryId/typeFilter/month` props; filter changes `router.push` new query (defaults deleted, `page` reset), pagination sets `?page=` (deleted when 1)
- Owns header row (H1 + Add `Button` with `Plus`) + `TransactionForm` (`key` by editing id or `"new"`/`"closed"`) + `DeleteTransactionDialog` (`key` by deleting id); success calls `router.refresh()`
- Empty (`total=0`, no active filters): `.card` centered `text-sm font-medium text-text-muted` "No transactions yet — add your first transaction" + primary CTA opening the form
- No-results (`total=0` with search/category/type active): same shell, "No transactions match these filters." + secondary "Clear filters" (keeps month, drops rest)

### Dialog — `components/ui/dialog.tsx`

- `"use client"` hand-rolled (no radix dep): `open/onClose/title/children` props, `null` when closed; overlay `fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 p-4` (`data-testid="dialog-overlay"`, backdrop-click close), panel `.card w-full max-w-md` with `role="dialog" aria-modal` + H2 `text-base font-semibold leading-6 text-text-primary`; Escape closes via `keydown` listener

### TransactionForm — `components/transactions/TransactionForm.tsx`

- `"use client"` dialog form: `open/onClose/categories/initial/onSuccess` props; type toggle `Expense`/`Income` (`role="group" aria-label="Type"`, `aria-pressed`, Expense default); `Amount` (`transaction-amount`, `inputMode="decimal"`, `autoFocus`, placeholder "0.00"), category select (`transaction-form-category`), date (`transaction-form-date`, `type="date"`, `max` today), note (`transaction-form-note`, `maxLength` 200)
- Client checks (amount > 0, max 2 decimals, category chosen, date ≤ today, note ≤ 200) then `createTransaction` or `updateTransaction({id})`; errors `text-sm text-error` with `role="alert"`; submit pending "Saving…" / "Save changes" vs "Add transaction"; Cancel secondary

### DeleteTransactionDialog — `components/transactions/DeleteTransactionDialog.tsx`

- `"use client"` confirm: `open/onClose/transaction/onSuccess` props; summary `"Delete "<note>" (<sign><amount>)? This cannot be undone.` (empty note → "Untitled"); danger `Delete` (pending "Deleting…") calls `deleteTransaction({id})`; errors `role="alert"`; Cancel secondary

### Transaction view types — `components/transactions/types.ts`

- `CategoryView { id, name, color }`, `TransactionView { id, date: YYYY-MM-DD, note, type, amount: number, categoryId, category }` — server maps Prisma `Decimal`/`DateTime`/nullable note to this before passing to client

### Settings page — `app/settings/page.tsx`

- Server guard: `auth.api.getSession()` → `redirect("/login")` when null; `AppNavbar activePath="/settings"` + `userEmail`
- Calls `seedDefaultCategories()` before reads; `prisma.category.findMany` scoped by `userId` (`orderBy name asc`, `include _count transactions`); maps to `CategoryWithCount` at boundary
- `main`: `mx-auto flex w-full max-w-360 flex-col gap-6 px-8 py-8`; renders `CategoryManager`

### CategoryManager — `components/settings/CategoryManager.tsx`

- `"use client"` shell: `categories: CategoryWithCount[]` prop; owns header row (H1 "Settings" + "Manage your categories." + Add `Button` with `Plus`) + `CategoryForm` (`key` by editing id or `"new"`/`"form-closed"`) + `DeleteCategoryDialog` (`key` by deleting id); success calls `router.refresh()`
- List: `.card p-0` + `ul data-testid="category-list"`; rows `flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0`; dot 8px via inline `backgroundColor` + name `truncate text-sm font-medium text-text-primary` + count `text-xs text-text-muted` ("N transaction(s)" / "No transactions"); ghost icon buttons (`Pencil`/`Trash2` `h-4 w-4`, `rounded-md p-2`, edit hover `text-text-primary`, delete hover `text-error`), `aria-label="Edit|Delete category <id>"`
- Empty: `.card` centered `text-sm font-medium text-text-muted` "No categories yet — add your first category" + primary CTA opening the form

### CategoryForm — `components/settings/CategoryForm.tsx`

- `"use client"` dialog form: `open/onClose/initial/onSuccess` props; `Name` (`category-name`, placeholder "e.g. Groceries", `maxLength` 40, `autoFocus`), color swatches `role="radiogroup"` (`CATEGORY_COLORS` 8 dots, `h-6 w-6 rounded-full`, inline `backgroundColor`, `role="radio"` + `aria-checked`, selected `ring-2 ring-accent ring-offset-2 ring-offset-surface` else `border border-border`)
- Client checks (name non-empty after trim, max 40, color in palette) then `createCategory` or `updateCategory({id})` with trimmed name; errors `text-sm text-error` with `role="alert"`; submit pending "Saving…" / "Save changes" vs "Add category"; Cancel secondary

### DeleteCategoryDialog — `components/settings/DeleteCategoryDialog.tsx`

- `"use client"` confirm: `open/onClose/category/onSuccess` props; summary `"Delete "<name>" (N transactions)? This cannot be undone.` (count line omitted when 0); danger `Delete` (pending "Deleting…") calls `deleteCategory({id})`; blocked/server errors `role="alert"`; Cancel secondary

### Settings view types — `components/settings/types.ts`

- `CategoryWithCount { id, name, color, transactionCount }` — server maps Prisma `_count.transactions` to this before passing to client

### Budgets page — `app/budgets/page.tsx`

- Server guard: `auth.api.getSession()` → `redirect("/login")` when null; `AppNavbar activePath="/budgets"` + `userEmail`
- No Prisma, no seeding (pure mocks like 04) — passes `MOCK_BUDGETS` to `BudgetsView`
- `main`: `mx-auto flex w-full max-w-360 flex-col gap-6 px-8 py-8`

### BudgetsView — `components/budgets/BudgetsView.tsx`

- `"use client"` shell: `budgets: MockBudget[]` prop; month `useState` defaulting to `monthKey(new Date())`, filters rows client-side (URL params deferred to 08)
- Header: H1 "Budgets" + "Set monthly limits and stay on track."; `Month` (`budgets-month`, `type="month"`) + secondary "Copy Last Month" (dead) + primary "Set Budget" with `Plus` (dead)
- Grid `data-testid="budget-grid"` `grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3`
- Empty: `.card` centered `text-sm font-medium text-text-muted` "No budgets this month — set your first budget" + dead primary CTA

### BudgetCard — `components/budgets/BudgetCard.tsx`

- Server presentational, `budget: MockBudget` prop; wrapper `.card flex flex-col gap-3` with `data-testid="budget-card"`
- Header: 8px dot via inline `backgroundColor` + name `truncate text-sm font-medium leading-5 text-text-primary`
- `spent / limit` line `text-sm tabular-nums text-text-secondary` via `formatCurrency()`
- Bar: track `h-2 rounded-full bg-border-light`; fill `h-full rounded-full` + `bg-success` (<80%) / `bg-warning` (80–100%) / `bg-error` (>100%), width capped at 100%, `role="progressbar"` + `aria-valuenow` percent
- Footer: remaining `text-xs leading-4 text-text-secondary` ("$X remaining") or over `text-xs font-medium leading-4 text-error` ("+$X over")
