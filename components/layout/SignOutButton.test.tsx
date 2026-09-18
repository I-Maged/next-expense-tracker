import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "@/components/layout/SignOutButton";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const signOut = vi.mocked(authClient.signOut);

describe("SignOutButton", () => {
  it("signs out and returns home", async () => {
    signOut.mockResolvedValue({ data: { success: true } });
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });
});
