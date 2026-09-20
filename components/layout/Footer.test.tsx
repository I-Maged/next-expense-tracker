import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders brand and product links", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByText("ExpenseTracker")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("hides the account group when authenticated", () => {
    render(<Footer authenticated />);

    expect(screen.queryByRole("navigation", { name: "Account" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Get Started" })).toBeNull();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});
