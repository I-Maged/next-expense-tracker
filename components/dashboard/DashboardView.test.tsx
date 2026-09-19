import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MOCK_BUDGET_VS_ACTUAL,
  MOCK_CATEGORY_SPENDING,
  MOCK_DASHBOARD_MONTH,
  MOCK_INCOME_EXPENSE_TREND,
} from "@/lib/mockDashboard";
import { DashboardView } from "@/components/dashboard/DashboardView";

const STATS = { spent: 2845.5, income: 5200, balance: 2354.5, overBudgetCount: 1 };

const RECENT = [
  {
    id: "tx_1",
    date: "2026-09-14",
    note: "Weekly groceries",
    type: "EXPENSE" as const,
    amount: 86.4,
    categoryId: "cat_food",
    category: { id: "cat_food", name: "Food", color: "#EF4444" },
  },
];

describe("DashboardView", () => {
  it("renders the header and every dashboard section", () => {
    render(
      <DashboardView
        stats={STATS}
        categorySpending={MOCK_CATEGORY_SPENDING}
        trend={MOCK_INCOME_EXPENSE_TREND}
        budgetRows={MOCK_BUDGET_VS_ACTUAL}
        recent={RECENT}
        month={MOCK_DASHBOARD_MONTH}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("stat-cards")).toBeInTheDocument();
    expect(screen.getByTestId("category-chart")).toBeInTheDocument();
    expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
    expect(screen.getByTestId("budget-vs-actual")).toBeInTheDocument();
    expect(screen.getByTestId("recent-transactions")).toBeInTheDocument();
  });

  it("shows section empty states when every list is empty", () => {
    render(
      <DashboardView
        stats={{ spent: 0, income: 0, balance: 0, overBudgetCount: 0 }}
        categorySpending={[]}
        trend={[]}
        budgetRows={[]}
        recent={[]}
        month={MOCK_DASHBOARD_MONTH}
      />,
    );

    expect(screen.getByText(/no data this month/i)).toBeInTheDocument();
    expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no budgets this month/i)).toBeInTheDocument();
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });
});
