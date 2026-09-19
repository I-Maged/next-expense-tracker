import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/actions/categories", () => ({
  createCategory: mockCreate,
  updateCategory: mockUpdate,
  deleteCategory: vi.fn(),
  seedDefaultCategories: vi.fn(),
}));

import { CategoryForm } from "@/components/settings/CategoryForm";
import { CATEGORY_COLORS } from "@/lib/utils";

function renderCreate(
  overrides: Partial<Parameters<typeof CategoryForm>[0]> = {},
): void {
  render(<CategoryForm open onClose={() => {}} {...overrides} />);
}

describe("CategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <CategoryForm open={false} onClose={() => {}} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders name field and swatches for create", () => {
    renderCreate();

    expect(
      screen.getByRole("dialog", { name: "Add category" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(CATEGORY_COLORS.length);
  });

  it("shows a friendly error for an empty name without calling the action", async () => {
    renderCreate();

    fireEvent.click(screen.getByRole("button", { name: "Add category" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /enter a category name/i,
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a category and notifies on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    mockCreate.mockResolvedValue({ success: true });
    renderCreate({ onClose, onSuccess });

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Coffee" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "#EF4444" }));
    fireEvent.click(screen.getByRole("button", { name: "Add category" }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: "Coffee",
        color: "#EF4444",
      });
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows server errors without closing", async () => {
    mockCreate.mockResolvedValue({
      success: false,
      error: "Category name already exists",
    });
    renderCreate();

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Food" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add category" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Category name already exists",
    );
  });

  it("prefills for edit and calls update with the id", async () => {
    const onClose = vi.fn();
    mockUpdate.mockResolvedValue({ success: true });
    render(
      <CategoryForm
        open
        onClose={onClose}
        initial={{
          id: "cat_1",
          name: "Coffee",
          color: "#EF4444",
          transactionCount: 3,
        }}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Edit category" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("Coffee");
    expect(screen.getByRole("radio", { name: "#EF4444" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Dining" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "cat_1",
        name: "Dining",
        color: "#EF4444",
      });
    });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
