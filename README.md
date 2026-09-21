# ExpenseTracker

A full-stack personal finance app. Sign up, get default categories, and log
income and expenses in seconds. Monthly budgets per category keep spending in
check, and a dashboard with reports shows where the money actually goes.

Single currency for v1. All data is private per user, stored in Postgres via
Prisma. Auth is handled by Better-Auth with session cookies (email/password +
Google + GitHub OAuth).

## Features

- **Authentication** — email/password plus Google and GitHub OAuth; 7-day
  httpOnly session cookies persisted in Postgres.
- **Transactions** — add/edit/delete income and expenses (amount, category,
  date, optional note) with zod validation on client and server.
- **Transactions page** — text search on notes, category/type/month filters,
  and pagination (20 per page) with empty states.
- **Categories** — 8 defaults seeded per user (Food, Transport, Rent,
  Utilities, Shopping, Health, Entertainment, Other); add, rename, recolor,
  or delete your own in Settings. Deleting a category referenced by
  transactions or budgets is blocked.
- **Budgets** — one monthly limit per category per month (`YYYY-MM`), spent /
  limit progress with over-budget highlighting, and one-click copy-last-month
  rollover. Spent totals are always aggregated live, never stored.
- **Dashboard** — 4 stat cards (spent, income, balance, over-budget count),
  spending-by-category and 6-month income-vs-expense charts, budget-vs-actual
  list, and recent transactions.
- **Route protection** — `proxy.ts` redirects logged-out users to `/login`
  and logged-in users away from `/login`/`/signup` via cookie-presence check.

## Tech stack

| Layer      | Tool                    | Purpose                          |
| ---------- | ----------------------- | -------------------------------- |
| Framework  | Next.js 16 (App Router) | Full-stack framework             |
| Language   | TypeScript (strict)     | Throughout                       |
| UI         | React 19, Tailwind v4, shadcn/ui | Components and styling  |
| ORM / DB   | Prisma 7 / Postgres 16 (Docker) | Data + migrations       |
| Auth       | Better-Auth             | Email/password + OAuth, sessions |
| Validation | Zod                     | Forms + Server Action validation |
| Charts     | Recharts                | Dashboard reports                |
| Tests      | Vitest 5 + Testing Library | Unit + integration tests      |

## Project structure

```text
├── app/                          → Pages + one auth route. No business logic.
│   ├── page.tsx                  → Homepage (personalized when logged in)
│   ├── (auth)/login|signup/      → Sign in / sign up pages
│   ├── dashboard/                → Stats + charts + recent transactions
│   ├── transactions/             → Filters + table + pagination
│   ├── budgets/                  → Budget cards + set/edit + copy-last-month
│   ├── settings/                 → Category management
│   └── api/auth/[...all]/        → Better-Auth catch-all handler only
├── actions/                      → All mutations (Server Actions)
│   ├── transactions.ts           → Transaction CRUD
│   ├── budgets.ts                → Budget upsert/delete/copy-last-month
│   └── categories.ts             → Category CRUD + default seeding
├── components/                   → UI only. No Prisma, no auth.api calls.
│   ├── ui/                       → shadcn/ui primitives
│   ├── layout/                   → Navbar, footers, theme toggle
│   ├── homepage|dashboard|transactions|budgets|settings|auth/
├── lib/
│   ├── auth.ts                   → Better-Auth server instance
│   ├── auth-client.ts            → Better-Auth browser client
│   ├── prisma.ts                 → Prisma singleton (only `new PrismaClient`)
│   ├── validations.ts            → Zod schemas
│   └── utils.ts                  → cn(), currency formatting, constants
├── prisma/schema.prisma          → Single source of truth for the DB schema
├── tests/integration/            → Real-DB + real-auth integration suite
└── proxy.ts                      → Cookie-presence route guard (no DB calls)
```

Key invariants: every Server Action checks the session first, validates with
zod, and scopes every Prisma query by `session.user.id`. Amounts/limits are
always positive `Decimal(12,2)` — the sign comes from `type`
(`INCOME`/`EXPENSE`) only. Months are always `YYYY-MM`.

## Getting started

Prerequisites: Node.js 20+, Docker (for Postgres).

