import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrendChart } from "@/components/dashboard/TrendChart";

const DATA = [
  { month: "2026-04", income: 4800, expense: 2450 },
  { month: "2026-05", income: 4950, expense: 2680 },
];

describe("TrendChart", () => {
  it("renders the heading, legend, and chart when data exists", () => {
    render(<TrendChart data={DATA} />);

    expect(
      screen.getByRole("heading", { name: "Income vs Expense" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.queryByText(/no data yet/i)).not.toBeInTheDocument();
  });

  it("renders the empty state without lines when data is empty", () => {
    render(<TrendChart data={[]} />);

    expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("trend-chart-lines")).not.toBeInTheDocument();
  });
});
