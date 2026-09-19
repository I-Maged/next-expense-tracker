import { monthKey, shiftMonth } from "@/lib/utils";

export type MockDashboardCategory = {
  id: string;
  name: string;
  color: string;
};

export type MockCategorySpending = {
  name: string;
  total: number;
  color: string;
};

export type MockMonthlyTrend = {
  month: string;
  income: number;
  expense: number;
};

export type MockBudgetActual = {
  id: string;
  categoryId: string;
  category: MockDashboardCategory;
  limit: number;
  spent: number;
};

export type MockRecentTransaction = {
  id: string;
  date: string;
  note: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  categoryId: string;
  category: MockDashboardCategory;
};

export const MOCK_DASHBOARD_MONTH: string = monthKey(new Date());

export const MOCK_DASHBOARD_STATS = {
  spent: 2845.5,
  income: 5200,
  balance: 2354.5,
  overBudgetCount: 2,
};

const FOOD: MockDashboardCategory = {
  id: "mock-cat-food",
  name: "Food",
  color: "#EF4444",
};

const TRANSPORT: MockDashboardCategory = {
  id: "mock-cat-transport",
  name: "Transport",
  color: "#2B7FFF",
};

const RENT: MockDashboardCategory = {
  id: "mock-cat-rent",
  name: "Rent",
  color: "#7C5CFC",
};

const UTILITIES: MockDashboardCategory = {
  id: "mock-cat-utilities",
  name: "Utilities",
  color: "#00BC7D",
};

const SHOPPING: MockDashboardCategory = {
  id: "mock-cat-shopping",
  name: "Shopping",
  color: "#EC4899",
};

const HEALTH: MockDashboardCategory = {
  id: "mock-cat-health",
  name: "Health",
  color: "#10B981",
};

const ENTERTAINMENT: MockDashboardCategory = {
  id: "mock-cat-entertainment",
  name: "Entertainment",
  color: "#F59E0B",
};

const OTHER: MockDashboardCategory = {
  id: "mock-cat-other",
  name: "Other",
  color: "#6A7282",
};

export const MOCK_CATEGORY_SPENDING: Array<MockCategorySpending> = [
  { name: FOOD.name, total: 820, color: FOOD.color },
  { name: RENT.name, total: 1500, color: RENT.color },
  { name: TRANSPORT.name, total: 210, color: TRANSPORT.color },
  { name: SHOPPING.name, total: 365.5, color: SHOPPING.color },
  { name: ENTERTAINMENT.name, total: 180, color: ENTERTAINMENT.color },
  { name: HEALTH.name, total: 95, color: HEALTH.color },
  { name: UTILITIES.name, total: 140, color: UTILITIES.color },
  { name: OTHER.name, total: 60, color: OTHER.color },
];

const TREND_INCOME = [4800, 4950, 5100, 4900, 5050, 5200];
const TREND_EXPENSE = [2450, 2680, 2920, 2540, 3100, 2845.5];

export const MOCK_INCOME_EXPENSE_TREND: Array<MockMonthlyTrend> = TREND_INCOME.map(
  (income, index) => ({
    month: shiftMonth(MOCK_DASHBOARD_MONTH, index - 5),
    income,
    expense: TREND_EXPENSE[index],
  }),
);

export const MOCK_BUDGET_VS_ACTUAL: Array<MockBudgetActual> = [
  {
    id: "mock-ba-01",
    categoryId: FOOD.id,
    category: FOOD,
    limit: 500,
    spent: 320,
  },
  {
    id: "mock-ba-02",
    categoryId: TRANSPORT.id,
    category: TRANSPORT,
    limit: 200,
    spent: 170,
  },
  {
    id: "mock-ba-03",
    categoryId: RENT.id,
    category: RENT,
    limit: 1500,
    spent: 1500,
  },
  {
    id: "mock-ba-04",
    categoryId: SHOPPING.id,
    category: SHOPPING,
    limit: 300,
    spent: 365.5,
  },
  {
    id: "mock-ba-05",
    categoryId: HEALTH.id,
    category: HEALTH,
    limit: 150,
    spent: 0,
  },
];

export const MOCK_RECENT_TRANSACTIONS: Array<MockRecentTransaction> = [
  {
    id: "mock-recent-01",
    date: `${MOCK_DASHBOARD_MONTH}-14`,
    note: "Monthly salary",
    type: "INCOME",
    amount: 5200,
    categoryId: OTHER.id,
    category: OTHER,
  },
  {
    id: "mock-recent-02",
    date: `${MOCK_DASHBOARD_MONTH}-13`,
    note: "Weekly groceries",
    type: "EXPENSE",
    amount: 86.4,
    categoryId: FOOD.id,
    category: FOOD,
  },
  {
    id: "mock-recent-03",
    date: `${MOCK_DASHBOARD_MONTH}-12`,
    note: "Rent payment",
    type: "EXPENSE",
    amount: 1500,
    categoryId: RENT.id,
    category: RENT,
  },
  {
    id: "mock-recent-04",
    date: `${MOCK_DASHBOARD_MONTH}-11`,
    note: "Bus pass refill",
    type: "EXPENSE",
    amount: 45,
    categoryId: TRANSPORT.id,
    category: TRANSPORT,
  },
  {
    id: "mock-recent-05",
    date: `${MOCK_DASHBOARD_MONTH}-10`,
    note: "Movie night",
    type: "EXPENSE",
    amount: 32.5,
    categoryId: ENTERTAINMENT.id,
    category: ENTERTAINMENT,
  },
];
