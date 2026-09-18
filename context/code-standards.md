# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — validate inputs, handle errors, never let one bad row crash a page

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary
- Money: Prisma `Decimal` in DB. Convert to `number` at the Server Component boundary (`.toNumber()`) before passing to Client Components. Never pass `Decimal` to Client Components.

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- React 19 — use React 19 APIs throughout
- All components are Server Components by default
- Only add `"use client"` when the component requires:
  - useState or useReducer
  - useEffect
  - Browser APIs
  - Event listeners
  - Third party client-only libraries (Better-Auth client, recharts)
- Never add `"use client"` to layout files unless absolutely required
- Data fetching happens in Server Components via Prisma — never fetch in Client Components directly, never call Prisma client-side
- Route handlers: only `app/api/auth/[...all]/route.ts` (Better-Auth). No other API routes — use Server Actions
- Server Actions live in `actions/` — never define Server Actions inline in components
- Caching is uncached by default — all dynamic code runs at request time
- Always read Next.js documentation before implementing any Next.js specific feature — APIs may differ from training data

---

## File and Folder Naming

- Folders: kebab-case — `transactions`, `budget-cards`
- Component files: PascalCase — `StatsBar.tsx`, `TransactionsTable.tsx`
- Utility files: camelCase — `prisma.ts`, `auth.ts`, `validations.ts`
- Type files: camelCase — `index.ts`
- Server Action files: camelCase — `transactions.ts`, `budgets.ts`, `categories.ts`
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { formatCurrency } from "@/lib/utils";

// 3. Type definitions
type Props = {
  transactionId: string;
  amount: number;
};

// 4. Component
export function ComponentName({ transactionId, amount }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared
- No inline styles except category dot color — all styling via Tailwind classes using CSS variables from ui-tokens.md

---

## Server Actions

```typescript
// actions/transactions.ts

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransactionSchema } from "@/lib/validations";

export async function createTransaction(input: unknown) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false as const, error: "Not authenticated" };
    const parsed = createTransactionSchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: "Invalid transaction data" };
    // verify category belongs to user, then prisma write scoped by session.user.id
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true as const };
  } catch (error) {
    console.error("[actions/transactions]", error);
    return { success: false as const, error: "Failed to save transaction" };
  }
}
```

- Every Server Action checks session first via `auth.api.getSession()`.
- Every Server Action validates with zod from `lib/validations.ts`.
- Every Prisma query is scoped by `session.user.id`.
- Every Server Action has a try/catch, returns `{ success: boolean, error?: string }`.
- Always call `revalidatePath` after mutations that affect page data.
- Never throw from Server Actions — always return the error.

---

## Prisma Usage

```typescript
// Server only
import { prisma } from "@/lib/prisma";

const transactions = await prisma.transaction.findMany({
  where: { userId: session.user.id, date: { gte: monthStart, lt: monthEnd } },
  include: { category: true },
  orderBy: { date: "desc" },
});
```

- Never import Prisma in Client Components.
- Never `new PrismaClient()` outside `lib/prisma.ts`.
- Always scope every query by `userId` — never query without a user filter.
- Verify `categoryId` ownership before writing transactions or budgets.
- Block category delete when transactions or budgets reference it — return human-readable error.

---

## Better-Auth Usage

```typescript
// Server check
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
const session = await auth.api.getSession({ headers: await headers() });

// Client
import { authClient } from "@/lib/auth-client";
await authClient.signIn.email({ email, password });
await authClient.signUp.email({ email, password, name });
await authClient.signIn.social({ provider: "google" });
await authClient.signOut();
```

- `nextCookies()` is last plugin in `lib/auth.ts` — never remove or reorder.
- Middleware checks cookie presence only — never calls DB.
- Never read session tokens manually — always go through `auth.api.getSession()`.

---

## Error Handling

- Never use empty catch blocks — always log or handle
- Console errors always include context prefix: `[component/function name]`
- User-facing errors must be human readable — never expose raw error messages or Prisma errors
- Unique-constraint failures (duplicate category, duplicate budget) return friendly text

---

## Environment Variables

All environment variables defined in `.env` for development. Never hardcode any key, URL, or secret anywhere in the codebase.

| Variable               | Used In              |
| ---------------------- | -------------------- |
| `DATABASE_URL`         | prisma, lib/auth.ts  |
| `BETTER_AUTH_SECRET`   | lib/auth.ts          |
| `BETTER_AUTH_URL`      | lib/auth.ts          |
| `GOOGLE_CLIENT_ID`     | lib/auth.ts          |
| `GOOGLE_CLIENT_SECRET` | lib/auth.ts          |
| `GITHUB_CLIENT_ID`     | lib/auth.ts          |
| `GITHUB_CLIENT_SECRET` | lib/auth.ts          |

`NEXT_PUBLIC_` is not needed. Never expose secrets to the browser.

---

## Money & Date Constants

Defined once. Never hardcode elsewhere.

```typescript
// lib/utils.ts
export const CURRENCY = "USD";
export const TRANSACTIONS_PER_PAGE = 20;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY }).format(value);
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
```

```typescript
// lib/validations.ts or lib/utils.ts
export const DEFAULT_CATEGORIES = [
  "Food", "Transport", "Rent", "Utilities",
  "Shopping", "Health", "Entertainment", "Other",
] as const;
```

- `month` strings are always `YYYY-MM` via `monthKey()`.
- Amounts always positive — sign from `type` only.

---

## Import Aliases

Always use the `@/` alias — never use relative imports that go up more than one level.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

// Never
import { Button } from "../../../components/ui/button";
```

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious decision
- Never leave TODO comments in committed code

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn/ui already have this component?
2. Does Next.js already provide this functionality?
3. Is there a simpler native solution?

Approved dependencies for this project:

- `better-auth` — Auth, sessions, OAuth
- `@prisma/client` + `prisma` — ORM + migrations
- `recharts` — Dashboard charts
- `zod` — Schema validation
- `lucide-react` — Icons
- `tailwindcss` — Styling
- `shadcn/ui` components — UI primitives

Do not install any other packages without updating this list first.
