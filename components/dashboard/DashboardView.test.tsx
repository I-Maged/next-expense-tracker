import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MOCK_BUDGET_VS_ACTUAL,
  MOCK_CATEGORY_SPENDING,
  MOCK_DASHBOARD_MONTH,
  MOCK_DASHBOARD_STATS,
  MOCK_INCOME_EXPENSE_TREND,
  MOCK_RECENT_TRANSACTIONS,
} from "@/lib/mockDashboard";
import { DashboardView } from "@/components/dashboard/DashboardView";

describe("DashboardView", () => {
  it("renders the header and every dashboard section", () => {
    render(
      <DashboardView
        stats={MOCK_DASHBOARD_STATS}
        categorySpending={MOCK_CATEGORY_SPENDING}
        trend={MOCK_INCOME_EXPENSE_TREND}
        budgetRows={MOCK_BUDGET_VS_ACTUAL}
        recent={MOCK_RECENT_TRANSACTIONS}
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
