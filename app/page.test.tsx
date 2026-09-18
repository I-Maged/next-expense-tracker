import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Homepage", () => {
  it("renders navbar, hero, features, how it works, bottom CTA, and footer", () => {
    render(<Home />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /know where your money goes/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /everything you need/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^how it works$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /start tracking today/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByTestId("app-preview")).toBeInTheDocument();
  });

  it("routes Get Started to signup and Sign In to login", () => {
    render(<Home />);

    const ctas = screen.getAllByRole("link", { name: "Get Started" });
    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/signup");
    }
    const signIns = screen.getAllByRole("link", { name: "Sign In" });
    expect(signIns.length).toBeGreaterThan(0);
    for (const link of signIns) {
      expect(link).toHaveAttribute("href", "/login");
    }
  });
});
