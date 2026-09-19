import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refreshMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: refreshMock }),
}));

vi.mock("@/actions/categories", () => ({
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  seedDefaultCategories: vi.fn(),
}));

import { CategoryManager } from "@/components/settings/CategoryManager";
import type { CategoryWithCount } from "@/components/settings/types";

const CATEGORIES: Array<CategoryWithCount> = [
  { id: "cat_food", name: "Food", color: "#EF4444", transactionCount: 3 },
  { id: "cat_rent", name: "Rent", color: "#7C5CFC", transactionCount: 0 },
];

function renderManager(
  overrides: Partial<Parameters<typeof CategoryManager>[0]> = {},
): void {
  render(<CategoryManager categories={CATEGORIES} {...overrides} />);
}

describe("CategoryManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, list rows, and add button", () => {
    renderManager();

    expect(
      screen.getByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add category/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("category-list")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("3 transactions")).toBeInTheDocument();
    expect(screen.getByText("No transactions")).toBeInTheDocument();
  });

  it("shows the empty state when there are no categories", () => {
    render(<CategoryManager categories={[]} />);

    expect(screen.getByText(/no categories yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("category-list")).not.toBeInTheDocument();
  });

  it("opens the add form from the header button", () => {
    renderManager();

    fireEvent.click(screen.getByRole("button", { name: "Add Category" }));

    expect(
      screen.getByRole("dialog", { name: "Add category" }),
    ).toBeInTheDocument();
  });

  it("opens the add form from the empty-state CTA", () => {
    render(<CategoryManager categories={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: /add your first category/i }),
    );

    expect(
      screen.getByRole("dialog", { name: "Add category" }),
    ).toBeInTheDocument();
  });

  it("opens the edit dialog from a row action", () => {
    renderManager();

    fireEvent.click(
      screen.getByRole("button", { name: "Edit category cat_food" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Edit category" }),
    ).toBeInTheDocument();
  });

  it("opens the delete dialog from a row action", () => {
    renderManager();

    fireEvent.click(
      screen.getByRole("button", { name: "Delete category cat_food" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Delete category" }),
    ).toBeInTheDocument();
  });
});
