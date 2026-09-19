import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDelete } = vi.hoisted(() => ({
  mockDelete: vi.fn(),
}));

vi.mock("@/actions/budgets", () => ({
  upsertBudget: vi.fn(),
  deleteBudget: mockDelete,
  copyLastMonth: vi.fn(),
}));

import { DeleteBudgetDialog } from "@/components/budgets/DeleteBudgetDialog";

const BUDGET = {
  id: "bud_1",
  categoryId: "cat_food",
  category: { id: "cat_food", name: "Food", color: "#EF4444" },
  month: "2026-09",
  limit: 500,
  spent: 320,
};

describe("DeleteBudgetDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <DeleteBudgetDialog open={false} onClose={() => {}} budget={BUDGET} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("confirms delete and notifies on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    mockDelete.mockResolvedValue({ success: true });
    render(
      <DeleteBudgetDialog
        open
        onClose={onClose}
        budget={BUDGET}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText(/food/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith({ id: "bud_1" });
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows server errors without closing", async () => {
    mockDelete.mockResolvedValue({
      success: false,
      error: "Budget not found",
    });
    render(<DeleteBudgetDialog open onClose={() => {}} budget={BUDGET} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Budget not found",
    );
  });
});
