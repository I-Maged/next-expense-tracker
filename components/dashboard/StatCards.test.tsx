import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatCards } from "@/components/dashboard/StatCards";

describe("StatCards", () => {
  it("renders all four stats with formatted values", () => {
    render(
      <StatCards
        stats={{ spent: 2845.5, income: 5200, balance: 2354.5, overBudgetCount: 2 }}
      />,
    );

    expect(screen.getByTestId("stat-cards")).toBeInTheDocument();
    expect(screen.getByText("Spent This Month")).toBeInTheDocument();
    expect(screen.getByText("Income This Month")).toBeInTheDocument();
    expect(screen.getByText("Balance")).toBeInTheDocument();
    expect(screen.getByText("Over Budget")).toBeInTheDocument();
    expect(screen.getByText("$2,845.50")).toBeInTheDocument();
    expect(screen.getByText("$5,200.00")).toBeInTheDocument();
    expect(screen.getByText("$2,354.50")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders zero values without crashing", () => {
    render(
      <StatCards stats={{ spent: 0, income: 0, balance: 0, overBudgetCount: 0 }} />,
    );

    expect(screen.getAllByText("$0.00")).toHaveLength(3);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
