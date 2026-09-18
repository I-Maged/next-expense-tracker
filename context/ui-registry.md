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

- Header: `w-full border-b border-border bg-surface`
- Inner: `mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6`
- Logo mark: 36px (`h-9 w-9`) `rounded-[10px]`, inline gradient `linear-gradient(45deg, #7C5CFC 0%, #4A2EC5 100%)`, white bold letter
- Logo text: `text-[19px] font-bold leading-7 text-text-darkest`
- Nav: `hidden items-center gap-6 md:flex`, links `text-sm font-medium leading-5 text-text-dark hover:text-accent`
- CTA: `rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark`, href `/signup`

### Hero — `components/homepage/Hero.tsx`

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

- Band `w-full bg-surface`, centered; H2 `text-3xl font-bold text-text-primary`; CTA same primary style → `/signup`

### Footer — `components/layout/Footer.tsx`

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
