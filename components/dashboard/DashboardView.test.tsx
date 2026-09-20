import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardView } from "@/components/dashboard/DashboardView";

const MONTH = "2026-09";

const STATS = { spent: 2845.5, income: 5200, balance: 2354.5, overBudgetCount: 1 };

const CATEGORY_SPENDING = [
  { name: "Food", total: 320, color: "#EF4444" },
  { name: "Shopping", total: 365.5, color: "#EC4899" },
];

const TREND = [
  { month: "2026-04", income: 4800, expense: 2450 },
  { month: "2026-05", income: 4950, expense: 2680 },
  { month: "2026-06", income: 5100, expense: 2920 },
  { month: "2026-07", income: 4900, expense: 2540 },
  { month: "2026-08", income: 5050, expense: 3100 },
  { month: "2026-09", income: 5200, expense: 2845.5 },
];

const BUDGET_ROWS = [
  {
    id: "bud_1",
    categoryId: "cat_food",
    category: { id: "cat_food", name: "Food", color: "#EF4444" },
    limit: 500,
    spent: 320,
  },
  {
    id: "bud_2",
    categoryId: "cat_shop",
    category: { id: "cat_shop", name: "Shopping", color: "#EC4899" },
    limit: 300,
    spent: 365.5,
  },
];

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
        categorySpending={CATEGORY_SPENDING}
        trend={TREND}
        budgetRows={BUDGET_ROWS}
        recent={RECENT}
        month={MONTH}
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
        month={MONTH}
      />,
    );

    expect(screen.getByText(/no data this month/i)).toBeInTheDocument();
    expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no budgets this month/i)).toBeInTheDocument();
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });
});
