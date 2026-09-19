import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BudgetVsActual } from "@/components/dashboard/BudgetVsActual";

const ROWS = [
  {
    id: "ba_1",
    categoryId: "cat_food",
    category: { id: "cat_food", name: "Food", color: "#EF4444" },
    limit: 500,
    spent: 320,
  },
  {
    id: "ba_2",
    categoryId: "cat_shop",
    category: { id: "cat_shop", name: "Shopping", color: "#EC4899" },
    limit: 300,
    spent: 365.5,
  },
];

describe("BudgetVsActual", () => {
  it("renders rows with spent, limit, and over-budget text", () => {
    render(<BudgetVsActual rows={ROWS} month="2026-09" />);

    expect(
      screen.getByRole("heading", { name: "Budget vs Actual" }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("budget-vs-actual-row")).toHaveLength(2);
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("+$65.50 over")).toBeInTheDocument();
  });

  it("renders the empty state with a link to budgets", () => {
    render(<BudgetVsActual rows={[]} month="2026-09" />);

    expect(screen.getByText(/no budgets this month/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /set a budget/i })).toHaveAttribute(
      "href",
      "/budgets",
    );
  });
});
