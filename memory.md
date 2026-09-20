# Memory — 13 Auth Edge Cases + Seed Check

Last updated: 2026-09-20

## What was built

- New `proxy.test.ts` (15 tests): logged-out protected (`/dashboard`, `/transactions`, `/budgets`, `/settings`, nested `/settings/account`) → `/login`; logged-in `/login`+`/signup` → `/dashboard`; pass-through cases; `config.matcher` covers all 6 routes. Includes why-comment on minimal `NextRequest` stub.
- `app/(auth)/login/page.tsx` + `app/(auth)/signup/page.tsx`: sync → `async`, `auth.api.getSession({ headers: await headers() })` → `redirect("/dashboard")` when session exists (defense-in-depth over `proxy.ts`, which is unchanged).
- `app/(auth)/login/page.test.tsx` + `signup/page.test.tsx`: render-when-logged-out + redirect-when-logged-in (`REDIRECT:/dashboard` pattern from dashboard tests).
- `actions/categories.ts` `seedDefaultCategories()`: `createMany` + `skipDuplicates: true`; `P2002` unique-race → `{ success: true }` (uses existing `isUniqueViolation`).
- Tests (+8 seed/validation/action): `actions/categories.test.ts` (+2 race-as-success, duplicate-safe write), `lib/validations.test.ts` (+2 friendly messages: `Max 2 decimals`, future-date, `YYYY-MM`), `actions/transactions.test.ts` (+1 extra-decimals + future-date friendly reject), `actions/budgets.test.ts` (+1 extra-decimal limit friendly reject).
- Tests total +23, 195→218 (47→48 files). No source change needed for invalid inputs — zod + generic friendly action errors already correct.
- Docs: `context/progress-tracker.md` (13 checked, +23/218 line, +1 decision line).
- Nit fix: `proxy.test.ts` assertion why-comment added; re-verified 15/15 + lint clean.

## Decisions made

- Keep lazy `seedDefaultCategories()` on protected page load — no `databaseHooks` move (covers email + OAuth uniformly, zero migration risk).
- Add server `getSession` guard on auth pages on top of `proxy.ts` (developer choice: defense-in-depth).
- Verify + friendly-text only for invalid inputs — no new schemas (zod already rejects negative, >2 decimals, future date, bad month; actions keep generic friendly errors, no raw leak).
- Skills used: architect (blueprint, 3 answers: keep lazy seed, add server guard, verify+friendly), tdd (vertical RED→GREEN slices), review (1 minor nit → fixed), remember (save).

## Problems solved

- Auth page RED failed with `TypeError: expect() .rejects got object` — pages were still sync JSX; fixed by making both pages `async` server components.
- Seed race RED (2 fail: `P2002` returned failure, missing `skipDuplicates`) — fixed with `skipDuplicates: true` + `P2002` → success.
- `proxy.test.ts` nested-path mock used a query string in `pathname` — switched to `/settings/account` for a realistic nested prefix check.

## Current state

- `npm test`: 218/218 passing (48 files). `typecheck`, `lint`, `npm run build` clean. Routes `ƒ / /login /signup /dashboard /transactions /budgets /settings /api/auth/[...all]` (dynamic, correct).
- Phase 5 complete — all 13 features done. 13 changes implemented and verified but uncommitted (3 source + 7 test files with 1 new + 1 doc).
- Review: 1 minor nit only (assertion why-comment) — fixed and re-verified this session.

## Next session starts with

- Phase 5 is complete (13/13). Decide ship step: commit the uncommitted work and run one final `npm test` + `npm run build` on a clean tree.

## Open questions

- None. Commit/ship strategy is the only pending developer call.
