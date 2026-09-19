import Link from "next/link";

import { formatCurrency } from "@/lib/utils";
import type { BudgetActualView } from "@/components/dashboard/types";

type Props = {
  rows: Array<BudgetActualView>;
  month: string;
};

export function BudgetVsActual({ rows, month }: Props) {
  return (
    <div data-testid="budget-vs-actual" className="card flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold leading-6 text-text-primary">
          Budget vs Actual
        </h2>
        <p className="text-xs leading-4 text-text-muted">
          Monthly limits · {month}
        </p>
      </div>
      {rows.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm font-medium leading-5 text-text-muted">
            No budgets this month — set a budget to track progress.
          </p>
          <Link
            href="/budgets"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            Set a budget
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((row) => {
            const usage = row.spent / row.limit;
            const fill =
              usage < 0.8
                ? "bg-success"
                : usage <= 1
                  ? "bg-warning"
                  : "bg-error";
            const percent = Math.min(100, Math.round(usage * 100));
            const over = row.spent > row.limit;
            return (
              <li
                key={row.id}
                data-testid="budget-vs-actual-row"
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: row.category.color }}
                    />
                    <span className="truncate text-sm font-medium leading-5 text-text-primary">
                      {row.category.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-text-secondary">
                    {formatCurrency(row.spent)} / {formatCurrency(row.limit)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border-light">
                  <div
                    role="progressbar"
                    aria-label={`${row.category.name} budget progress`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    className={`h-full rounded-full ${fill}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {over ? (
                  <p className="text-xs font-medium leading-4 text-error">
                    +{formatCurrency(row.spent - row.limit)} over
                  </p>
                ) : (
                  <p className="text-xs leading-4 text-text-secondary">
                    {formatCurrency(row.limit - row.spent)} remaining
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
