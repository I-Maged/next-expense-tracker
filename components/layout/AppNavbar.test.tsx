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

    const activeLinks = screen.getAllByRole("link", { name: "Transactions" });
    expect(activeLinks).toHaveLength(2);
    for (const active of activeLinks) {
      expect(active).toHaveClass("text-accent");
      expect(active).toHaveAttribute("aria-current", "page");
    }

    for (const label of ["Dashboard", "Budgets", "Settings"]) {
      const links = screen.getAllByRole("link", { name: label });
      for (const link of links) {
        expect(link).not.toHaveClass("text-accent");
        expect(link).not.toHaveAttribute("aria-current");
      }
    }

    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("renders a theme switch button next to sign out", () => {
    render(<AppNavbar activePath="/dashboard" />);

    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("renders a scrollable mobile nav so links stay reachable below md", () => {
    render(<AppNavbar activePath="/budgets" />);

    const mobileNav = screen.getByTestId("app-navbar-mobile-nav");
    expect(mobileNav.className).toContain("md:hidden");
    const scrollRow = mobileNav.firstElementChild as HTMLElement;
    expect(scrollRow.className).toContain("overflow-x-auto");

    const mobileLinks = mobileNav.querySelectorAll("a");
    expect(mobileLinks).toHaveLength(4);

    const active = screen.getAllByRole("link", { name: "Budgets" });
    expect(active.length).toBeGreaterThanOrEqual(2);
    for (const link of active) {
      expect(link).toHaveClass("text-accent");
    }
    const activeMobile = mobileNav.querySelector('a[aria-current="page"]');
    expect(activeMobile).not.toBeNull();
    expect(activeMobile).toHaveTextContent("Budgets");
  });
});
