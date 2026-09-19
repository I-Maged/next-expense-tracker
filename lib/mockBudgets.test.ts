import { describe, expect, it } from "vitest";

import {
  MOCK_BUDGETS,
  MOCK_CURRENT_MONTH,
  MOCK_PREV_MONTH,
} from "@/lib/mockBudgets";

describe("MOCK_BUDGETS", () => {
  it("holds five current-month budgets covering all progress states", () => {
    const current = MOCK_BUDGETS.filter(
      (budget) => budget.month === MOCK_CURRENT_MONTH,
    );

    expect(current).toHaveLength(5);
    expect(current.some((budget) => budget.spent / budget.limit < 0.8)).toBe(
      true,
    );
    expect(
      current.some(
        (budget) =>
          budget.spent / budget.limit >= 0.8 &&
          budget.spent / budget.limit <= 1,
      ),
    ).toBe(true);
    expect(current.some((budget) => budget.spent > budget.limit)).toBe(true);
  });

  it("holds two prior-month budgets so month switching shows data", () => {
    const prev = MOCK_BUDGETS.filter(
      (budget) => budget.month === MOCK_PREV_MONTH,
    );

    expect(prev).toHaveLength(2);
    expect(MOCK_PREV_MONTH).not.toBe(MOCK_CURRENT_MONTH);
  });

  it("uses valid months, positive limits, and non-negative spent", () => {
    expect(MOCK_CURRENT_MONTH).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);

    for (const budget of MOCK_BUDGETS) {
      expect(budget.month).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(budget.limit).toBeGreaterThan(0);
      expect(budget.spent).toBeGreaterThanOrEqual(0);
      expect(budget.categoryId).toBe(budget.category.id);
    }
  });
});
