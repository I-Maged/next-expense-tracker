import { describe, expect, it } from "vitest";

import {
  MOCK_BUDGET_VS_ACTUAL,
  MOCK_CATEGORY_SPENDING,
  MOCK_DASHBOARD_MONTH,
  MOCK_INCOME_EXPENSE_TREND,
} from "@/lib/mockDashboard";

describe("MOCK_DASHBOARD", () => {
  it("holds eight categories with positive totals", () => {
    expect(MOCK_CATEGORY_SPENDING).toHaveLength(8);

    for (const row of MOCK_CATEGORY_SPENDING) {
      expect(row.name.length).toBeGreaterThan(0);
      expect(row.total).toBeGreaterThan(0);
      expect(row.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("holds six trailing months of income and expense", () => {
    expect(MOCK_INCOME_EXPENSE_TREND).toHaveLength(6);

    for (const row of MOCK_INCOME_EXPENSE_TREND) {
      expect(row.month).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(row.income).toBeGreaterThan(0);
      expect(row.expense).toBeGreaterThanOrEqual(0);
    }

    const last = MOCK_INCOME_EXPENSE_TREND[5];
    expect(last.month).toBe(MOCK_DASHBOARD_MONTH);
  });

  it("holds five budget rows covering all progress states", () => {
    expect(MOCK_BUDGET_VS_ACTUAL).toHaveLength(5);
    expect(
      MOCK_BUDGET_VS_ACTUAL.some((row) => row.spent / row.limit < 0.8),
    ).toBe(true);
    expect(
      MOCK_BUDGET_VS_ACTUAL.some(
        (row) => row.spent / row.limit >= 0.8 && row.spent <= row.limit,
      ),
    ).toBe(true);
    expect(MOCK_BUDGET_VS_ACTUAL.some((row) => row.spent > row.limit)).toBe(
      true,
    );

    for (const row of MOCK_BUDGET_VS_ACTUAL) {
      expect(row.limit).toBeGreaterThan(0);
      expect(row.spent).toBeGreaterThanOrEqual(0);
      expect(row.categoryId).toBe(row.category.id);
    }
  });
});
