# Architecture

## Stack

| Layer      | Tool                        | Purpose                          |
| ---------- | --------------------------- | -------------------------------- |
| Framework  | Next.js 16 (App Router)     | Full stack framework             |
| Language   | TypeScript strict           | Throughout                       |
| ORM        | Prisma                      | DB access + migrations           |
| Database   | Postgres (local Docker)     | All app data                     |
| Auth       | Better-Auth                 | Email/password + OAuth, sessions |
| Charts     | recharts                    | Dashboard reports                |
| Styling    | Tailwind CSS v4 + shadcn/ui | UI components and styling        |
| Validation | zod                         | Form + Server Action validation  |

No InsForge. No Adzuna. No PostHog. No AI/browser/PDF vendors.

---

## Folder Structure

```
/
├── AGENTS.md
├── docker-compose.yml                  → Local Postgres
├── prisma.config.ts                    → Datasource URL (env DATABASE_URL)
├── prisma/
│   └── schema.prisma                   → All models (auth + app)
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                      → Root layout, Google Sans Flex font
│   ├── page.tsx                        → Homepage
│   ├── (auth)/
│   │   ├── login/page.tsx              → Sign in page
│   │   └── signup/page.tsx             → Sign up page
│   ├── dashboard/page.tsx              → Stats + charts + recent list
│   ├── transactions/page.tsx           → Filters + table + pagination
│   ├── budgets/page.tsx                → Budget cards + set/edit
│   ├── settings/page.tsx               → Category management
│   └── api/
│       └── auth/[...all]/route.ts      → Better-Auth handler only
├── actions/
│   ├── transactions.ts                 → Transaction CRUD
│   ├── budgets.ts                      → Budget upsert/delete/copy
│   └── categories.ts                   → Category CRUD + seeding
├── components/
│   ├── ui/                             → shadcn/ui components only
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── homepage/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   └── Features.tsx
│   ├── dashboard/
│   │   ├── StatsBar.tsx
│   │   ├── CategoryChart.tsx
│   │   ├── TrendChart.tsx
│   │   └── RecentTransactions.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionFilters.tsx
│   │   ├── TransactionsTable.tsx
│   │   └── TransactionsPagination.tsx
│   ├── budgets/
│   │   ├── BudgetCard.tsx
│   │   └── BudgetForm.tsx
│   └── settings/
│       └── CategoryManager.tsx
├── lib/
│   ├── auth.ts                         → Better-Auth instance
│   ├── auth-client.ts                  → Better-Auth browser client
│   ├── prisma.ts                       → Prisma singleton
│   ├── validations.ts                  → zod schemas
│   └── utils.ts                        → cn(), currency, constants
└── proxy.ts                            → Cookie-presence route guard
```

---

## System Boundaries

| Folder        | Owns                                                              |
| ------------- | ----------------------------------------------------------------- |
| `app/`        | Pages + single auth route only. No business logic.                |
| `actions/`    | Server Actions for all mutations only. Auth check + zod + Prisma. |
| `components/` | UI only. No direct Prisma calls. No `auth.api` calls.             |
| `lib/`        | Auth instance, Prisma singleton, validation, utils only.          |
| `prisma/`     | Single source of truth for DB schema.                             |

---

## Data Flow

### UI Mutations (Server Actions)

```
User interaction in component
        ↓
Server Action in actions/
        ↓
auth.api.getSession() → require user, else return { success: false }
        ↓
zod validation (lib/validations.ts)
        ↓
Prisma write scoped by session.user.id
        ↓
revalidatePath() affected page
```

### Reads (Server Components)

```
Server Component page
        ↓
auth.api.getSession({ headers: await headers() })
        ↓
if (!session) redirect("/login")
        ↓
Prisma read scoped by session.user.id
        ↓
Pass plain data as props to Client Components (charts, tables)
```

### Auth Flow (Better-Auth)

```
Signup: authClient.signUp.email() or signIn.social({ provider })
        ↓
POST /api/auth/[...all] → Better-Auth creates User + Session + cookie
        ↓
httpOnly session cookie set (7-day expiry)
        ↓
Seed default categories for new userId (once)
        ↓
Redirect to /dashboard
```

---

