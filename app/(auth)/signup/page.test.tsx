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
      social: vi.fn(),
    },
    signUp: {
      email: vi.fn(),
    },
  },
}));

import SignupPage from "@/app/(auth)/signup/page";

describe("SignupPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders sign-up heading, form, social buttons, and login link", async () => {
    mockGetSession.mockResolvedValue(null);
    render(await SignupPage());

    expect(
      screen.getByRole("heading", { name: /create your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("redirects logged-in users to /dashboard", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    await expect(SignupPage()).rejects.toThrow("REDIRECT:/dashboard");
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
