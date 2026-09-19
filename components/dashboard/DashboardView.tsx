import { BudgetVsActual } from "@/components/dashboard/BudgetVsActual";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StatCards } from "@/components/dashboard/StatCards";
import { TrendChart } from "@/components/dashboard/TrendChart";
import type {
  BudgetActualView,
  CategorySpendingView,
  DashboardStats,
  MonthlyTrendView,
  RecentTransactionView,
} from "@/components/dashboard/types";

type Props = {
  stats: DashboardStats;
  categorySpending: Array<CategorySpendingView>;
  trend: Array<MonthlyTrendView>;
  budgetRows: Array<BudgetActualView>;
  recent: Array<RecentTransactionView>;
  month: string;
};

export function DashboardView({
  stats,
  categorySpending,
  trend,
  budgetRows,
  recent,
  month,
}: Props) {
  return (
    <div data-testid="dashboard-view" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-8 text-text-primary">
          Dashboard
        </h1>
        <p className="text-sm font-medium leading-5 text-text-secondary">
          Overview of your spending this month.
        </p>
      </div>
      <StatCards stats={stats} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CategoryChart data={categorySpending} month={month} />
        <TrendChart data={trend} />
      </div>
      <BudgetVsActual rows={budgetRows} month={month} />
      <RecentTransactions transactions={recent} />
    </div>
  );
}
