# UI Tokens

Design tokens for ExpenseTracker. Same visual system as reference — purple accent, white cards, Inter. Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `app/globals.css`. No `tailwind.config.ts` needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-accent` → `bg-accent`, `text-accent`, `border-accent`
- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Also correct — references CSS variable directly
style={{ color: 'var(--color-text-primary)' }}

// Never — hardcoded hex values
className="bg-[#F6F7FB] text-[#101828]"

// Never — raw Tailwind color classes
className="bg-purple-500 text-gray-600"
```

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* Page and surface backgrounds */
  --color-background: #f6f7fb;
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f2f5f7;
  --color-surface-muted: #f4f5fb;

  /* Borders */
  --color-border: #e7eaf3;
  --color-border-light: #e5e7eb;
  --color-border-muted: #dfe1e7;

  /* Text */
  --color-text-primary: #101828;
  --color-text-secondary: #6a7282;
  --color-text-muted: #99a1af;
  --color-text-dark: #364153;
  --color-text-darker: #36394a;
  --color-text-darkest: #111827;
  --color-text-black: #131316;
  --color-text-slate: #272835;
  --color-text-slate-medium: #666d80;

  /* Primary accent — purple */
  --color-accent: #7c5cfc;
  --color-accent-dark: #5e4cff;
  --color-accent-light: #f3e8ff;
  --color-accent-muted: #faf5ff;
  --color-accent-foreground: #ffffff;

  /* Success — green (income, under budget) */
  --color-success: #10b981;
  --color-success-alt: #00bc7d;
  --color-success-dark: #007a55;
  --color-success-darker: #009966;
  --color-success-light: #d0fae5;
  --color-success-lightest: #ecfdf5;
  --color-success-foreground: #007a55;

  /* Info — blue */
  --color-info: #61a8ff;
  --color-info-dark: #155dfc;
  --color-info-medium: #2b7fff;
  --color-info-light: #dbeafe;
  --color-info-lightest: #eff6ff;
  --color-info-foreground: #155dfc;
  --color-info-muted: #94a2c5;

  /* Warning — orange (near budget) */
  --color-warning: #ff8904;
  --color-warning-foreground: #ffffff;

  /* Error — red (expense, over budget) */
  --color-error: #ef4444;
  --color-error-foreground: #ffffff;

  /* Dark overlays */
  --color-overlay: #111827;
  --color-overlay-dark: #131316;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

Tailwind v4 generates utility classes automatically from every `--color-*` token above:

- `bg-accent`, `text-accent`, `border-accent`
- `bg-surface`, `text-surface-secondary`
- `bg-success-light`, `text-text-muted`
- etc.

---

## Color Usage Guide

### Page Layout

| Element           | Token                  |
| ----------------- | ---------------------- |
| Page background   | `bg-background`        |
| Card / surface    | `bg-surface`           |
| Secondary surface | `bg-surface-secondary` |
| Default border    | `border-border`        |
| Light border      | `border-border-light`  |

### Typography

