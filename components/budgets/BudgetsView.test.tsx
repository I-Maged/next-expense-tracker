import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, refreshMock, mockCopy } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  mockCopy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  usePathname: () => "/budgets",
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/actions/budgets", () => ({
  upsertBudget: vi.fn(),
  deleteBudget: vi.fn(),
  copyLastMonth: mockCopy,
}));

import { BudgetsView } from "@/components/budgets/BudgetsView";
import type {
  BudgetCategoryView,
  BudgetView,
} from "@/components/budgets/types";

const CATEGORIES: Array<BudgetCategoryView> = [
  { id: "cat_food", name: "Food", color: "#EF4444" },
  { id: "cat_rent", name: "Rent", color: "#7C5CFC" },
];

const BUDGETS: Array<BudgetView> = [
  {
    id: "bud_1",
    categoryId: "cat_food",
    category: CATEGORIES[0],
    month: "2026-09",
    limit: 500,
    spent: 320,
  },
  {
    id: "bud_2",
    categoryId: "cat_rent",
    category: CATEGORIES[1],
    month: "2026-09",
    limit: 1500,
    spent: 1600,
  },
];

function renderView(
  overrides: Partial<Parameters<typeof BudgetsView>[0]> = {},
): void {
  render(
    <BudgetsView
      budgets={BUDGETS}
      categories={CATEGORIES}
      month="2026-09"
      {...overrides}
    />,
  );
}

describe("BudgetsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, month picker, cards, and action buttons", () => {
    renderView();

    expect(
      screen.getByRole("heading", { name: "Budgets" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/month/i)).toHaveValue("2026-09");
    expect(
      screen.getByRole("button", { name: "Copy Last Month" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Set Budget" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("budget-grid")).toBeInTheDocument();
    expect(screen.getAllByTestId("budget-card")).toHaveLength(2);
  });

  it("pushes a URL query when the month changes", () => {
    renderView();

    fireEvent.change(screen.getByLabelText(/month/i), {
      target: { value: "2026-08" },
    });

    expect(pushMock).toHaveBeenCalledOnce();
    expect(pushMock.mock.calls[0][0]).toContain("month=2026-08");
  });

  it("shows the empty state when there are no budgets", () => {
    renderView({ budgets: [] });

    expect(screen.getByText(/no budgets this month/i)).toBeInTheDocument();
    expect(screen.queryByTestId("budget-grid")).not.toBeInTheDocument();
  });

  it("opens the set form from the header button", () => {
    renderView();

    fireEvent.click(screen.getByRole("button", { name: "Set Budget" }));

    expect(
      screen.getByRole("dialog", { name: "Set budget" }),
    ).toBeInTheDocument();
  });

  it("opens the edit dialog from a card action", () => {
    renderView();

    fireEvent.click(screen.getByRole("button", { name: "Edit budget bud_1" }));

    expect(
      screen.getByRole("dialog", { name: "Edit budget" }),
    ).toBeInTheDocument();
  });

  it("opens the delete dialog from a card action", () => {
    renderView();

    fireEvent.click(
      screen.getByRole("button", { name: "Delete budget bud_1" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Delete budget" }),
    ).toBeInTheDocument();
  });

  it("copies last month and refreshes on success", async () => {
    mockCopy.mockResolvedValue({ success: true, copied: 2, skipped: 0 });
    renderView();

    fireEvent.click(screen.getByRole("button", { name: "Copy Last Month" }));

    await waitFor(() => {
      expect(mockCopy).toHaveBeenCalledWith({ month: "2026-09" });
    });
    expect(refreshMock).toHaveBeenCalledOnce();
  });

  it("shows copy errors without refreshing", async () => {
    mockCopy.mockResolvedValue({
      success: false,
      error: "No budgets in 2026-08 to copy",
    });
    renderView();

    fireEvent.click(screen.getByRole("button", { name: "Copy Last Month" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /no budgets in 2026-08/i,
    );
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
