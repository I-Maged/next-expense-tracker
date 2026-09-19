import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/actions/transactions", () => ({
  createTransaction: mockCreate,
  updateTransaction: mockUpdate,
  deleteTransaction: vi.fn(),
}));

import { TransactionForm } from "@/components/transactions/TransactionForm";

const CATEGORIES = [
  { id: "cat_food", name: "Food", color: "#EF4444" },
  { id: "cat_rent", name: "Rent", color: "#7C5CFC" },
];

function renderCreate(
  overrides: Partial<Parameters<typeof TransactionForm>[0]> = {},
): void {
  render(
    <TransactionForm
      open
      onClose={() => {}}
      categories={CATEGORIES}
      {...overrides}
    />,
  );
}

describe("TransactionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to Expense and today", () => {
    renderCreate();

    expect(
      screen.getByRole("dialog", { name: "Add transaction" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expense" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText(/amount/i)).toHaveAttribute(
      "inputmode",
      "decimal",
    );
  });

  it("shows a friendly error for an empty amount without calling the action", async () => {
    renderCreate();

    fireEvent.click(screen.getByRole("button", { name: "Add transaction" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /greater than 0/i,
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a transaction and notifies on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    mockCreate.mockResolvedValue({ success: true });
    renderCreate({ onClose, onSuccess });

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "42.50" },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: "cat_rent" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add transaction" }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledOnce();
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "EXPENSE",
        amount: "42.50",
        categoryId: "cat_rent",
      }),
    );
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows server errors without closing", async () => {
    mockCreate.mockResolvedValue({
      success: false,
      error: "Category not found",
    });
    renderCreate();

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add transaction" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Category not found",
    );
  });

  it("prefills for edit and calls update with the id", async () => {
    const onClose = vi.fn();
    mockUpdate.mockResolvedValue({ success: true });
    render(
      <TransactionForm
        open
        onClose={onClose}
        categories={CATEGORIES}
        initial={{
          id: "tx_1",
          date: "2026-09-10",
          note: "Groceries",
          type: "INCOME",
          amount: 42.5,
          categoryId: "cat_food",
          category: CATEGORIES[0],
        }}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Edit transaction" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toHaveValue("42.5");

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: "tx_1", type: "INCOME" }),
      );
    });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