| Element                | Token                           |
| ---------------------- | ------------------------------- |
| Headings, primary text | `text-text-primary` (#101828)   |
| Secondary text, labels | `text-text-secondary` (#6A7282) |
| Placeholder, muted     | `text-text-muted` (#99A1AF)     |
| Dark labels            | `text-text-dark` (#364153)      |

### Accent (Primary Purple)

Used for: primary buttons, active nav items, focus rings, chart highlights

| Element                | Token                    |
| ---------------------- | ------------------------ |
| Button background      | `bg-accent`              |
| Button text            | `text-accent-foreground` |
| Light badge background | `bg-accent-light`        |
| Subtle background      | `bg-accent-muted`        |

### Amount Colors

| Type    | Token             | Usage                          |
| ------- | ----------------- | ------------------------------ |
| Income  | `text-success`    | +$ amounts, income stat        |
| Expense | `text-text-primary` | -$ amounts (default body text) |
| Over-budget | `text-error`  | Over-limit figures, alerts     |

Amounts are right-aligned in tables. Always include sign prefix (`+`/`-`) plus formatted currency.

### Category Badges

| Element      | Style                                              |
| ------------ | -------------------------------------------------- |
| Dot          | 8px circle, inline category `color` hex            |
| Badge pill   | `bg-surface-secondary` + `text-text-secondary`     |

Category dot uses the stored category color. Badge chrome stays neutral.

### Budget Progress

| State         | Bar fill        | Text                  |
| ------------- | --------------- | --------------------- |
| Under 80%     | `bg-success`    | `text-text-secondary` |
| 80–100%       | `bg-warning`    | `text-warning`        |
| Over 100%     | `bg-error`      | `text-error`          |

Track is always `bg-border-light`, height 8px for budgets (4px for table mini-bars).

### Status Badges

| Status      | Background            | Text                      |
| ----------- | --------------------- | ------------------------- |
| Income      | `bg-success-lightest` | `text-success-foreground` |
| Expense     | `bg-surface-secondary`| `text-text-secondary`     |
| Over budget | `bg-error` (soft via opacity) | `text-error`      |

---

## Typography

| Element              | Size | Weight | Line height | Color token           |
| -------------------- | ---- | ------ | ----------- | --------------------- |
| Logo text            | 19px | 700    | 28px        | `text-text-darkest`   |
| Stat number          | 30px | 600    | 36px        | `text-text-primary`   |
| Section heading      | 16px | 600    | 24px        | `text-text-primary`   |
| Nav item (active)    | 14px | 500    | 20px        | `text-accent`         |
| Nav item (inactive)  | 14px | 500    | 20px        | `text-text-dark`      |
| Card label           | 14px | 500    | 20px        | `text-text-secondary` |
| Body / activity text | 14px | 500    | 20px        | `text-text-primary`   |
| Trend badge text     | 12px | 500    | 16px        | `text-success-darker` |
| Timestamp / muted    | 12px | 400    | 16px        | `text-text-muted`     |
| Chart axis labels    | 12px | 400    | 15px        | `#9CA3AF`             |
| Stat subtitle        | 12px | 400    | 16px        | `text-text-muted`     |

Font family: **Inter** — import from Google Fonts or use next/font/google.

---

## Spacing

| Token       | Value      | Usage                 |
| ----------- | ---------- | --------------------- |
| `gap-1`     | 4px        | Tight inline gaps     |
| `gap-2`     | 8px        | Badge and tag gaps    |
| `gap-3`     | 12px       | Form field gaps       |
| `gap-4`     | 16px       | Section internal gaps |
| `gap-6`     | 24px       | Between sections      |
| `gap-8`     | 32px       | Page section gaps     |
| `p-4`       | 16px       | Card padding          |
| `p-6`       | 24px       | Large card padding    |
| `px-4 py-2` | 16px / 8px | Button padding        |
| `px-3 py-1` | 12px / 4px | Badge padding         |

---

## Component Tokens

### Cards

```
background: bg-surface
border: 1px solid var(--border)
border-radius: 16px (rounded-2xl in Tailwind)
padding: 24px (p-6)
box-shadow: 0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)
```

### Buttons

**Primary:**

```
background: bg-accent
text: text-accent-foreground
border-radius: rounded-md
padding: px-4 py-2
font-weight: font-medium
```

**Secondary:**

```
background: bg-surface
border: border border-border
text: text-text-primary
border-radius: rounded-md
padding: px-4 py-2
```

**Ghost:**

```
background: transparent
text: text-text-secondary
hover: hover:bg-surface-secondary
border-radius: rounded-md
```

**Danger (delete):**

```
background: bg-surface
border: border border-border
text: text-error
hover: hover:bg-surface-secondary
```

### Input Fields

```
background: bg-surface
border: border border-border
border-radius: rounded-md
padding: px-3 py-2
text: text-text-primary
placeholder: text-text-muted
focus: ring-1 ring-accent
```

### Badges

```
border-radius: rounded-full
padding: px-2 py-0.5
font-size: text-xs
font-weight: font-medium
```

### Budget Progress Bar

```
background track: bg-border-light
fill: varies by state (see Budget Progress above)
height: 8px (cards) / 4px (table mini)
border-radius: rounded-full
```

### Trend Badges (stat cards)

```
background: #ECFDF5 (success-lightest)
text color: #009966 (success-darker)
border-radius: 4px (rounded-sm)
padding: 2px 8px
font-size: 12px
font-weight: 500
```

### Dashboard Chart Colors

| Chart                      | Color                                                           |
| -------------------------- | --------------------------------------------------------------- |
| Spending by Category (bars)| `#7C5CFC` primary, category dots for legend                     |
| Income vs Expense (lines)  | Income `#10B981`, Expense `#7C5CFC`, 3px width                  |
| Chart grid lines           | `1px dashed #E7EAF3`                                            |
| Chart axis labels          | `#9CA3AF`, 12px                                                 |

### Logo

```
background: linear-gradient(45deg, #7C5CFC 0%, #4A2EC5 100%)
border-radius: 10px
size: 36x36px
```

---

## Invariants

- Never use hex values directly in components — always use CSS variables via Tailwind tokens (exception: category dot color comes from DB, rendered via inline style)
- Font is Inter — always import via next/font/google, never use a fallback system font
- Never use raw Tailwind color classes like `bg-purple-500` or `text-gray-600` — use project tokens only
- `--accent` (#7C5CFC) is the only purple — never use Tailwind's built-in purple scale
- Amount colors follow Amount Colors table — never invent new money colors
- All borders default to `--border` (#E7EAF3) — never use `border-gray-*`
