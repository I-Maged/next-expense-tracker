import { Pencil, Trash2 } from "lucide-react";

import type { MockTransaction } from "@/lib/mockTransactions";
import { formatCurrency } from "@/lib/utils";

type Props = {
  transactions: Array<MockTransaction>;
};

const HEADERS = [
  "Date",
  "Note",
  "Category",
  "Type",
  "Amount",
  "Actions",
] as const;

export function TransactionsTable({ transactions }: Props) {
  return (
    <div className="card overflow-x-auto p-0">
      <table
        data-testid="transactions-table"
        className="w-full border-collapse text-left"
      >
        <thead>
          <tr className="border-b border-border">
            {HEADERS.map((header) => (
              <th
                key={header}
                scope="col"
                className={
                  header === "Amount" || header === "Actions"
                    ? "px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-secondary"
                    : "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary"
                }
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const sign = transaction.type === "INCOME" ? "+" : "-";
            return (
              <tr
                key={transaction.id}
                className="border-b border-border transition-colors last:border-0 hover:bg-surface-secondary"
              >
                <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-text-primary tabular-nums">
                  {transaction.date}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-text-primary">
                  {transaction.note === "" ? (
                    <span className="text-text-muted">—</span>
                  ) : (
                    transaction.note
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: transaction.category.color }}
                    />
                    {transaction.category.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      transaction.type === "INCOME"
                        ? "inline-flex rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium whitespace-nowrap text-success-foreground"
                        : "inline-flex rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary"
                    }
                  >
                    {transaction.type === "INCOME" ? "Income" : "Expense"}
                  </span>
                </td>
                <td
                  className={
                    transaction.type === "INCOME"
                      ? "px-4 py-3 text-right text-sm font-medium whitespace-nowrap text-success tabular-nums"
                      : "px-4 py-3 text-right text-sm font-medium whitespace-nowrap text-text-primary tabular-nums"
                  }
                >
                  {`${sign}${formatCurrency(transaction.amount)}`}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    aria-label={`Edit transaction ${transaction.id}`}
                    className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete transaction ${transaction.id}`}
                    className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-error"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
