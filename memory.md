# Memory — 03 Database + Docker, Auth wiring live

Last updated: 2026-09-18 (evening)

## What was built

- `docker-compose.yml`: Postgres `16-alpine`, port 5432, `pgdata` volume; credentials via `${POSTGRES_USER}` / `${POSTGRES_PASSWORD}` / `${POSTGRES_DB}` with no defaults (fail loudly without `.env`). Validated with `docker compose config`; container up and bound.
- `.env.example` (committed template, placeholders only) + `!.env.example` in `.gitignore` (was swallowed by `.env*`). Real `.env` stays gitignored with all 10 keys (auth secret, URLs, OAuth IDs + secrets, Postgres vars).
- `prisma.config.ts`: datasource URL from env via `process.loadEnvFile()` (Prisma 7 does not auto-load `.env`; dotenv deliberately not installed).
- `prisma/schema.prisma`: singular auth tables (`user`, `session`, `account`, `verification` — fields verified against installed better-auth 1.7.5) + `categories`/`transactions`/`budgets` (cuid, uniques, indexes, `Decimal(12,2)`, `Restrict` on category refs). Migrated (`20260918180336_init`), all 7 tables live.
- `lib/prisma.ts`: `PrismaPg` adapter singleton, live-queried OK.
- `lib/validations.ts` + test (6 tests): transaction/budget/category zod schemas per `library-docs.md`.
- `lib/utils.ts` extensions + test (5 tests): `CURRENCY`, `TRANSACTIONS_PER_PAGE`, `formatCurrency()`, `monthKey()`, `DEFAULT_CATEGORIES`.
- `lib/auth.ts` + `app/api/auth/[...all]/route.ts` (only API route).
- Session-aware homepage: `app/page.tsx` async `getSession`, `authenticated` flag into Navbar (`ctaHref`), Hero, BottomCta, Footer (4th Get Started link found during testing). `app/page.test.tsx` mocks `@/lib/auth` + `next/headers`, renders `await Home()`.
- Docs: `progress-tracker.md` (Phase 1 complete, decisions), `build-plan.md` (02/03 status), `architecture.md` + `library-docs.md` (`proxy.ts` rename done, Prisma 7 + adapter snippets fixed).

## Decisions made

- DB-only 03 first, auth wiring second (developer-approved plan); Context for session state rejected — httpOnly cookie unreadable from JS, all auth transitions are redirects, so a server flag suffices.
- Auth tables singular (better-auth default, no `usePlural`); hand-written schema (developer choice) with `User` back-relations for app models.
- Prisma 7 specifics locked: provider-only `datasource db` block, `prisma-client-js` generator (keeps default `@prisma/client` output), `process.loadEnvFile()`.
- Local Postgres on 5432 was used for the first migrate (daemon was down); container volume started fresh afterwards and was confirmed migrated/in-sync.
- OAuth secrets live only in gitignored `.env` (user-supplied); never in docs or memory.

## Problems solved

- Prisma "Default connector" Decimal failure → schema needs explicit `datasource db { provider = "postgresql" }`; provider is not inferred from config URL.
- Generator `output` into `node_modules/@prisma/client` clobbered the package → restored via reinstall, switched to `prisma-client-js`.
- Quoted `DATABASE_URL` retained quotes via `loadEnvFile` → strip before adapter use in scripts only; Next/dotenv handle it at runtime.
- `app/page.test.tsx` suite failure (import chain hit real DB env) → mock auth + headers pattern.
- Ghost 4th "Get Started" link (Footer) broke the all-CTAs assertion → threaded flag through Footer too.

## Current state

- `npm test`: 45/45 passing (17 files). `typecheck`, `lint`, `npm run build` clean. Build shows `ƒ /` (dynamic, correct) + `ƒ /api/auth/[...all]`.
- Live-verified vs container DB: signup (user row + 7-day httpOnly cookie), get-session, sign-in, sign-out (requires `Origin` header — better-auth CSRF), Google/GitHub authorize URLs with correct callback URIs. Test user removed; 0 users remain.
- Phase 1 complete (01, 02 UI + wiring, 03). Everything implemented and verified but uncommitted.

## Next session starts with

- Build 04 Transactions Page — Full UI per `context/build-plan.md` (header + Add button, filter card, table, pagination, empty/no-results states, mock data, TDD). No DB reads yet — UI first per the core principle.

## Open questions

- Category seeding on first login deferred to 05 by plan — confirm it stays there when 04/05 begin.
