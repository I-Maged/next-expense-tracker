import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSession, redirectMock, mockSeed, mockFindMany } = vi.hoisted(
  () => ({
    mockGetSession: vi.fn(),
    redirectMock: vi.fn(),
    mockSeed: vi.fn(),
    mockFindMany: vi.fn(),
  }),
);

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));
vi.mock("@/actions/categories", () => ({
  seedDefaultCategories: mockSeed,
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { category: { findMany: mockFindMany } },
}));

import SettingsPage from "@/app/settings/page";

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    await expect(SettingsPage()).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders manager rows when authenticated", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockFindMany.mockResolvedValue([
      {
        id: "cat_food",
        name: "Food",
        color: "#EF4444",
        _count: { transactions: 3 },
      },
      {
        id: "cat_rent",
        name: "Rent",
        color: "#7C5CFC",
        _count: { transactions: 0 },
      },
    ]);
    render(await SettingsPage());

    expect(
      screen.getByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Category" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("category-list")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(mockSeed).toHaveBeenCalledOnce();
  });

  it("scopes the category query by user and orders by name", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockFindMany.mockResolvedValue([]);
    render(await SettingsPage());

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user_1" },
        orderBy: { name: "asc" },
      }),
    );
  });

  it("shows the empty state when the user has no categories", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    mockSeed.mockResolvedValue({ success: true });
    mockFindMany.mockResolvedValue([]);
    render(await SettingsPage());

    expect(screen.getByText(/no categories yet/i)).toBeInTheDocument();
  });
});
