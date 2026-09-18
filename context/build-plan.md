# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is built and wired to the UI step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

---

## Phase 1 — Foundation

### 01 Homepage

Build the complete homepage UI.

**UI:**

- Navbar — logo, Dashboard, Transactions, Budgets, Settings links, Get Started button
- Hero section — headline, subheadline, Get Started CTA and Sign In CTA
- App preview placeholder embedded below hero (static mock of dashboard card)
- Features section — three value props: Fast entry, Budgets, Reports
- How It Works section — 3 steps: sign up, log spending, stay on budget
- Bottom CTA section
- Footer

**Logic:**

- Get Started → /signup if not authenticated, /dashboard if authenticated
- Sign In → /login if not authenticated, /dashboard if authenticated

---

### 02 Auth

Better-Auth authentication — email/password + Google + GitHub OAuth, session cookies.

> Status 2026-09-18: **UI slice done, backend deferred** (developer decision: UI-only first, DB later). Done: login/signup pages (`app/(auth)/`), `SocialButtons`/`LoginForm`/`SignupForm`, `components/ui/` primitives + `lib/utils.ts` `cn()`, `lib/auth-client.ts`, `proxy.ts` cookie guard (note: `proxy.ts`, not `middleware.ts` — Next 16 renamed the convention), 22 new tests green. Still pending (lands with 03 Database + wiring step): `lib/auth.ts`, `app/api/auth/[...all]/route.ts`, Prisma schema + migrate, category seeding, homepage session-aware CTAs, live OAuth verification.

**UI:**

- Login page — email + password form, Google button, GitHub button, link to signup
- Signup page — name/email + password form, Google button, GitHub button, link to login

**Logic:**

- `lib/auth.ts` — betterAuth instance with prismaAdapter, emailAndPassword, Google + GitHub providers, 7-day session, `nextCookies()` last
- `lib/auth-client.ts` — browser client
- `app/api/auth/[...all]/route.ts` — catch-all handler (only API route)
- Session cookie httpOnly, persisted in `sessions` table
- `middleware.ts` — cookie-presence guard for /dashboard, /transactions, /budgets, /settings; redirect logged-in users away from /login, /signup
- After login/signup → redirect to /dashboard
- Sign out → redirect to /

---

### 03 Database + Docker

All Prisma models and local Postgres ready before any app data is written.

**Logic:**

