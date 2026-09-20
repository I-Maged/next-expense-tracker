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
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
      social: vi.fn(),
    },
  },
}));

import LoginPage from "@/app/(auth)/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders sign-in heading, form, social buttons, and signup link", async () => {
    mockGetSession.mockResolvedValue(null);
    render(await LoginPage());

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create an account/i }),
    ).toHaveAttribute("href", "/signup");
  });

  it("redirects logged-in users to /dashboard", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    await expect(LoginPage()).rejects.toThrow("REDIRECT:/dashboard");
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
