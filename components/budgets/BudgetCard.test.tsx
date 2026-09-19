import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BudgetCard } from "@/components/budgets/BudgetCard";
import type { MockBudget } from "@/lib/mockBudgets";

const BASE: MockBudget = {
  id: "mock-budget-01",
  categoryId: "mock-cat-food",
  category: { id: "mock-cat-food", name: "Food", color: "#EF4444" },
  month: "2026-09",
  limit: 500,
  spent: 320,
};

function renderCard(spent: number, limit = 500): void {
  render(<BudgetCard budget={{ ...BASE, spent, limit }} />);
}

describe("BudgetCard", () => {
  it("renders name with dot and spent over limit", () => {
    renderCard(320);

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("$320.00 / $500.00")).toBeInTheDocument();
    expect(screen.getByText("$180.00 remaining")).toBeInTheDocument();
  });

  it("uses a green fill under 80 percent", () => {
    renderCard(320);

    const bar = screen.getByRole("progressbar", {
      name: "Food budget progress",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "64");
    expect(bar.className).toContain("bg-success");
  });

  it("uses an orange fill from 80 to 100 percent", () => {
    renderCard(450);

    const bar = screen.getByRole("progressbar", {
      name: "Food budget progress",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "90");
    expect(bar.className).toContain("bg-warning");
    expect(screen.getByText("$50.00 remaining")).toBeInTheDocument();
  });

  it("highlights over-budget in red with the over amount", () => {
    renderCard(620);

    const bar = screen.getByRole("progressbar", {
      name: "Food budget progress",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar.className).toContain("bg-error");
    expect(screen.getByText("+$120.00 over")).toHaveClass("text-error");
  });
});
