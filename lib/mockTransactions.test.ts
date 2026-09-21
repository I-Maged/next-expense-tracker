import { describe, expect, it } from "vitest";

import { MOCK_CATEGORIES, MOCK_TRANSACTIONS } from "@/lib/mockTransactions";

describe("lib/mockTransactions", () => {
  it("seeds eight stable categories", () => {
    expect(MOCK_CATEGORIES).toHaveLength(8);
    expect(MOCK_CATEGORIES.map((c) => c.name)).toEqual([
      "Food",
      "Transport",
      "Rent",
      "Utilities",
      "Shopping",
      "Health",
      "Entertainment",
      "Other",
    ]);
    for (const category of MOCK_CATEGORIES) {
      expect(category.id).toMatch(/^mock-cat-/);
      expect(category.color).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it("builds 48 deterministic transactions across three months", () => {
    expect(MOCK_TRANSACTIONS).toHaveLength(48);

    const ids = MOCK_TRANSACTIONS.map((t) => t.id);
    expect(new Set(ids).size).toBe(48);
    expect(ids[0]).toBe("mock-tx-01");

    for (const tx of MOCK_TRANSACTIONS) {
      expect(tx.date).toMatch(/^2026-0[789]-\d{2}$/);
      expect(["INCOME", "EXPENSE"]).toContain(tx.type);
      expect(tx.amount).toBeGreaterThanOrEqual(5);
      // Two-decimal precision (compare via toFixed — binary floats
      // like 17.33 * 100 are not exact).
      expect(tx.amount).toBe(Number(tx.amount.toFixed(2)));
      const category = MOCK_CATEGORIES.find((c) => c.id === tx.categoryId);
      expect(category).toBeDefined();
      expect(tx.category).toEqual(category);
    }
  });

  it("marks every fourth transaction as income", () => {
    MOCK_TRANSACTIONS.forEach((tx, index) => {
      expect(tx.type).toBe(index % 4 === 1 ? "INCOME" : "EXPENSE");
    });
  });
});
