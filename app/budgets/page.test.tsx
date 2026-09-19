import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSession, redirectMock } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  redirectMock: vi.fn(),
}));

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

import BudgetsPage from "@/app/budgets/page";

describe("BudgetsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    await expect(BudgetsPage()).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders header, actions, and cards when authenticated", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    render(await BudgetsPage());

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
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });
});
