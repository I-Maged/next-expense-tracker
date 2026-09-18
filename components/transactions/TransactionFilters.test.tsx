import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MOCK_CATEGORIES } from "@/lib/mockTransactions";
import {
  TransactionFilters,
  type TransactionTypeFilter,
} from "@/components/transactions/TransactionFilters";

function renderFilters(overrides?: {
  search?: string;
  categoryId?: string;
  typeFilter?: TransactionTypeFilter;
  month?: string;
}): {
  onSearchChange: ReturnType<typeof vi.fn>;
  onCategoryChange: ReturnType<typeof vi.fn>;
  onTypeChange: ReturnType<typeof vi.fn>;
  onMonthChange: ReturnType<typeof vi.fn>;
} {
  const onSearchChange = vi.fn();
  const onCategoryChange = vi.fn();
  const onTypeChange = vi.fn();
  const onMonthChange = vi.fn();
  render(
    <TransactionFilters
      search={overrides?.search ?? ""}
      onSearchChange={onSearchChange}
      categoryId={overrides?.categoryId ?? "all"}
      onCategoryChange={onCategoryChange}
      typeFilter={overrides?.typeFilter ?? "ALL"}
      onTypeChange={onTypeChange}
      month={overrides?.month ?? ""}
      onMonthChange={onMonthChange}
      categories={MOCK_CATEGORIES}
    />,
  );
  return { onSearchChange, onCategoryChange, onTypeChange, onMonthChange };
}

describe("TransactionFilters", () => {
  it("renders search, category, type, and month controls", () => {
    renderFilters();

    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/month/i)).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /all categories/i }),
    ).toBeInTheDocument();
    for (const category of MOCK_CATEGORIES) {
      expect(
        screen.getByRole("option", { name: category.name }),
      ).toBeInTheDocument();
    }
  });

  it("notifies when each filter changes", () => {
    const { onSearchChange, onCategoryChange, onTypeChange, onMonthChange } =
      renderFilters();

    fireEvent.change(screen.getByPlaceholderText(/search notes/i), {
      target: { value: "coffee" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("coffee");

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: "mock-cat-food" },
    });
    expect(onCategoryChange).toHaveBeenCalledWith("mock-cat-food");

    fireEvent.change(screen.getByLabelText(/^type/i), {
      target: { value: "INCOME" },
    });
    expect(onTypeChange).toHaveBeenCalledWith("INCOME");

    fireEvent.change(screen.getByLabelText(/month/i), {
      target: { value: "2026-09" },
    });
    expect(onMonthChange).toHaveBeenCalledWith("2026-09");
  });
});
