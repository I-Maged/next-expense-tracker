import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  redirectMock,
  mockSeed,
  mockAggregate,
  mockFindBudgets,
  mockGroupBy,
  mockFindRecent,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  redirectMock: vi.fn(),
  mockSeed: vi.fn(),
  mockAggregate: vi.fn(),
  mockFindBudgets: vi.fn(),
  mockGroupBy: vi.fn(),
  mockFindRecent: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(""),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));
vi.mock("@/actions/categories", () => ({ seedDefaultCategories: mockSeed }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: { aggregate: mockAggregate, groupBy: mockGroupBy, findMany: mockFindRecent },
    budget: { findMany: mockFindBudgets },
  },
}));

import DashboardPage from "@/app/dashboard/page";

const CATEGORY = { id: "cat_food", name: "Food", color: "#EF4444" };

function mockAuthenticatedReads(): void {
  mockAggregate
    .mockResolvedValueOnce({ _sum: { amount: { toNumber: () => 2845.5 } } })
    .mockResolvedValueOnce({ _sum: { amount: { toNumber: () => 5200 } } });
  mockFindBudgets.mockResolvedValue([
    {
      id: "bud_1",
      categoryId: "cat_food",
      category: CATEGORY,
      month: "2026-09",
      limit: { toNumber: () => 500 },
    },
    {
      id: "bud_2",
      categoryId: "cat_shop",
      category: { id: "cat_shop", name: "Shopping", color: "#EC4899" },
      month: "2026-09",
      limit: { toNumber: () => 300 },
    },
  ]);
  mockGroupBy.mockResolvedValue([
    { categoryId: "cat_food", _sum: { amount: { toNumber: () => 320 } } },
    { categoryId: "cat_shop", _sum: { amount: { toNumber: () => 365.5 } } },
  ]);
  mockFindRecent.mockResolvedValue([
    {
      id: "tx_1",
      date: new Date("2026-09-14T00:00:00.000Z"),
      note: "Monthly salary",
      type: "INCOME",
      amount: { toNumber: () => 5200 },
      categoryId: "cat_other",
      category: { id: "cat_other", name: "Other", color: "#6A7282" },
    },
    {
      id: "tx_2",
      date: new Date("2026-09-13T00:00:00.000Z"),
      note: "Weekly groceries",
      type: "EXPENSE",
      amount: { toNumber: () => 86.4 },
      categoryId: "cat_food",
      category: CATEGORY,
    },
  ]);
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders live stats and recent rows when authenticated", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockAuthenticatedReads();
    render(await DashboardPage());

    expect(screen.getByText("$2,845.50")).toBeInTheDocument();
    expect(screen.getByText("$5,200.00")).toBeInTheDocument();
    expect(screen.getByText("$2,354.50")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Weekly groceries")).toBeInTheDocument();
    expect(screen.getByText("+$5,200.00")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(mockSeed).toHaveBeenCalledOnce();
  });

  it("scopes prisma reads by user with month sums and latest five", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockAuthenticatedReads();
    render(await DashboardPage());

    expect(mockAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user_1", type: "EXPENSE" }),
      }),
    );
    expect(mockAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user_1", type: "INCOME" }),
      }),
    );
    expect(mockFindBudgets).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user_1", month: expect.stringMatching(/^\d{4}-(0[1-9]|1[0-2])$/) },
      }),
    );
    expect(mockFindRecent).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user_1" },
        orderBy: { date: "desc" },
        take: 5,
      }),
    );
  });

  it("shows zero stats and the recent empty state without data", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockAggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });
    mockFindBudgets.mockResolvedValue([]);
    mockGroupBy.mockResolvedValue([]);
    mockFindRecent.mockResolvedValue([]);
    render(await DashboardPage());

    expect(screen.getAllByText("$0.00")).toHaveLength(3);
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });
});
