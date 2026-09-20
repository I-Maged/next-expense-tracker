import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_STORAGE_KEY } from "@/lib/theme";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function mockMatchMedia(prefersDark: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: prefersDark && query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
    vi.restoreAllMocks();
  });

  it("renders a theme switch button", () => {
    mockMatchMedia(false);
    render(<ThemeToggle />);

    const button = screen.getByRole("button", {
      name: /theme|light mode|dark mode/i,
    });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("h-11");
    expect(button.className).toContain("w-11");
  });

  it("starts light and switches to dark on click, persisting the choice", () => {
    mockMatchMedia(false);
    render(<ThemeToggle />);

    const button = screen.getByRole("button", {
      name: /switch to dark mode/i,
    });
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("respects a stored dark theme on mount", () => {
    mockMatchMedia(false);
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });

  it("falls back to the OS preference when nothing is stored", () => {
    mockMatchMedia(true);
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
