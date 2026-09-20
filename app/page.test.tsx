import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  mockSeed,
  mockAggregate,
  mockGroupBy,
  mockFindCategories,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSeed: vi.fn(),
  mockAggregate: vi.fn(),
  mockGroupBy: vi.fn(),
  mockFindCategories: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("@/actions/categories", () => ({
  seedDefaultCategories: mockSeed,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: { aggregate: mockAggregate, groupBy: mockGroupBy },
    category: { findMany: mockFindCategories },
  },
}));

import Home from "@/app/page";

function mockAuthenticatedReads(): void {
  mockSeed.mockResolvedValue({ success: true });
  mockAggregate
    .mockResolvedValueOnce({ _sum: { amount: { toNumber: () => 320.5 } } })
    .mockResolvedValueOnce({ _sum: { amount: { toNumber: () => 5200 } } });
  mockGroupBy.mockResolvedValue([
    { categoryId: "cat_food", _sum: { amount: { toNumber: () => 180.25 } } },
    { categoryId: "cat_rent", _sum: { amount: { toNumber: () => 120 } } },
  ]);
  mockFindCategories.mockResolvedValue([
    { id: "cat_food", name: "Food", color: "#EF4444" },
    { id: "cat_rent", name: "Rent", color: "#7C5CFC" },
  ]);
}

describe("Homepage", () => {
  it("renders sections with logged-out CTAs", async () => {
    mockGetSession.mockResolvedValue(null);
    render(await Home());

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /know where your money goes/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("app-preview")).toBeInTheDocument();

    for (const cta of screen.getAllByRole("link", { name: "Get Started" })) {
      expect(cta).toHaveAttribute("href", "/signup");
    }
    for (const link of screen.getAllByRole("link", { name: "Sign In" })) {
      expect(link).toHaveAttribute("href", "/login");
    }
  });

  it("renders a tailored homepage with live numbers when authenticated", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockAuthenticatedReads();
    render(await Home());

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    const dashboardCtas = screen.getAllByRole("link", {
      name: /go to dashboard/i,
    });
    expect(dashboardCtas.length).toBeGreaterThanOrEqual(2);
    for (const cta of dashboardCtas) {
      expect(cta).toHaveAttribute("href", "/dashboard");
    }
    expect(screen.queryByRole("link", { name: "Get Started" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull();
    expect(screen.getByText("$320.50")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(mockSeed).toHaveBeenCalledOnce();
    expect(mockAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user_1", type: "EXPENSE" }),
      }),
    );
  });

  it("hides pitch sections and account links when authenticated", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockAuthenticatedReads();
    render(await Home());

    expect(screen.queryByText(/start tracking today/i)).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Account" })).toBeNull();
  });

  it("shows an empty summary when there is no data", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockSeed.mockResolvedValue({ success: true });
    mockAggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });
    mockGroupBy.mockResolvedValue([]);
    mockFindCategories.mockResolvedValue([]);
    render(await Home());

    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByText(/no expenses this month yet/i)).toBeInTheDocument();
  });
});
