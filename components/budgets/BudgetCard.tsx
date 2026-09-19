import { Pencil, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { BudgetView } from "@/components/budgets/types";

type Props = {
  budget: BudgetView;
  onEdit?: (budget: BudgetView) => void;
  onDelete?: (budget: BudgetView) => void;
};

export function BudgetCard({ budget, onEdit, onDelete }: Props) {
  const usage = budget.spent / budget.limit;
  const fill =
    usage < 0.8 ? "bg-success" : usage <= 1 ? "bg-warning" : "bg-error";
  const percent = Math.min(100, Math.round(usage * 100));
  const over = budget.spent > budget.limit;

  return (
    <div data-testid="budget-card" className="card flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: budget.category.color }}
          />
          <span className="truncate text-sm font-medium leading-5 text-text-primary">
            {budget.category.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Edit budget ${budget.id}`}
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
            onClick={() => {
              onEdit?.(budget);
            }}
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Delete budget ${budget.id}`}
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-error"
            onClick={() => {
              onDelete?.(budget);
            }}
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-sm tabular-nums text-text-secondary">
        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
      </p>
      <div className="h-2 rounded-full bg-border-light">
        <div
          role="progressbar"
          aria-label={`${budget.category.name} budget progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className={`h-full rounded-full ${fill}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {over ? (
        <p className="text-xs font-medium leading-4 text-error">
          +{formatCurrency(budget.spent - budget.limit)} over
        </p>
      ) : (
        <p className="text-xs leading-4 text-text-secondary">
          {formatCurrency(budget.limit - budget.spent)} remaining
        </p>
      )}
    </div>
  );
}
