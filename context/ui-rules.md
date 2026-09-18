# UI Rules

Concise rules for building ExpenseTracker UI. Same visual system as reference. These rules cover the most important patterns and constraints to keep the UI consistent without over-specifying every detail.

---

## Font

Always import Inter via `next/font/google` in the root layout.

```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
```

The `--font-sans` variable is already declared in `@theme` in globals.css. Apply the font variable class to the `<html>` tag in root layout. Never use system fonts as the primary font.

---

## Layout

- Page max-width: 1440px, centered
- Main content area padding: 32px on all sides
- Gap between page sections: 24px
- Header height: 64px, full width, white background, padding 0 24px
- All pages use top navbar only — no sidebar, no drawer
- Mobile: stack stat cards 1-col, charts stack vertically, table scrolls horizontally

---

## Navbar

Four nav items: Dashboard, Transactions, Budgets, Settings.

- Active item: `color: #7C5CFC`, font-weight 500, 14px
- Inactive item: `color: #4A5565`, font-weight 500, 14px
- No underline — active state is color change only
- Navbar always white background, full viewport width
- Right side: user email/name + Sign out button

---

## Cards

Every content section lives in a card.

```
background: #FFFFFF
border: 1px solid #E7EAF3
border-radius: 16px
padding: 24px
box-shadow: 0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)
```

Never use colored card backgrounds — always white. Color goes inside cards via badges, bars, and text, never on the card surface itself.

---

## Typography Hierarchy

Three levels used consistently throughout:

**Section headings** — card titles, page section titles

```
font-size: 16px
font-weight: 600
color: #101828
line-height: 24px
```

**Body / primary content text**

```
font-size: 14px
font-weight: 500
color: #101828
line-height: 20px
```

**Secondary / muted text** — labels, timestamps, subtitles

```
font-size: 12px
font-weight: 400
color: #99A1AF
line-height: 16px
```

Stat numbers on dashboard use 30px / weight 600 / color #101828.
Amounts in tables use 14px / weight 500, right-aligned, tabular-nums.

---

## Amounts

- Single currency (USD default). Format with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })` via `formatCurrency()` in `lib/utils.ts`.
- Always show sign: `+$1,200.00` income, `-$45.50` expense.
- Income amounts: `text-success`. Expense amounts: `text-text-primary`. Over-budget figures: `text-error`.
- Never store formatted strings — format at render time from Decimal/number.

---

## Badges

All badges use `border-radius: 9999px` (pill shape) unless specified otherwise.

```
padding: 2px 8px
font-size: 12px
font-weight: 500
```

Category badge: 8px color dot + name. Dot color is inline style from DB. Badge chrome stays `bg-surface-secondary` / `text-text-secondary`.
Type badge: Income → `bg-success-lightest` + `text-success-foreground`. Expense → `bg-surface-secondary` + `text-text-secondary`.
Trend badges on stat cards use `border-radius: 4px` (not pill) with `#ECFDF5` background and `#009966` text.

---

## Buttons

**Primary button:**

```
background: #7C5CFC
color: #FFFFFF
border-radius: 8px
padding: 8px 16px
font-size: 14px
font-weight: 500
```

**Secondary button:**

```
background: #FFFFFF
border: 1px solid #E7EAF3
color: #101828
border-radius: 8px
padding: 8px 16px
```

**Danger (delete):** secondary chrome with `color: #EF4444`.

---

## Form Inputs

```
background: #FFFFFF
border: 1px solid #E7EAF3
border-radius: 8px
padding: 8px 12px
font-size: 14px
color: #101828
placeholder color: #99A1AF
focus: ring-1 ring-accent border-accent
```

- Amount input: `inputMode="decimal"`, validated by zod as positive number with max 2 decimals.
- Date input: native date picker, defaults to today, never future-dated beyond today.
- Type toggle: two segmented buttons (Expense / Income), Expense default.

---

## Table (Transactions List)

- No alternating row colors — white rows only, separated by border
- Row border: `1px solid #E7EAF3` between rows
- Column headers: uppercase, 12px, font-weight 500, color `#6A7282`
- Row text: 14px, color `#101828`
- Hover state: `background: #F9FAFB`
- Columns: DATE | NOTE | CATEGORY | TYPE | AMOUNT (right) | ACTIONS
- Amount column always right-aligned with `tabular-nums`
- Mobile: horizontal scroll, never wrap amounts

---

## Budget Progress Bar

Thick progress bar on budget cards.

```
height: 8px
border-radius: 9999px
background track: #E7EAF3
```

Fill color by usage:

- Under 80%: `#10B981` (green)
- 80-100%: `#FF8904` (orange)
- Over 100%: `#EF4444` (red)

Always show `spent / limit` + remaining text below the bar. Over-budget shows `+$X over` in red.

---

## Charts (recharts)

- All charts live inside white cards with section heading + muted subtitle (month/range).
- Never fetch in chart components — Server Component page queries Prisma, passes plain arrays as props.
- Colors: category bars `#7C5CFC`, income line `#10B981`, expense line `#7C5CFC`.
- Grid: dashed `#E7EAF3`. Axis labels 12px `#9CA3AF`.
- Every chart has an empty state ("No data this month — add a transaction").

---

## Empty States

Every section that can be empty must have an empty state. Keep it minimal:

- Short descriptive text in `color: #99A1AF`
- Optional icon above text
- CTA button if there's a logical next action (e.g. "Add your first transaction", "Set a budget")

Required empty states: recent transactions, transactions table (incl. no-filter-results), each chart, budgets list, categories list.

---

## Modals / Dialogs

- Use shadcn/ui Dialog only.
- Transaction form and budget form both render in dialogs (not separate pages).
- Dialog card follows standard card tokens. Focus amount input on open for transaction form.

---

## Tailwind v4 Note

This project uses Tailwind v4. Tokens are defined with `@theme` in globals.css — no `tailwind.config.ts` needed. Never define colors in a config file. Always use `@theme` for new tokens.

---

## Do Nots

- Never use Tailwind's built-in color classes (`bg-purple-500`, `text-gray-600`) — use project tokens only
- Never define colors in `tailwind.config.ts` — use `@theme` in globals.css
- Never add gradients to card backgrounds
- Never use more than one font weight in a single UI element
- Never show raw error messages to users — always show human readable text
- Never stack more than 2 levels of border radius inside each other
- Never use `position: fixed` for UI elements — use normal flow layout
- Never format currency inline — always use `formatCurrency()` from `lib/utils.ts`
- Never store computed budget `spent` — always aggregate live from transactions
