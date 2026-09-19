export type BudgetCategoryView = {
  id: string;
  name: string;
  color: string;
};

export type BudgetView = {
  id: string;
  categoryId: string;
  category: BudgetCategoryView;
  month: string;
  limit: number;
  spent: number;
};
