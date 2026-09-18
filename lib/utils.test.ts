import { describe, expect, it } from "vitest";

import {
  DEFAULT_CATEGORIES,
  TRANSACTIONS_PER_PAGE,
  cn,
  formatCurrency,
  monthKey,
} from "@/lib/utils";

describe("cn", () => {
  it("joins truthy classes and skips falsy values", () => {
    expect(cn("a", false, "b", null, undefined, "c")).toBe("a b c");
  });
});

describe("formatCurrency", () => {
  it("formats USD with two decimals", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("monthKey", () => {
  it("returns YYYY-MM with zero-padded month", () => {
    expect(monthKey(new Date(2026, 0, 15))).toBe("2026-01");
    expect(monthKey(new Date(2026, 8, 18))).toBe("2026-09");
    expect(monthKey(new Date(2026, 11, 31))).toBe("2026-12");
  });
});

describe("constants", () => {
  it("seeds exactly the eight default categories", () => {
    expect([...DEFAULT_CATEGORIES]).toEqual([
      "Food",
      "Transport",
      "Rent",
      "Utilities",
      "Shopping",
      "Health",
      "Entertainment",
      "Other",
    ]);
  });

  it("paginates twenty transactions per page", () => {
    expect(TRANSACTIONS_PER_PAGE).toBe(20);
  });
});
