import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "@/components/homepage/Hero";

describe("Hero", () => {
  it("renders headline, subheadline, CTAs, and app preview", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", { name: /know where your money goes/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/log income and expenses in seconds/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByTestId("app-preview")).toBeInTheDocument();
    expect(screen.getByText("Spent This Month")).toBeInTheDocument();
  });
});
