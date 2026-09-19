import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  usePathname: () => "/transactions",
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/actions/transactions", () => ({
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));

import { TransactionsView } from "@/components/transactions/TransactionsView";
import type {
  CategoryView,
  TransactionView,
} from "@/components/transactions/types";

const CATEGORIES: Array<CategoryView> = [
  { id: "cat_food", name: "Food", color: "#EF4444" },
  { id: "cat_rent", name: "Rent", color: "#7C5CFC" },
];

const TRANSACTIONS: Array<TransactionView> = [
  {
    id: "tx_1",
    date: "2026-09-10",
    note: "Groceries",
    type: "EXPENSE",
    amount: 42.5,
    categoryId: "cat_food",
    category: CATEGORIES[0],
  },
  {
    id: "tx_2",
    date: "2026-09-09",
    note: "Salary",
    type: "INCOME",
    amount: 1200,
    categoryId: "cat_rent",
    category: CATEGORIES[1],
  },
];

function renderView(
  overrides: Partial<Parameters<typeof TransactionsView>[0]> = {},
): void {
  render(
    <TransactionsView
      transactions={TRANSACTIONS}
      categories={CATEGORIES}
      total={2}
      page={1}
      totalPages={1}
      start={1}
      end={2}
      search=""
      categoryId="all"
      typeFilter="ALL"
      month="2026-09"
      {...overrides}
    />,
  );
}

describe("TransactionsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, filters, table, and pagination from server props", () => {
    renderView();

    expect(
      screen.getByRole("heading", { name: "Transactions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add transaction/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
    expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 to 2 of 2")).toBeInTheDocument();
  });

  it("pushes a URL query when search changes", () => {
    renderView();

    fireEvent.change(screen.getByPlaceholderText(/search notes/i), {
      target: { value: "salary" },
    });

    expect(pushMock).toHaveBeenCalledOnce();
    expect(pushMock.mock.calls[0][0]).toContain("search=salary");
  });

  it("pushes the next page when Next is clicked", () => {
    renderView({ total: 25, totalPages: 2, start: 1, end: 20 });

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(pushMock).toHaveBeenCalledWith("/transactions?page=2");
  });

  it("shows no-results with a clear-filters reset", () => {
    renderView({ transactions: [], total: 0, start: 0, end: 0, search: "zzz" });

    expect(
      screen.getByText(/no transactions match these filters/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(pushMock).toHaveBeenCalledWith("/transactions");
  });

  it("shows the empty state when there are no transactions at all", () => {
    renderView({ transactions: [], total: 0, start: 0, end: 0 });

    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("transactions-table")).not.toBeInTheDocument();
  });

  it("opens the edit dialog from a row action", () => {
    renderView();

    fireEvent.click(
      screen.getByRole("button", { name: "Edit transaction tx_1" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Edit transaction" }),
    ).toBeInTheDocument();
  });

  it("opens the delete dialog from a row action", () => {
    renderView();

    fireEvent.click(
      screen.getByRole("button", { name: "Delete transaction tx_1" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Delete transaction" }),
    ).toBeInTheDocument();
  });
});
