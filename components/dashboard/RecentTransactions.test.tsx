import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

const TXS = [
  {
    id: "tx_1",
    date: "2026-09-14",
    note: "Monthly salary",
    type: "INCOME" as const,
    amount: 5200,
    categoryId: "cat_other",
    category: { id: "cat_other", name: "Other", color: "#6A7282" },
  },
  {
    id: "tx_2",
    date: "2026-09-13",
    note: "Weekly groceries",
    type: "EXPENSE" as const,
    amount: 86.4,
    categoryId: "cat_food",
    category: { id: "cat_food", name: "Food", color: "#EF4444" },
  },
];

describe("RecentTransactions", () => {
  it("renders rows with signed amounts and a view-all link", () => {
    render(<RecentTransactions transactions={TXS} />);

    expect(
      screen.getByRole("heading", { name: "Recent Transactions" }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("recent-transaction-row")).toHaveLength(2);
    expect(screen.getByText("+$5,200.00")).toBeInTheDocument();
    expect(screen.getByText("-$86.40")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
      "href",
      "/transactions",
    );
  });

  it("renders the empty state when there are no transactions", () => {
    render(<RecentTransactions transactions={[]} />);

    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
    expect(
      screen.queryByTestId("recent-transaction-row"),
    ).not.toBeInTheDocument();
  });
});
