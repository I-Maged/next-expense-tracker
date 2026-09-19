export type CategoryView = {
  id: string;
  name: string;
  color: string;
};

export type TransactionTypeView = "INCOME" | "EXPENSE";

export type TransactionView = {
  id: string;
  date: string;
  note: string;
  type: TransactionTypeView;
  amount: number;
  categoryId: string;
  category: CategoryView;
};
