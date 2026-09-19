export type DashboardCategoryView = {
  id: string;
  name: string;
  color: string;
};

export type DashboardStats = {
  spent: number;
  income: number;
  balance: number;
  overBudgetCount: number;
};

export type CategorySpendingView = {
  name: string;
  total: number;
  color: string;
};

export type MonthlyTrendView = {
  month: string;
  income: number;
  expense: number;
};

export type BudgetActualView = {
  id: string;
  categoryId: string;
  category: DashboardCategoryView;
  limit: number;
  spent: number;
};

export type RecentTransactionView = {
  id: string;
  date: string;
  note: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  categoryId: string;
  category: DashboardCategoryView;
};
