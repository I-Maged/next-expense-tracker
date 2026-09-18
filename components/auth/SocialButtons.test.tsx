import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SocialButtons } from "@/components/auth/SocialButtons";
import { authClient } from "@/lib/auth-client";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
}));

const signInSocial = vi.mocked(authClient.signIn.social);

describe("SocialButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Google and GitHub buttons", () => {
    render(<SocialButtons />);

    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with github/i }),
    ).toBeInTheDocument();
  });

  it("starts Google sign-in with dashboard callback", async () => {
    signInSocial.mockResolvedValue({ data: null, error: null });
    render(<SocialButtons />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(signInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "/dashboard",
      });
    });
  });

  it("starts GitHub sign-in with dashboard callback", async () => {
    signInSocial.mockResolvedValue({ data: null, error: null });
    render(<SocialButtons />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with github/i }),
    );

    await waitFor(() => {
      expect(signInSocial).toHaveBeenCalledWith({
        provider: "github",
        callbackURL: "/dashboard",
      });
    });
  });

  it("shows a human-readable error when social sign-in fails", async () => {
    signInSocial.mockResolvedValue({
      data: null,
      error: { message: "oauth boom", status: 500, statusText: "ERR" },
    });
    render(<SocialButtons />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    expect(
      await screen.findByText(/could not continue with google/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/oauth boom/i)).not.toBeInTheDocument();
  });
});
