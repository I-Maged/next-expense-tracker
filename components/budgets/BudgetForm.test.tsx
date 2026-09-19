import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpsert } = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
}));

vi.mock("@/actions/budgets", () => ({
  upsertBudget: mockUpsert,
  deleteBudget: vi.fn(),
  copyLastMonth: vi.fn(),
}));

import { BudgetForm } from "@/components/budgets/BudgetForm";

const CATEGORIES = [
  { id: "cat_food", name: "Food", color: "#EF4444" },
  { id: "cat_rent", name: "Rent", color: "#7C5CFC" },
];

function renderCreate(
  overrides: Partial<Parameters<typeof BudgetForm>[0]> = {},
): void {
  render(
    <BudgetForm
      open
      onClose={() => {}}
      categories={CATEGORIES}
      month="2026-09"
      {...overrides}
    />,
  );
}

describe("BudgetForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <BudgetForm
        open={false}
        onClose={() => {}}
        categories={CATEGORIES}
        month="2026-09"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders category select and decimal limit for create", () => {
    renderCreate();

    expect(
      screen.getByRole("dialog", { name: "Set budget" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly limit/i)).toHaveAttribute(
      "inputmode",
      "decimal",
    );
  });

  it("shows a friendly error for an empty limit without calling the action", async () => {
    renderCreate();

    fireEvent.click(screen.getByRole("button", { name: "Set budget" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /greater than 0/i,
    );
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("upserts a budget and notifies on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    mockUpsert.mockResolvedValue({ success: true });
    renderCreate({ onClose, onSuccess });

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: "cat_rent" },
    });
    fireEvent.change(screen.getByLabelText(/monthly limit/i), {
      target: { value: "750" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Set budget" }));

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith({
        categoryId: "cat_rent",
        month: "2026-09",
        limit: "750",
      });
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows server errors without closing", async () => {
    mockUpsert.mockResolvedValue({
      success: false,
      error: "Category not found",
    });
    renderCreate();

    fireEvent.change(screen.getByLabelText(/monthly limit/i), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Set budget" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Category not found",
    );
  });

  it("prefills and locks the category for edit", async () => {
    const onClose = vi.fn();
    mockUpsert.mockResolvedValue({ success: true });
    render(
      <BudgetForm
        open
        onClose={onClose}
        categories={CATEGORIES}
        month="2026-09"
        initial={{
          id: "bud_1",
          categoryId: "cat_food",
          category: CATEGORIES[0],
          month: "2026-09",
          limit: 500,
          spent: 320,
        }}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Edit budget" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly limit/i)).toHaveValue("500");
    expect(screen.getByLabelText(/category/i)).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/monthly limit/i), {
      target: { value: "600" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith({
        categoryId: "cat_food",
        month: "2026-09",
        limit: "600",
      });
    });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
