import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { mockGetSession } = vi.hoisted(() => ({ mockGetSession: vi.fn() }));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

import Home from "@/app/page";

describe("Homepage", () => {
  it("renders sections with logged-out CTAs", async () => {
    mockGetSession.mockResolvedValue(null);
    render(await Home());

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /know where your money goes/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("app-preview")).toBeInTheDocument();

    for (const cta of screen.getAllByRole("link", { name: "Get Started" })) {
      expect(cta).toHaveAttribute("href", "/signup");
    }
    for (const link of screen.getAllByRole("link", { name: "Sign In" })) {
      expect(link).toHaveAttribute("href", "/login");
    }
  });

  it("points CTAs at the dashboard when authenticated", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    render(await Home());

    const ctas = screen.getAllByRole("link", { name: "Get Started" });
    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/dashboard");
    }
    for (const link of screen.getAllByRole("link", { name: "Sign In" })) {
      expect(link).toHaveAttribute("href", "/dashboard");
    }
  });
});
