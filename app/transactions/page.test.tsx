import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  redirectMock,
  pushMock,
  mockSeed,
  mockCount,
  mockFindMany,
  mockFindCategories,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  redirectMock: vi.fn(),
  pushMock: vi.fn(),
  mockSeed: vi.fn(),
  mockCount: vi.fn(),
  mockFindMany: vi.fn(),
  mockFindCategories: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
  usePathname: () => "/transactions",
  useSearchParams: () => new URLSearchParams(""),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));
vi.mock("@/actions/categories", () => ({ seedDefaultCategories: mockSeed }));
vi.mock("@/actions/transactions", () => ({
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: { count: mockCount, findMany: mockFindMany },
    category: { findMany: mockFindCategories },
  },
}));

import TransactionsPage from "@/app/transactions/page";

const CATEGORY = { id: "cat_food", name: "Food", color: "#EF4444" };

function mockAuthenticatedRows(): void {
  mockCount.mockResolvedValue(2);
  mockFindMany.mockResolvedValue([
    {
      id: "tx_1",
      date: new Date("2026-09-10T00:00:00Z"),
      note: "Groceries",
      type: "EXPENSE",
      amount: { toNumber: () => 42.5 },
      categoryId: "cat_food",
      category: CATEGORY,
    },
    {
      id: "tx_2",
      date: new Date("2026-09-09T00:00:00Z"),
      note: "Salary",
      type: "INCOME",
      amount: { toNumber: () => 1200 },
      categoryId: "cat_food",
      category: CATEGORY,
    },
  ]);
  mockFindCategories.mockResolvedValue([CATEGORY]);
}

describe("TransactionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    await expect(
      TransactionsPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders header, filters, table, and pagination when authenticated", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockAuthenticatedRows();
    render(
      await TransactionsPage({
        searchParams: Promise.resolve({ month: "2026-09" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Transactions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add transaction/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
    expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 to 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(mockSeed).toHaveBeenCalledOnce();
  });

  it("scopes prisma queries by user and month with pagination", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);
    mockFindCategories.mockResolvedValue([]);
    render(
      await TransactionsPage({
        searchParams: Promise.resolve({
          month: "2026-09",
          search: "coffee",
          page: "2",
        }),
      }),
    );

    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user_1",
          note: { contains: "coffee", mode: "insensitive" },
        }),
      }),
    );
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, skip: 20 }),
    );
  });
});
