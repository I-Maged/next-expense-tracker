# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to ExpenseTracker.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## Prisma + Postgres (Docker)

**Check first:** Check AGENTS.md for an installed Prisma skill. If a Prisma MCP server is configured — use it.

### Singleton (Prisma 7 — driver adapter required)

```typescript
// lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Local DB

```bash
docker compose up -d
npx prisma migrate dev --name init
npx prisma studio
```

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_tracker"
```

Prisma 7 notes: datasource URL lives in `prisma.config.ts` (loaded via `process.loadEnvFile()` — Prisma does not auto-load `.env`); the schema keeps a provider-only `datasource db { provider = "postgresql" }` block (without it Decimal fails as "Default connector"); generator is `prisma-client-js` so output stays the default `@prisma/client`.

### Query patterns

```typescript
// Read scoped to user
await prisma.transaction.findMany({
  where: { userId: session.user.id, date: { gte: start, lt: end } },
  include: { category: true },
  orderBy: { date: "desc" },
  take: 20,
  skip: (page - 1) * 20,
});

// Budget spent — always aggregate live
const spent = await prisma.transaction.aggregate({
  _sum: { amount: true },
  where: { userId, categoryId, type: "EXPENSE", date: { gte: start, lt: end } },
});
```

**Rules:**

- Migrations only via `prisma migrate dev` — never hand-edit the DB.
- Always scope by `userId` — never query without a user filter.
- Convert `Decimal` to `number` (`.toNumber()`) before passing to Client Components.
- Verify `categoryId` belongs to user before any transaction/budget write.
- Block category delete when referenced — check `transaction.count` + `budget.count` first.

---

## Better-Auth

**Check first:** Check AGENTS.md for an installed Better-Auth skill. The skill will have the latest API patterns.

### Server instance

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  plugins: [nextCookies()], // must be last
});
```

### Auth route (only API route in the project)

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();
```

```typescript
await authClient.signUp.email({ email, password, name: email });
await authClient.signIn.email({ email, password });
await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });
await authClient.signOut();
```

### Server session check

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/login");
```

### Proxy guard (cookie presence only — Next 16 renamed `middleware.ts` to `proxy.ts`)

```typescript
// proxy.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/transactions", "/budgets", "/settings"];

export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("better-auth.session_token");
  const isProtected = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !hasSession) return NextResponse.redirect(new URL("/login", req.url));
  if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}
```

### Auth schema

```bash
npx auth@latest generate
```

Generates `User`, `Session`, `Account`, `Verification` models (singular tables `user`, `session`, `account`, `verification` by default). 03 hand-wrote them from the installed better-auth expected schema instead (developer decision) — re-run the CLI after Better-Auth upgrades and merge carefully (app models reference `User`).

**Rules:**

- `nextCookies()` stays last in plugins — required for Server Actions.
- Never query the DB in middleware — cookie check only.
- Seed default categories after signup (guarded — only when user has zero categories).
- Never expose `BETTER_AUTH_SECRET` or OAuth secrets to the client.

---

## zod

### Validation schemas

```typescript
// lib/validations.ts
import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive().max(999999999.99).refine(
    (n) => Math.round(n * 100) === n * 100,
    { message: "Max 2 decimals" },
  ),
  categoryId: z.string().min(1),
  date: z.coerce.date().max(new Date(), { message: "Date cannot be in the future" }),
  note: z.string().max(200).optional(),
});

export const upsertBudgetSchema = z.object({
  categoryId: z.string().min(1),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"),
  limit: z.number().positive().max(999999999.99),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use #RRGGBB"),
});
```

**Rules:**

- Every Server Action parses with `.safeParse()` — never trust raw input.
- Amounts validated as positive numbers — type field carries the sign.
- `month` always `YYYY-MM` — rejected otherwise.

---

## recharts

**Check first:** Check AGENTS.md for a chart skill. Recharts APIs differ from training data — verify against installed version.

### Data flow

Server Component queries Prisma → maps `Decimal` to `number` → passes plain array to Client chart component. Charts never query.

```typescript
// app/dashboard/page.tsx (Server)
const rows = await prisma.transaction.groupBy({ ... });
<CategoryChart data={rows.map((r) => ({ name: r.category.name, total: r._sum.amount?.toNumber() ?? 0 }))} />

// components/dashboard/CategoryChart.tsx (Client)
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
```

**Rules:**

- `"use client"` on every chart component — recharts is client-only.
- Wrap every chart in `ResponsiveContainer` — never fixed pixel widths.
- Grid stroke `#E7EAF3` dashed. Axis tick `{ fontSize: 12, fill: "#9CA3AF" }`.
- Income `#10B981`, expense/category `#7C5CFC`.
- Empty data → render empty-state text, not an empty chart.

---

## shadcn/ui

- `components/ui/` only — never edit generated primitives except tokens.
- Dialog for TransactionForm + BudgetForm. Select for category/type/month. Button/Input/Label per ui-tokens.
- Icons via `lucide-react` only — never emoji.
