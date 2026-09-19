import Link from "next/link";

import { formatCurrency } from "@/lib/utils";
import type { RecentTransactionView } from "@/components/dashboard/types";

type Props = {
  transactions: Array<RecentTransactionView>;
};

export function RecentTransactions({ transactions }: Props) {
  return (
    <div
      data-testid="recent-transactions"
      className="card flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold leading-6 text-text-primary">
          Recent Transactions
        </h2>
        <Link
          href="/transactions"
          className="text-sm font-medium leading-5 text-accent hover:underline"
        >
          View all
        </Link>
      </div>
      {transactions.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm font-medium leading-5 text-text-muted">
            No transactions yet — add your first transaction to see it here.
          </p>
          <Link
            href="/transactions"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            Go to transactions
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col">
          {transactions.map((transaction) => {
            const sign = transaction.type === "INCOME" ? "+" : "-";
            return (
              <li
                key={transaction.id}
                data-testid="recent-transaction-row"
                className="flex items-center justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium leading-5 text-text-primary">
                      {transaction.note === "" ? "Untitled" : transaction.note}
                    </span>
                    <span className="text-xs leading-4 text-text-muted tabular-nums">
                      {transaction.date}
                    </span>
                  </div>
                  <span className="hidden shrink-0 items-center gap-2 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary sm:inline-flex">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: transaction.category.color,
                      }}
                    />
                    {transaction.category.name}
                  </span>
                </div>
                <span
                  className={
                    transaction.type === "INCOME"
                      ? "shrink-0 text-sm font-medium whitespace-nowrap text-success tabular-nums"
                      : "shrink-0 text-sm font-medium whitespace-nowrap text-text-primary tabular-nums"
                  }
                >
                  {`${sign}${formatCurrency(transaction.amount)}`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
