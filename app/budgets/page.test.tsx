import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  redirectMock,
  pushMock,
  mockSeed,
  mockFindCategories,
  mockFindBudgets,
  mockGroupBy,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  redirectMock: vi.fn(),
  pushMock: vi.fn(),
  mockSeed: vi.fn(),
  mockFindCategories: vi.fn(),
  mockFindBudgets: vi.fn(),
  mockGroupBy: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
  usePathname: () => "/budgets",
  useSearchParams: () => new URLSearchParams(""),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));
vi.mock("@/actions/categories", () => ({ seedDefaultCategories: mockSeed }));
vi.mock("@/actions/budgets", () => ({
  upsertBudget: vi.fn(),
  deleteBudget: vi.fn(),
  copyLastMonth: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: { findMany: mockFindCategories },
    budget: { findMany: mockFindBudgets },
    transaction: { groupBy: mockGroupBy },
  },
}));

import BudgetsPage from "@/app/budgets/page";

const CATEGORY = { id: "cat_food", name: "Food", color: "#EF4444" };

function mockAuthenticatedRows(): void {
  mockFindCategories.mockResolvedValue([CATEGORY]);
  mockFindBudgets.mockResolvedValue([
    {
      id: "bud_1",
      categoryId: "cat_food",
      category: CATEGORY,
      month: "2026-09",
      limit: { toNumber: () => 500 },
    },
  ]);
  mockGroupBy.mockResolvedValue([
    { categoryId: "cat_food", _sum: { amount: { toNumber: () => 320 } } },
  ]);
}

describe("BudgetsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    await expect(
      BudgetsPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders header, actions, and live cards when authenticated", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockAuthenticatedRows();
    render(
      await BudgetsPage({
        searchParams: Promise.resolve({ month: "2026-09" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Budgets" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy Last Month" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Set Budget" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("budget-grid")).toBeInTheDocument();
    expect(screen.getByText("$320.00 / $500.00")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(mockSeed).toHaveBeenCalledOnce();
  });

  it("scopes prisma reads by user and month with live spent", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockFindCategories.mockResolvedValue([]);
    mockFindBudgets.mockResolvedValue([]);
    mockGroupBy.mockResolvedValue([]);
    render(
      await BudgetsPage({
        searchParams: Promise.resolve({ month: "2026-09" }),
      }),
    );

    expect(mockFindBudgets).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user_1", month: "2026-09" },
      }),
    );
    expect(mockGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ["categoryId"],
        where: expect.objectContaining({
          userId: "user_1",
          type: "EXPENSE",
        }),
      }),
    );
  });

  it("shows the empty state when the month has no budgets", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockFindCategories.mockResolvedValue([CATEGORY]);
    mockFindBudgets.mockResolvedValue([]);
    mockGroupBy.mockResolvedValue([]);
    render(
      await BudgetsPage({
        searchParams: Promise.resolve({ month: "2026-09" }),
      }),
    );

    expect(screen.getByText(/no budgets this month/i)).toBeInTheDocument();
  });
});
