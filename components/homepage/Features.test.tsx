import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Features } from "@/components/homepage/Features";

describe("Features", () => {
  it("renders the three value props", () => {
    render(<Features />);

    expect(
      screen.getByRole("heading", { name: /everything you need/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Fast entry" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Budgets" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Reports" }),
    ).toBeInTheDocument();
  });
});
