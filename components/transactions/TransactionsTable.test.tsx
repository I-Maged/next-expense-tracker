import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MOCK_TRANSACTIONS } from "@/lib/mockTransactions";
import { formatCurrency } from "@/lib/utils";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";

describe("TransactionsTable", () => {
  it("renders column headers", () => {
    render(<TransactionsTable transactions={MOCK_TRANSACTIONS.slice(0, 2)} />);

    const table = screen.getByTestId("transactions-table");
    for (const header of [
      "Date",
      "Note",
      "Category",
      "Type",
      "Amount",
      "Actions",
    ]) {
      expect(
        within(table).getByRole("columnheader", { name: header }),
      ).toBeInTheDocument();
    }
  });

  it("renders one row per transaction with badges and signed amounts", () => {
    const rows = MOCK_TRANSACTIONS.slice(0, 2);
    render(<TransactionsTable transactions={rows} />);

    const table = screen.getByTestId("transactions-table");
    expect(within(table).getAllByRole("row")).toHaveLength(rows.length + 1);

    for (const tx of rows) {
      const sign = tx.type === "INCOME" ? "+" : "-";
      expect(
        within(table).getByText(`${sign}${formatCurrency(tx.amount)}`),
      ).toBeInTheDocument();
      expect(within(table).getByText(tx.category.name)).toBeInTheDocument();
      expect(
        within(table).getByText(tx.type === "INCOME" ? "Income" : "Expense"),
      ).toBeInTheDocument();
    }
  });

  it("renders edit and delete actions per row", () => {
    render(<TransactionsTable transactions={MOCK_TRANSACTIONS.slice(0, 2)} />);

    expect(screen.getAllByRole("button", { name: /edit/i })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(2);
  });

  it("forces horizontal scroll on narrow screens instead of squeezing columns", () => {
    const { container } = render(
      <TransactionsTable transactions={MOCK_TRANSACTIONS.slice(0, 2)} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("overflow-x-auto");

    const table = screen.getByTestId("transactions-table");
    expect(table.className).toContain("min-w-");
  });
});
