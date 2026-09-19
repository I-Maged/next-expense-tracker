import { describe, expect, it } from "vitest";

import {
  MOCK_BUDGET_VS_ACTUAL,
  MOCK_CATEGORY_SPENDING,
  MOCK_DASHBOARD_MONTH,
  MOCK_DASHBOARD_STATS,
  MOCK_INCOME_EXPENSE_TREND,
  MOCK_RECENT_TRANSACTIONS,
} from "@/lib/mockDashboard";

describe("MOCK_DASHBOARD", () => {
  it("holds plausible stat totals with a matching balance", () => {
    expect(MOCK_DASHBOARD_MONTH).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    expect(MOCK_DASHBOARD_STATS.spent).toBeGreaterThan(0);
    expect(MOCK_DASHBOARD_STATS.income).toBeGreaterThan(0);
    expect(MOCK_DASHBOARD_STATS.balance).toBeCloseTo(
      MOCK_DASHBOARD_STATS.income - MOCK_DASHBOARD_STATS.spent,
      2,
    );
    expect(MOCK_DASHBOARD_STATS.overBudgetCount).toBeGreaterThan(0);
  });

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

  it("holds five recent transactions ordered newest first", () => {
    expect(MOCK_RECENT_TRANSACTIONS).toHaveLength(5);

    const dates = MOCK_RECENT_TRANSACTIONS.map((row) => row.date);
    expect([...dates].sort().reverse()).toEqual(dates);

    for (const row of MOCK_RECENT_TRANSACTIONS) {
      expect(row.amount).toBeGreaterThan(0);
      expect(["INCOME", "EXPENSE"]).toContain(row.type);
      expect(row.categoryId).toBe(row.category.id);
    }
  });
});
