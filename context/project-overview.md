# Project Overview

## About the Project

ExpenseTracker is a full stack personal finance app. The user signs up, creates categories once, and logs income and expenses in seconds. Monthly budgets per category keep spending in check, and a dashboard with reports shows where the money actually goes.

Single currency for v1. All data is private per user, stored in Postgres via Prisma. Auth is handled by Better-Auth with session cookies (email/password + Google + GitHub OAuth).

---

## The Problem It Solves

Personal spending is hard to see until it is too late. Bank statements are noisy, spreadsheets rot, and most tracker apps are either bloated or lock reports behind paywalls.

ExpenseTracker fixes the boring core: fast transaction entry, clear categories, monthly budgets, and honest reports. The user logs a transaction in under 10 seconds and always knows spent vs. remaining per category.

---

## Pages

```
/                  → Homepage
/login             → Sign in (email + OAuth)
/signup            → Sign up (email + OAuth)
/dashboard         → Overview, stats, charts, recent transactions
/transactions      → Full transaction list + filters + add/edit
/budgets           → Monthly budgets per category
/settings          → Categories management
```

---

## Navigation

Top navbar. Clean and minimal. Four navigation items:

```
Dashboard    Transactions    Budgets    Settings
```

Full width layout on all pages. No sidebar.

---

## Core User Flow

### Homepage

- Hero section
- Logged in users → redirect to dashboard
- Logged out users → CTA to signup/login

### Onboarding

- User signs up via Better-Auth (email/password, Google, or GitHub OAuth)
- Session stored in httpOnly cookie, persisted in `sessions` table
- On login/signup → redirect to /dashboard
- First visit seeds default categories for that user
- Dashboard shows empty states until first transaction is added

### Transactions

- User clicks Add Transaction (dashboard or transactions page)
- Modal or form: type (expense/income), amount, category, date (default today), note (optional)
- Save → appears in list + updates dashboard stats immediately
- User can edit or delete any own transaction
- Single currency only — no conversion, no currency picker

### Categories

- Default categories seeded on signup:
  - Food, Transport, Rent, Utilities, Shopping, Health, Entertainment, Other
- User can add, rename, recolor, or delete own categories in /settings
- Deleting a category with transactions is blocked — user must reassign first
- Each category has name + color dot used across tables, badges, and charts

### Budgets

- User sets one monthly limit per category per month (`YYYY-MM`)
- Budgets page shows one card per budgeted category:
  - Spent / limit, remaining, progress bar
  - Over-budget state clearly highlighted
- Copy-last-month action to roll budgets forward (one click)
- Budgets only apply to `EXPENSE` transactions

### Dashboard

- Stats bar — 4 cards: Spent This Month, Income This Month, Balance, Over-Budget Count
- Charts (recharts, queried from Postgres — no analytics vendor):
  - Spending by Category — bar chart, current month
  - Income vs Expense — line/bar chart, last 6 months
  - Budget vs Actual — per-category progress list
- Recent Transactions — last 5-8 entries, link to full list

### Transactions Page

- Filter bar at top:
  - Text search (note field)
  - Category dropdown (All + own categories)
  - Type dropdown (All / Income / Expense)
  - Month picker (default current month)
- Table rows: date, note, category badge, amount (color coded), edit/delete
- Pagination — 20 per page
- Empty state when filters match nothing

---

## Data Architecture

### Transaction Data

- Lives in `transactions` table
- Only changes when user explicitly adds, edits, or deletes
- `amount` stored as `Decimal(12,2)` — always positive, sign derived from `type`
- Used for all stats, charts, and budget calculations
- Never modified by any background job — no background jobs in v1

### Budget Data

- Lives in `budgets` table
- Unique per `(userId, categoryId, month)`
- Computed `spent` is never stored — always aggregated live from `transactions`
- Deleting a category with budgets is blocked until budgets are removed

### Category Data

- Lives in `categories` table
- Seeded per user on signup, fully user-owned after that
- Never shared between users

---

## Features In Scope

- Homepage with hero, how it works, features, footer
- Top navbar — Dashboard, Transactions, Budgets, Settings
- Better-Auth authentication (email/password + Google + GitHub OAuth)
- Session cookies (httpOnly, 7-day expiry, Prisma-persisted)
- Redirect to dashboard after login/signup
- Middleware protecting /dashboard, /transactions, /budgets, /settings
- Transaction CRUD (income/expense, amount, category, date, note)
- Single currency throughout (USD default, formatted consistently)
- Default categories seeded per user + full category management
- Monthly budgets per category + copy-last-month
- Dashboard with stats bar, recent transactions, reports charts
- Transactions page with search, category/type/month filters, pagination
- Empty states on every list and chart
- Mobile-responsive layout (stacked cards, scrollable table)

---

## Features Out of Scope

- Multi-currency or currency conversion
- Bank sync / CSV import / receipt OCR
- Recurring transactions / scheduled rules
- Shared wallets / team or multi-user accounts
- Bill reminders / notifications (email or push)
- Savings goals / investments tracking
- Data export (CSV/PDF)
- Separate analytics page — charts live on dashboard
- Sidebar navigation — top navbar only
- Admin panel / roles
- Payment or subscription system
- Mobile app

---

## Target User

An individual who:

- Wants to see where their money goes each month
- Logs mostly manual cash/card spending
- Uses one currency
- Is comfortable with a modern web application

---

## Success Criteria

- User can sign up, get default categories, and log first expense in under 2 minutes
- Add/edit/delete transaction feels instant with correct validation
- Budgets clearly show spent vs. remaining with no stale numbers
- Dashboard charts match the underlying transaction sums exactly
- All data strictly scoped to the logged-in user — no cross-user leaks
- UI is visually consistent across all pages (same tokens as defined in ui-tokens.md)
