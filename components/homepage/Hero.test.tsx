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

  it("shows no signup or sign-in CTAs when authenticated", () => {
    render(<Hero authenticated />);

    expect(screen.queryByRole("link", { name: "Get Started" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull();
    expect(
      screen.getByRole("link", { name: /go to dashboard/i }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("renders a live summary for authenticated users with data", () => {
    render(
      <Hero
        authenticated
        summary={{
          spent: 320.5,
          income: 5200,
          top: [
            { name: "Food", total: 180.25, color: "#EF4444" },
            { name: "Rent", total: 120, color: "#7C5CFC" },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /go to dashboard/i }),
    ).toHaveAttribute("href", "/dashboard");
    expect(
      screen.getByRole("link", { name: /view transactions/i }),
    ).toHaveAttribute("href", "/transactions");
    expect(screen.queryByRole("link", { name: "Get Started" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Go to Dashboard — see your overview" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(screen.getByTestId("app-preview")).toBeInTheDocument();
    expect(screen.getByText("$320.50")).toBeInTheDocument();
    expect(screen.getByText("+$5,200.00 income")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.queryByText("$1,284.50")).toBeNull();
  });

  it("renders an empty state for authenticated users without data", () => {
    render(<Hero authenticated summary={{ spent: 0, income: 0, top: [] }} />);

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByText(/no expenses this month yet/i)).toBeInTheDocument();
  });
});
