export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

export const CURRENCY = "USD";
export const TRANSACTIONS_PER_PAGE = 20;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY }).format(
    value,
  );
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
