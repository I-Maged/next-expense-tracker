import { monthKey, shiftMonth } from "@/lib/utils";

export type MockBudgetCategory = {
  id: string;
  name: string;
  color: string;
};

export type MockBudget = {
  id: string;
  categoryId: string;
  category: MockBudgetCategory;
  month: string;
  limit: number;
  spent: number;
};

const FOOD: MockBudgetCategory = {
  id: "mock-cat-food",
  name: "Food",
  color: "#EF4444",
};

const TRANSPORT: MockBudgetCategory = {
  id: "mock-cat-transport",
  name: "Transport",
  color: "#2B7FFF",
};

const RENT: MockBudgetCategory = {
  id: "mock-cat-rent",
  name: "Rent",
  color: "#7C5CFC",
};

const SHOPPING: MockBudgetCategory = {
  id: "mock-cat-shopping",
  name: "Shopping",
  color: "#EC4899",
};

const HEALTH: MockBudgetCategory = {
  id: "mock-cat-health",
  name: "Health",
  color: "#10B981",
};

export const MOCK_CURRENT_MONTH: string = monthKey(new Date());
export const MOCK_PREV_MONTH: string = shiftMonth(MOCK_CURRENT_MONTH, -1);

export const MOCK_BUDGETS: Array<MockBudget> = [
  {
    id: "mock-budget-01",
    categoryId: FOOD.id,
    category: FOOD,
    month: MOCK_CURRENT_MONTH,
    limit: 500,
    spent: 320,
  },
  {
    id: "mock-budget-02",
    categoryId: TRANSPORT.id,
    category: TRANSPORT,
    month: MOCK_CURRENT_MONTH,
    limit: 200,
    spent: 170,
  },
  {
    id: "mock-budget-03",
    categoryId: RENT.id,
    category: RENT,
    month: MOCK_CURRENT_MONTH,
    limit: 1500,
    spent: 1500,
  },
  {
    id: "mock-budget-04",
    categoryId: SHOPPING.id,
    category: SHOPPING,
    month: MOCK_CURRENT_MONTH,
    limit: 300,
    spent: 365.5,
  },
  {
    id: "mock-budget-05",
    categoryId: HEALTH.id,
    category: HEALTH,
    month: MOCK_CURRENT_MONTH,
    limit: 150,
    spent: 0,
  },
  {
    id: "mock-budget-06",
    categoryId: FOOD.id,
    category: FOOD,
    month: MOCK_PREV_MONTH,
    limit: 500,
    spent: 450,
  },
  {
    id: "mock-budget-07",
    categoryId: RENT.id,
    category: RENT,
    month: MOCK_PREV_MONTH,
    limit: 1500,
    spent: 1500,
  },
];
