import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSession, redirectMock, pushMock } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  redirectMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => ({ push: pushMock }),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

import TransactionsPage from "@/app/transactions/page";

describe("TransactionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    await expect(TransactionsPage()).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders header, filters, table, and pagination when authenticated", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user_1", email: "ana@example.com" },
    });
    render(await TransactionsPage());

    expect(
      screen.getByRole("heading", { name: "Transactions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add transaction/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
    expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 to 20 of 48")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });
});
