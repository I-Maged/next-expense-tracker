import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BudgetCard } from "@/components/budgets/BudgetCard";
import type { BudgetView } from "@/components/budgets/types";

const BASE: BudgetView = {
  id: "bud_1",
  categoryId: "mock-cat-food",
  category: { id: "mock-cat-food", name: "Food", color: "#EF4444" },
  month: "2026-09",
  limit: 500,
  spent: 320,
};

function renderCard(budget: BudgetView = BASE): void {
  render(<BudgetCard budget={budget} />);
}

describe("BudgetCard", () => {
  it("renders name with dot and spent over limit", () => {
    renderCard();

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("$320.00 / $500.00")).toBeInTheDocument();
    expect(screen.getByText("$180.00 remaining")).toBeInTheDocument();
  });

  it("uses a green fill under 80 percent", () => {
    renderCard();

    const bar = screen.getByRole("progressbar", {
      name: "Food budget progress",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "64");
    expect(bar.className).toContain("bg-success");
  });

  it("uses an orange fill from 80 to 100 percent", () => {
    renderCard({ ...BASE, spent: 450 });

    const bar = screen.getByRole("progressbar", {
      name: "Food budget progress",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "90");
    expect(bar.className).toContain("bg-warning");
    expect(screen.getByText("$50.00 remaining")).toBeInTheDocument();
  });

  it("highlights over-budget in red with the over amount", () => {
    renderCard({ ...BASE, spent: 620 });

    const bar = screen.getByRole("progressbar", {
      name: "Food budget progress",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar.className).toContain("bg-error");
    expect(screen.getByText("+$120.00 over")).toHaveClass("text-error");
  });

  it("calls edit and delete callbacks from row actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<BudgetCard budget={BASE} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit budget bud_1" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Delete budget bud_1" }),
    );

    expect(onEdit).toHaveBeenCalledWith(BASE);
    expect(onDelete).toHaveBeenCalledWith(BASE);
  });
});