```bash
# 1. Configure environment
cp .env.example .env
# then fill in real values (see table below)

# 2. Start Postgres
docker compose up -d

# 3. Apply migrations
npx prisma migrate dev

# 4. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, and your default
categories are seeded automatically on first visit.

### Environment variables

| Variable               | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `POSTGRES_USER`        | Local Postgres user (Docker)                         |
| `POSTGRES_PASSWORD`    | Local Postgres password (Docker)                     |
| `POSTGRES_DB`          | Local Postgres database name (Docker)                |
| `DATABASE_URL`         | Prisma datasource URL (dev database)                 |
| `DATABASE_URL_TEST`    | Separate database for integration tests (see below)  |
| `BETTER_AUTH_SECRET`   | Session signing secret — any random 32+ char string, e.g. `openssl rand -base64 32` |
| `BETTER_AUTH_URL`      | App base URL (`http://localhost:3000` locally)       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional)               |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth (optional)               |

Never commit `.env`. Email/password auth works with zero OAuth config.

## OAuth setup

1. **Google** — create OAuth credentials in the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   add `http://localhost:3000/api/auth/callback/google` as an authorized
   redirect URI, and copy the client ID/secret into `.env`.
2. **GitHub** — register a new OAuth app in
   [GitHub Developer Settings](https://github.com/settings/developers) with
   authorization callback URL
   `http://localhost:3000/api/auth/callback/github`, and copy the credentials
   into `.env`.
3. Restart `npm run dev`. The login/signup pages show the social buttons
   automatically.

For production, repeat with your production URL in both the provider consoles
and `BETTER_AUTH_URL`.

## Scripts

| Script                | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `npm run dev`         | Start the dev server                                 |
| `npm run build` / `start` | Production build / serve                         |
| `npm run typecheck`   | `tsc --noEmit`                                       |
| `npm run lint`        | ESLint (generated `coverage/` output is ignored)     |
| `npm test` / `test:unit` | Mocked unit + component suite (jsdom)             |
| `npm run test:integration` | Real Postgres + real Better-Auth suite          |
| `npm run test:all`    | Both suites                                          |

## Testing strategy

Two Vitest projects (`vitest.config.mts`):

- **Unit** (`npm test`, ~250 tests) — jsdom with Prisma/auth mocked:
  zod schemas (`lib/validations`), utils/theme, Server Actions
  (`actions/*.test.ts`: auth guards, ownership scoping, `revalidatePath`),
  `proxy.ts` redirects, all UI components, and async Server Component pages.
- **Integration** (`npm run test:integration`, 24 tests) — real
  `expense_tracker_test` database plus the real Better-Auth signup/sign-in
  flow (signed session cookies are captured from actual `Set-Cookie`
  headers). Only `next/headers` and `next/cache` are mocked. Covers the auth
  API route, action CRUD against Postgres, and robustness: concurrent upserts
  converging to one row, `Decimal(12,2)` extremes vs extra-decimal rejection,
  pagination boundaries, and revoked-session handling.

Setup for integration tests:

```bash
CREATE DATABASE expense_tracker_test;
DATABASE_URL_TEST="postgresql://…/expense_tracker_test" npx prisma migrate deploy
npm run test:integration
```

See `tests/integration/README.md` for harness internals.

## Data model

| Table          | Notes                                                                 |
| -------------- | --------------------------------------------------------------------- |
| `categories`   | Per-user, `@@unique([userId, name])`, hex color dot                   |
| `transactions` | `type` (`INCOME`/`EXPENSE`), positive `Decimal(12,2)` amount, `date`, optional searchable `note`; indexes on `(userId, date)`, `(userId, categoryId)` |
| `budgets`      | `@@unique([userId, categoryId, month])`, positive `Decimal(12,2)` limit; `spent` computed live from expenses |
| `user`, `session`, `account`, `verification` | Owned by Better-Auth; app code reads `session.user.id` only |

## Deployment notes

- `npm run build` / `npm start`. Set all production env vars
  (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, OAuth creds).
- Provision Postgres and run `npx prisma migrate deploy` (never `migrate dev`
  or hand-edits against production).
- Update OAuth redirect URIs and `BETTER_AUTH_URL` to the production domain.

## Out of scope for v1

Multi-currency/conversion, bank sync / CSV import / receipt OCR, recurring
transactions, shared wallets, bill reminders, savings goals, data export,
admin panel, subscriptions, mobile app.
