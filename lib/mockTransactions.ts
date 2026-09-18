export type MockCategory = {
  id: string;
  name: string;
  color: string;
};

export type MockTransactionType = "INCOME" | "EXPENSE";

export type MockTransaction = {
  id: string;
  date: string;
  note: string;
  type: MockTransactionType;
  amount: number;
  categoryId: string;
  category: MockCategory;
};

export const MOCK_CATEGORIES: Array<MockCategory> = [
  { id: "mock-cat-food", name: "Food", color: "#EF4444" },
  { id: "mock-cat-transport", name: "Transport", color: "#2B7FFF" },
  { id: "mock-cat-rent", name: "Rent", color: "#7C5CFC" },
  { id: "mock-cat-utilities", name: "Utilities", color: "#00BC7D" },
  { id: "mock-cat-shopping", name: "Shopping", color: "#EC4899" },
  { id: "mock-cat-health", name: "Health", color: "#10B981" },
  { id: "mock-cat-entertainment", name: "Entertainment", color: "#F59E0B" },
  { id: "mock-cat-other", name: "Other", color: "#6A7282" },
];

const NOTE_POOL = [
  "Coffee with friends",
  "Monthly salary",
  "Weekly groceries",
  "Rent payment",
  "Bus pass refill",
  "Electric bill",
  "New running shoes",
  "Gym membership",
  "Movie night",
  "Bookstore haul",
  "Freelance payout",
  "Lunch downtown",
  "Pharmacy pickup",
  "Concert ticket",
  "Taxi ride",
  "Water bill",
] as const;

const MONTH_POOL = ["2026-07", "2026-08", "2026-09"] as const;

function buildMockTransactions(): Array<MockTransaction> {
  return Array.from({ length: 48 }, (_, index) => {
    const category = MOCK_CATEGORIES[index % MOCK_CATEGORIES.length];
    const month = MONTH_POOL[index % MONTH_POOL.length];
    const day = String(((index * 7) % 27) + 1).padStart(2, "0");
    const type: MockTransactionType = index % 4 === 1 ? "INCOME" : "EXPENSE";
    const amount = Number((((index * 137) % 90000) / 100 + 5).toFixed(2));
    const note = NOTE_POOL[index % NOTE_POOL.length];
    return {
      id: `mock-tx-${String(index + 1).padStart(2, "0")}`,
      date: `${month}-${day}`,
      note,
      type,
      amount,
      categoryId: category.id,
      category,
    };
  });
}

export const MOCK_TRANSACTIONS: Array<MockTransaction> =
  buildMockTransactions();
