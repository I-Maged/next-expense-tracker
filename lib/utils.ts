export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

export const CURRENCY = "USD";
export const TRANSACTIONS_PER_PAGE = 20;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
  }).format(value);
}

export function isMaxTwoDecimals(value: number): boolean {
  return Number(value.toFixed(2)) === value;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(month: string, delta: number): string {
  const year = Number(month.slice(0, 4));
  const index = Number(month.slice(5, 7)) - 1 + delta;
  return monthKey(new Date(year, index, 1));
}

export const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
] as const;

export const CATEGORY_COLORS = [
  "#EF4444",
  "#2B7FFF",
  "#7C5CFC",
  "#00BC7D",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#6A7282",
] as const;
