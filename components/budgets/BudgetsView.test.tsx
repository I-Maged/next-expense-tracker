import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BudgetsView } from "@/components/budgets/BudgetsView";
import {
  MOCK_BUDGETS,
  MOCK_CURRENT_MONTH,
  MOCK_PREV_MONTH,
} from "@/lib/mockBudgets";
import { monthKey } from "@/lib/utils";

describe("BudgetsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, month picker, and dead action buttons", () => {
    render(<BudgetsView budgets={MOCK_BUDGETS} />);

    expect(
      screen.getByRole("heading", { name: "Budgets" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/month/i)).toHaveValue(MOCK_CURRENT_MONTH);
    expect(
      screen.getByRole("button", { name: "Copy Last Month" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Set Budget" }),
    ).toBeInTheDocument();
  });

  it("shows current-month cards by default", () => {
    render(<BudgetsView budgets={MOCK_BUDGETS} />);

    expect(screen.getByTestId("budget-grid")).toBeInTheDocument();
    expect(screen.getAllByTestId("budget-card")).toHaveLength(5);
  });

  it("swaps cards when the month changes", () => {
    render(<BudgetsView budgets={MOCK_BUDGETS} />);

    fireEvent.change(screen.getByLabelText(/month/i), {
      target: { value: MOCK_PREV_MONTH },
    });

    expect(screen.getAllByTestId("budget-card")).toHaveLength(2);
  });

  it("shows the empty state for a month with no budgets", () => {
    render(<BudgetsView budgets={MOCK_BUDGETS} />);

    fireEvent.change(screen.getByLabelText(/month/i), {
      target: { value: "2020-01" },
    });

    expect(screen.getByText(/no budgets this month/i)).toBeInTheDocument();
    expect(screen.queryByTestId("budget-grid")).not.toBeInTheDocument();
  });

  it("defaults to the current month", () => {
    render(<BudgetsView budgets={[]} />);

    expect(screen.getByLabelText(/month/i)).toHaveValue(monthKey(new Date()));
  });
});
