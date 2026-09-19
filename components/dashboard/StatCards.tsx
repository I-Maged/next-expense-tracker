import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/components/dashboard/types";

type Props = {
  stats: DashboardStats;
};

export function StatCards({ stats }: Props) {
  const cards = [
    {
      label: "Spent This Month",
      value: formatCurrency(stats.spent),
      valueClass: "text-text-primary",
      sub: "Total expenses this month",
    },
    {
      label: "Income This Month",
      value: formatCurrency(stats.income),
      valueClass: "text-success",
      sub: "Total income this month",
    },
    {
      label: "Balance",
      value: formatCurrency(stats.balance),
      valueClass: "text-text-primary",
      sub: "Income minus spending",
    },
    {
      label: "Over Budget",
      value: String(stats.overBudgetCount),
      valueClass:
        stats.overBudgetCount > 0 ? "text-error" : "text-text-primary",
      sub: "Categories over limit",
    },
  ];

  return (
    <div
      data-testid="stat-cards"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <div key={card.label} className="card flex flex-col gap-1">
          <p className="text-sm font-medium leading-5 text-text-secondary">
            {card.label}
          </p>
          <p
            className={`text-3xl font-semibold tabular-nums ${card.valueClass}`}
          >
            {card.value}
          </p>
          <p className="text-xs leading-4 text-text-muted">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
