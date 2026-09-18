import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppNavbar } from "@/components/layout/AppNavbar";

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AppNavbar", () => {
  it("marks the active page and shows the user email", () => {
    render(
      <AppNavbar activePath="/transactions" userEmail="ana@example.com" />,
    );

    const active = screen.getByRole("link", { name: "Transactions" });
    expect(active).toHaveClass("text-accent");
    expect(active).toHaveAttribute("aria-current", "page");

    for (const label of ["Dashboard", "Budgets", "Settings"]) {
      const link = screen.getByRole("link", { name: label });
      expect(link).not.toHaveClass("text-accent");
      expect(link).not.toHaveAttribute("aria-current");
    }

    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign out/i }),
    ).toBeInTheDocument();
  });
});
