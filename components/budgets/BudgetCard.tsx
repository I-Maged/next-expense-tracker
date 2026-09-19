import { formatCurrency } from "@/lib/utils";
import type { MockBudget } from "@/lib/mockBudgets";

type Props = {
  budget: MockBudget;
};

export function BudgetCard({ budget }: Props) {
  const usage = budget.spent / budget.limit;
  const fill =
    usage < 0.8 ? "bg-success" : usage <= 1 ? "bg-warning" : "bg-error";
  const percent = Math.min(100, Math.round(usage * 100));
  const over = budget.spent > budget.limit;

  return (
    <div data-testid="budget-card" className="card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: budget.category.color }}
        />
        <span className="truncate text-sm font-medium leading-5 text-text-primary">
          {budget.category.name}
        </span>
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
