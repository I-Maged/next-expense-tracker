import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "@/components/auth/SignupForm";
import { authClient } from "@/lib/auth-client";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const signUpEmail = vi.mocked(authClient.signUp.email);

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name, email, password, and submit", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("rejects a short name without calling sign-up", async () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/name must be at least 2 characters/i),
    ).toBeInTheDocument();
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("rejects a short password without calling sign-up", async () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("signs up and redirects to dashboard on valid submit", async () => {
    signUpEmail.mockResolvedValue({
      data: { user: null, token: "t", url: "/dashboard", redirect: true },
      error: null,
    });
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signUpEmail).toHaveBeenCalledWith({
        name: "Ana",
        email: "ana@example.com",
        password: "secret123",
      });
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows a human-readable error when sign-up fails", async () => {
    signUpEmail.mockResolvedValue({
      data: null,
      error: { message: "email taken", status: 422, statusText: "ERR" },
    });
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/could not create your account/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/email taken/i)).not.toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
