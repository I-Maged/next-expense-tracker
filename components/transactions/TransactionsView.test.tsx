import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MOCK_CATEGORIES, MOCK_TRANSACTIONS } from "@/lib/mockTransactions";
import { TransactionsView } from "@/components/transactions/TransactionsView";

function renderView(): void {
  render(
    <TransactionsView
      transactions={MOCK_TRANSACTIONS}
      categories={MOCK_CATEGORIES}
    />,
  );
}

describe("TransactionsView", () => {
  it("shows the first page of all transactions", () => {
    renderView();

    expect(screen.getByText("Showing 1 to 20 of 48")).toBeInTheDocument();
    const table = screen.getByTestId("transactions-table");
    expect(within(table).getAllByRole("row")).toHaveLength(21);
  });

  it("filters by search text", () => {
    renderView();

    fireEvent.change(screen.getByPlaceholderText(/search notes/i), {
      target: { value: "salary" },
    });

    expect(screen.getByText("Showing 1 to 3 of 3")).toBeInTheDocument();
  });

  it("filters by type", () => {
    renderView();

    fireEvent.change(screen.getByLabelText(/^type/i), {
      target: { value: "INCOME" },
    });

    expect(screen.getByText("Showing 1 to 12 of 12")).toBeInTheDocument();
  });

  it("filters by category and month combined", () => {
    renderView();

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: "mock-cat-food" },
    });
    fireEvent.change(screen.getByLabelText(/month/i), {
      target: { value: "2026-09" },
    });

    expect(screen.getByText("Showing 1 to 2 of 2")).toBeInTheDocument();
  });

  it("paginates to the next page", () => {
    renderView();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Showing 21 to 40 of 48")).toBeInTheDocument();
  });

  it("shows no-results with a clear-filters reset", () => {
    renderView();

    fireEvent.change(screen.getByPlaceholderText(/search notes/i), {
      target: { value: "zzz-no-such-note" },
    });

    expect(
      screen.getByText(/no transactions match these filters/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("transactions-table")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(screen.getByText("Showing 1 to 20 of 48")).toBeInTheDocument();
  });

  it("shows the empty state when there are no transactions at all", () => {
    render(<TransactionsView transactions={[]} categories={MOCK_CATEGORIES} />);

    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("transactions-table")).not.toBeInTheDocument();
  });
});
