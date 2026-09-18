import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/LoginForm";
import { authClient } from "@/lib/auth-client";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const signInEmail = vi.mocked(authClient.signIn.email);

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email, password, and submit", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("rejects an invalid email without calling sign-in", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("requires a password without calling sign-in", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/password is required/i),
    ).toBeInTheDocument();
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("signs in and redirects to dashboard on valid submit", async () => {
    signInEmail.mockResolvedValue({
      data: { url: "/dashboard", user: null, redirect: true, token: "t" },
      error: null,
    });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInEmail).toHaveBeenCalledWith({
        email: "ana@example.com",
        password: "secret123",
      });
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows a human-readable error when sign-in fails", async () => {
    signInEmail.mockResolvedValue({
      data: null,
      error: { message: "invalid credentials", status: 401, statusText: "ERR" },
    });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/could not sign you in/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
