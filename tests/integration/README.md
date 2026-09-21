# Integration tests (real Postgres + real better-auth)

Run: `npm run test:integration` (unit suite stays on `npm test`).

## Setup

1. Create a **separate** test database (never dev/prod):
   `CREATE DATABASE expense_tracker_test;`
2. Apply migrations to it:
   `DATABASE_URL_TEST="postgresql://…/expense_tracker_test" npx prisma migrate deploy`
   (or set `DATABASE_URL_TEST` in `.env` — see `.env.example`).
3. Without `DATABASE_URL_TEST`, setup derives `expense_tracker_test` from
   `DATABASE_URL` with a warning. Explicit `DATABASE_URL_TEST` is preferred.

## How it works

- `setup.ts` runs first and repoints `DATABASE_URL` at the test DB, so
  `lib/prisma` and `lib/auth` hit the test database. Nothing touches dev data.
- `helpers/db.ts` owns a dedicated test client + `truncateAll` /
  `truncateDomain` (FK-safe order). Never import `@/lib/prisma` here.
- `helpers/auth.ts` runs the **real** email+password flow
  (`signUpEmail` → `signInEmail` with `asResponse` to capture the **signed**
  session cookies). Server-action tests mock only `next/headers` (returning
  those cookies) and `next/cache` — auth + Prisma stay real.
- `vitest.config.mts` runs integration serially (`fileParallelism: false`)
  because all files share one test DB.