- `docker-compose.yml` — Postgres 16, port 5432, volume pgdata
- `.env` — `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Google/GitHub IDs + secrets
- Run `bunx auth generate` for User, Session, Account, Verification models
- Add `categories`, `transactions`, `budgets` models per architecture.md
- `prisma migrate dev` — verify tables
- `lib/prisma.ts` singleton — verified importable server-side
- `lib/validations.ts` — zod schemas for transaction, budget, category
- `lib/utils.ts` — `formatCurrency()`, `monthKey()`, `DEFAULT_CATEGORIES`, `TRANSACTIONS_PER_PAGE`

---

## Phase 2 — Transactions (Core)

### 04 Transactions Page — Full UI

Build the complete transactions page UI with mock data. No logic yet.

**UI:**

- Header row — title + Add Transaction button
- Filter card: search input ("Search notes..."), Category dropdown, Type dropdown (All/Income/Expense), Month picker
- Table with columns: DATE, NOTE, CATEGORY (dot + name), TYPE badge, AMOUNT (right-aligned, +/- prefix), ACTIONS (edit/delete)
- Pagination — "Showing 1 to 20 of 48", Previous, page numbers, Next
- Empty state (no data) + no-results state (filters match nothing)

---

### 05 Transaction CRUD Logic

Wire add/edit/delete to Postgres via Server Actions.

**Logic:**

- `actions/transactions.ts` — create, update, delete; session check + zod + category-ownership check + user-scoped Prisma
- `actions/categories.ts` — seed defaults on first login (only when zero categories exist)
- TransactionForm dialog — type toggle (Expense default), amount (`inputMode="decimal"`), category select, date (default today, max today), note (max 200)
- Delete asks confirm via dialog
- `revalidatePath("/transactions")` + `revalidatePath("/dashboard")` after every mutation
- Wire filters + search + pagination to real Prisma queries (20 per page)

---

### 06 Settings Page — Categories

**UI:**

- Category list — dot, name, transaction count, edit/delete buttons
- Add Category form — name + color picker (preset swatches)
- Empty state when no categories

**Logic:**

- `actions/categories.ts` — create, rename, recolor, delete
- Name unique per user — friendly error on duplicate
- Delete blocked when transactions or budgets reference the category — message tells user to reassign/delete those first

---

## Phase 3 — Budgets

### 07 Budgets Page — Full UI

Build the complete budgets page UI with mock data. No logic yet.

**UI:**

- Header row — month picker (default current month) + Copy Last Month button + Set Budget button
- Budget cards grid — per category: name + dot, progress bar, `spent / limit`, remaining or `+$X over`, over-budget highlight
- Empty state when no budgets this month

---

### 08 Budget Logic

Wire budgets to real data.

**Logic:**

- `actions/budgets.ts` — upsert (one per category per month), delete, copy-last-month
- `spent` aggregated live from `transactions` (EXPENSE only, in selected month) — never stored
- Progress color: green <80%, orange 80-100%, red >100%
- Month format always `YYYY-MM` via `monthKey()`
- `revalidatePath("/budgets")` + `revalidatePath("/dashboard")` after mutations

---

## Phase 4 — Dashboard + Reports

### 09 Dashboard Page — Full UI

Build the complete dashboard UI with mock data.

**UI:**

- Four stat cards: Spent This Month, Income This Month, Balance, Over-Budget Count — mock numbers
- Spending by Category — bar chart (mock, 7-8 categories)
- Income vs Expense — line chart (mock, last 6 months)
- Budget vs Actual — progress list (mock, 4-5 rows)
- Recent Transactions — last 5 entries with category badges
- Empty states for each section

---

### 10 Stats + Recent — Real Data

Wire stat cards and recent list to Prisma.

**Logic:**

- Spent This Month — SUM EXPENSE where date in current month
- Income This Month — SUM INCOME where date in current month
- Balance — income minus spent (all time or month — pick month, document in progress-tracker)
- Over-Budget Count — budgets this month where spent > limit
- Recent Transactions — latest 5-8 by date for current user with category

---

### 11 Charts — Real Data (recharts)

Wire charts to Prisma aggregates. No analytics vendor.

**Logic:**

- Spending by Category — `groupBy categoryId` EXPENSE current month, pass `{ name, total: number }` to Client BarChart
- Income vs Expense — monthly sums last 6 months, two lines (`#10B981` income, `#7C5CFC` expense)
- Budget vs Actual — budgets this month + live spent per category
- Convert `Decimal` → `number` at Server boundary before passing to charts
- Empty state per chart when no data

---

## Phase 5 — Polish

### 12 Responsive + Empty-State Pass

- Mobile: stat cards stack, charts stack, table scrolls, dialogs full-width
- Verify every empty state from ui-rules.md renders
- Verify currency formatting consistent via `formatCurrency()` everywhere
- Verify over-budget states unmissable but not noisy

### 13 Auth Edge Cases + Seed Check

- New user gets exactly 8 default categories once — no duplicates on re-login
- Logged-out access to protected routes → /login
- Logged-in access to /login, /signup → /dashboard
- Invalid inputs (negative amount, >2 decimals, future date, bad month) rejected with friendly text

---

## Feature Count

| Phase                | Features |
| -------------------- | -------- |
| Phase 1 — Foundation | 3        |
| Phase 2 — Transactions | 3      |
| Phase 3 — Budgets    | 2        |
| Phase 4 — Dashboard  | 3        |
| Phase 5 — Polish     | 2        |
| **Total**            | **13**   |
