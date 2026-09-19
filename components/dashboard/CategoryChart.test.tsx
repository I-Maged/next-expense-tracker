import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryChart } from "@/components/dashboard/CategoryChart";

const DATA = [
  { name: "Food", total: 820, color: "#EF4444" },
  { name: "Rent", total: 1500, color: "#7C5CFC" },
];

describe("CategoryChart", () => {
  it("renders the heading and chart when data exists", () => {
    render(<CategoryChart data={DATA} month="2026-09" />);

    expect(
      screen.getByRole("heading", { name: "Spending by Category" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("category-chart")).toBeInTheDocument();
    expect(screen.queryByText(/no data this month/i)).not.toBeInTheDocument();
  });

  it("renders the empty state without a chart when data is empty", () => {
    render(<CategoryChart data={[]} month="2026-09" />);

    expect(screen.getByText(/no data this month/i)).toBeInTheDocument();
    expect(screen.queryByTestId("category-chart-bars")).not.toBeInTheDocument();
  });
});
