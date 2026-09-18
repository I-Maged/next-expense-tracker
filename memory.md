# Memory — 02 Auth UI slice (TDD, backend deferred)

Last updated: 2026-09-18

## What was built

- `lib/utils.ts`: dependency-free `cn()` (no new packages).
- `lib/auth-client.ts`: `createAuthClient()` browser client (better-auth 1.7.5 confirmed).
- `components/ui/` primitives (+ tests): `Button` (primary/secondary/danger), `Input` (`invalid` prop), `Label` — token classes only.
- `components/auth/` (+ tests): `SocialButtons` (Google/GitHub → `signIn.social` with `callbackURL: "/dashboard"`), `LoginForm` (`signIn.email` → `/dashboard`), `SignupForm` (`signUp.email` → `/dashboard`). Client-side validation + human-readable errors; raw provider errors never shown.
- `app/(auth)/login/page.tsx` (+ test) and `app/(auth)/signup/page.tsx` (+ test): Server Components, `.card` layout, cross-links.
- `proxy.ts`: cookie-presence guard (`better-auth.session_token`) for /dashboard, /transactions, /budgets, /settings; logged-in /login+/signup → /dashboard; explicit `matcher`.
- Docs: `context/ui-registry.md` (all new components + exact classes), `context/progress-tracker.md` (02 UI done, decision log), `context/build-plan.md` (02 status note: UI done, backend deferred).

## Decisions made

- 02 Auth split UI-first / wiring-later (developer decision): UI slice shippable and test-covered without DB; `lib/auth.ts`, `app/api/auth/[...all]/route.ts`, Prisma schema+migrate, seeding, homepage session-aware CTAs, live OAuth land with 03 Database + wiring step.
- Route guard lives in `proxy.ts`, NOT `middleware.ts` — Next 16 deprecated the middleware file convention (verified in `node_modules/next/dist/docs/.../proxy.md` per AGENTS.md rule).
- `cn()` hand-rolled instead of installing `clsx`/`tailwind-merge` — avoids touching the approved-dependency list for zero benefit at this scale.
- No `@testing-library/user-event` — used `fireEvent` (already installed) to avoid a new devDependency.
- TDD vertical slices throughout (one test → one component); Server Components by default, `"use client"` only on interactive forms/buttons.

## Problems solved

- `middleware.ts` deprecation: docs say the file convention was renamed to `proxy.ts` (`export function proxy`) in Next 16; build output confirms `ƒ Proxy (Middleware)` detected. `context/library-docs.md` + `context/architecture.md` still say `middleware.ts` — flagged in progress-tracker, update when auth docs are next touched.
- `max-w-144` valid in Tailwind v4 (dynamic spacing scale = 36rem); no custom token needed.

## Current state

- `npm test`: 30/30 passing (8 homepage + 22 new). `typecheck`, `lint`, `npm run build` clean, zero warnings; `/login` + `/signup` routes live.
- Phase 1: 01 Homepage done, 02 Auth UI done (backend deferred), 03 Database not started.
- All changes (code + context docs) implemented and verified but uncommitted.

## Next session starts with

- Build 03 Database + Docker per `context/build-plan.md`, then Auth wiring: `docker-compose.yml`, `.env` values, `bunx auth generate` schema, `prisma migrate dev`, `lib/prisma.ts`, `lib/auth.ts` (prismaAdapter + `nextCookies()` last), `app/api/auth/[...all]/route.ts`, live OAuth verification, homepage session-aware CTAs.

## Open questions

- Google/GitHub OAuth client IDs + secrets still not supplied — OAuth buttons are mock-verified only.
- Whether to commit the current working tree before starting 03.
- `library-docs.md` / `architecture.md` `middleware.ts` references need renaming to `proxy.ts` during the wiring step.