## Postgres (Docker)

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes: [pgdata:/var/lib/postgresql/data]
```

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_tracker"
```

- Migrations via `prisma migrate dev` — never hand-edit the DB.
- Prisma Client output: default (`@prisma/client`).

---

## Prisma Schema

### Auth models (hand-written into the schema from the better-auth expected schema — fields verified against the installed version; singular tables)

`user`, `session`, `account`, `verification` — owned by Better-Auth.
App code reads `session.user.id` only, never writes these tables directly.
Wiring uses plain `prismaAdapter(prisma, { provider: "postgresql" })` (no `usePlural`).

### `categories`

| Column    | Type     | Notes                        |
| --------- | -------- | ---------------------------- |
| id        | String   | cuid                         |
| userId    | String   | References users.id, indexed |
| name      | String   | Unique per user              |
| color     | String   | Hex dot, e.g. #7C5CFC        |
| createdAt | DateTime |                              |

`@@unique([userId, name])`

Default seed (per user on signup): Food, Transport, Rent, Utilities, Shopping, Health, Entertainment, Other.

### `transactions`

| Column     | Type            | Notes                           |
| ---------- | --------------- | ------------------------------- |
| id         | String          | cuid                            |
| userId     | String          | References users.id, indexed    |
| categoryId | String          | References categories.id        |
| type       | TransactionType | `INCOME` \| `EXPENSE`           |
| amount     | Decimal(12,2)   | Always positive, 2dp            |
| date       | DateTime        | Transaction date, not createdAt |
| note       | String?         | Optional, searchable            |
| createdAt  | DateTime        |                                 |
| updatedAt  | DateTime        |                                 |

Indexes: `(userId, date)`, `(userId, categoryId)`.

### `budgets`

| Column     | Type          | Notes                        |
| ---------- | ------------- | ---------------------------- |
| id         | String        | cuid                         |
| userId     | String        | References users.id, indexed |
| categoryId | String        | References categories.id     |
| month      | String        | `YYYY-MM`, e.g. 2026-09      |
| limit      | Decimal(12,2) | Monthly cap, positive        |
| createdAt  | DateTime      |                              |
| updatedAt  | DateTime      |                              |

`@@unique([userId, categoryId, month])`

`spent` is never stored — aggregated live: `SUM(transactions.amount WHERE type=EXPENSE AND categoryId AND date in month)`.

---

## Authentication

- Provider: Better-Auth
- Methods: email/password, Google OAuth, GitHub OAuth
- Sessions: DB-persisted, httpOnly cookie, 7-day expiry, 1-day rolling update
- Protected routes: /dashboard, /transactions, /budgets, /settings
- Public routes: /, /login, /signup
- `proxy.ts` checks session-cookie presence only (no DB call) for redirect
- Full session check happens in Server Components / Server Actions via `auth.api.getSession()`
- `plugins: [nextCookies()]` last in `lib/auth.ts` — required for Server Actions to set cookies
- On login/signup → redirect to /dashboard
- On logout → sign out + redirect to /

---

## Prisma Client Pattern

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

- Import `prisma` from `@/lib/prisma` in Server Components and Server Actions only.
- Never import Prisma in Client Components.
- Never create `new PrismaClient()` anywhere else.

---

## Better-Auth Pattern

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
  plugins: [nextCookies()],
});
```

```typescript
// Server check — every Action + protected page
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/login");
// use session.user.id for every Prisma query
```

---

## Invariants

Rules the AI agent must never violate:

- API routes contain only the Better-Auth catch-all. All app mutations are Server Actions.
- Components contain no Prisma logic. Agent-style background code does not exist.
- Every Server Action checks session first, validates with zod, scopes every Prisma query by `session.user.id`.
- No hardcoded hex values or raw Tailwind color classes in components — use CSS variables from ui-tokens.md.
- `amount` and `limit` are always positive Decimals — sign comes from `type` only.
- `month` is always `YYYY-MM` — never any other format.
- `type` is always `INCOME` or `EXPENSE` — never any other value.
- Budget `spent` is always computed live — never stored.
- Category delete is blocked when transactions or budgets reference it.
- Middleware never hits the DB — cookie-presence check only.
- Never use Prisma browser-side. Never `new PrismaClient()` outside `lib/prisma.ts`.
