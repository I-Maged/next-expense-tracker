import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Navbar } from "@/components/layout/Navbar";

describe("Navbar", () => {
  it("renders logo, nav links, and Get Started CTA", () => {
    render(<Navbar />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("ExpenseTracker")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Transactions" })).toHaveAttribute(
      "href",
      "/transactions",
    );
    expect(screen.getByRole("link", { name: "Budgets" })).toHaveAttribute(
      "href",
      "/budgets",
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("points the CTA at the dashboard via ctaHref", () => {
    render(<Navbar ctaHref="/dashboard" />);

    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("renders a theme switch button", () => {
    render(<Navbar />);

    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });
});
