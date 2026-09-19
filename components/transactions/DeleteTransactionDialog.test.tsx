import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDelete } = vi.hoisted(() => ({
  mockDelete: vi.fn(),
}));

vi.mock("@/actions/transactions", () => ({
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: mockDelete,
}));

import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";

const TRANSACTION = {
  id: "tx_1",
  date: "2026-09-10",
  note: "Groceries",
  type: "EXPENSE" as const,
  amount: 42.5,
  categoryId: "cat_food",
  category: { id: "cat_food", name: "Food", color: "#EF4444" },
};

describe("DeleteTransactionDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <DeleteTransactionDialog
        open={false}
        onClose={() => {}}
        transaction={TRANSACTION}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("confirms delete and notifies on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    mockDelete.mockResolvedValue({ success: true });
    render(
      <DeleteTransactionDialog
        open
        onClose={onClose}
        transaction={TRANSACTION}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText(/groceries/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith({ id: "tx_1" });
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows server errors without closing", async () => {
    mockDelete.mockResolvedValue({
      success: false,
      error: "Transaction not found",
    });
    render(
      <DeleteTransactionDialog
        open
        onClose={() => {}}
        transaction={TRANSACTION}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Transaction not found",
    );
  });
});
