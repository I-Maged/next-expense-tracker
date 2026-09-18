# Memory — 01 Homepage (TDD) + font warning + vitest config fixes

Last updated: 2026-09-18

## What was built

- `components/layout/Navbar.tsx` (+ test): logo, Dashboard/Transactions/Budgets/Settings links, Get Started → `/signup`.
- `components/homepage/Hero.tsx` (+ test): headline, subheadline, Get Started → `/signup` / Sign In → `/login`, static dashboard preview card (`data-testid="app-preview"`).
- `components/homepage/Features.tsx` (+ test): Fast entry, Budgets, Reports (lucide icons).
- `components/homepage/HowItWorks.tsx` (+ test): sign up / log spending / stay on budget.
- `components/homepage/BottomCta.tsx` (+ test) and `components/layout/Footer.tsx` (+ test).
- `app/page.tsx` (+ `app/page.test.tsx`): assembles all sections; full-page test asserts every section + CTA routing.
- Test infra: `vitest.config.mts`, `vitest.setup.ts`, `@testing-library/react` + `jest-dom` + `jsdom` devDeps, `npm test` script in `package.json`.
- `app/layout.tsx`: added manual `fallback: ["ui-sans-serif", "system-ui", "sans-serif"]` + `adjustFontFallback: false` to `Google_Sans_Flex()`.
- Docs: `context/ui-registry.md` filled with exact classes per component; `context/progress-tracker.md` marks 01 Homepage done; `context/code-standards.md` approved list gains test devDeps.

## Decisions made

- TDD vertical slices (one test → one component, never batched); Server Components, one component per file, named exports except `app/page.tsx` (Next requires default export there).
- Token utilities only (`bg-surface`, `text-text-primary`, `bg-accent`, …), `.card` reuse, mobile-first breakpoints. No raw Tailwind colors.
- Homepage CTAs stay static links (`/signup`, `/login`) until 02 Auth wires session-aware redirects.
- Font fix: manual `fallback` list bypasses Next's metrics lookup; `adjustFontFallback: false` suppresses size-adjust CSS. Rendering identical to before, warning gone.
- `vitest.config.ts` → `vitest.config.mts` rename (zero content change) instead of `"type": "module"` or env-var suppression.

## Problems solved

- "Failed to find font override values for font `Google Sans Flex`": root cause is Turbopack's native font code doing the metrics-table lookup regardless of `adjustFontFallback` (Google Sans family absent from `capsize-font-metrics.json`). `adjustFontFallback: false` alone did NOT silence it; manual `fallback` list did. Verified: warning-free build, `@font-face` + `.woff2` still emitted, variable resolves to `"Google Sans Flex", ui-sans-serif, system-ui, sans-serif`.
- Vitest `configLoader: 'native'` ESM warning: fixed via `.mts` rename.
- Vitest `@/` alias failed with `__dirname` in ESM-loaded config: use `path.resolve(process.cwd(), ".")`.

## Current state

- `npm test`: 8/8 passing. `typecheck`, `lint`, `npm run build` all clean, zero warnings.
- Phase 1: 01 Homepage done. 02 Auth not started.
- Working-tree changes (homepage, config, docs) are implemented and verified but uncommitted.

## Next session starts with

- Build 02 Auth per `context/build-plan.md`: login/signup pages, `lib/auth.ts` (betterAuth + prismaAdapter + Google/GitHub + `nextCookies()` last), `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`, `middleware.ts` cookie guard, post-login redirect to `/dashboard`.

## Open questions

- shadcn/ui + `lib/utils.ts` (`cn()`) setup still unchecked — verify before building components that need them (02 Auth forms will).
- Manual theme toggle UI deferred to Phase 5 polish.
- Whether to commit the current working tree before starting 02 Auth.
