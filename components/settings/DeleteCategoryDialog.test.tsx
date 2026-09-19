import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDelete } = vi.hoisted(() => ({
  mockDelete: vi.fn(),
}));

vi.mock("@/actions/categories", () => ({
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: mockDelete,
  seedDefaultCategories: vi.fn(),
}));

import { DeleteCategoryDialog } from "@/components/settings/DeleteCategoryDialog";

const CATEGORY = {
  id: "cat_food",
  name: "Food",
  color: "#EF4444",
  transactionCount: 3,
};

describe("DeleteCategoryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <DeleteCategoryDialog
        open={false}
        onClose={() => {}}
        category={CATEGORY}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("confirms delete and notifies on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    mockDelete.mockResolvedValue({ success: true });
    render(
      <DeleteCategoryDialog
        open
        onClose={onClose}
        category={CATEGORY}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText(/food/i)).toBeInTheDocument();
    expect(screen.getByText(/3 transactions/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith({ id: "cat_food" });
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows server errors without closing", async () => {
    mockDelete.mockResolvedValue({
      success: false,
      error: "Cannot delete — 3 transactions use this category.",
    });
    render(
      <DeleteCategoryDialog open onClose={() => {}} category={CATEGORY} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /cannot delete/i,
    );
  });
});
