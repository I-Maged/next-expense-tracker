import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  mockCount,
  mockCreateMany,
  mockFindFirst,
  mockCreate,
  mockUpdate,
  mockDelete,
  mockTxCount,
  mockBudgetCount,
  mockRevalidate,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockCount: vi.fn(),
  mockCreateMany: vi.fn(),
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockTxCount: vi.fn(),
  mockBudgetCount: vi.fn(),
  mockRevalidate: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidate }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      count: mockCount,
      createMany: mockCreateMany,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
    transaction: { count: mockTxCount },
    budget: { count: mockBudgetCount },
  },
}));

import {
  createCategory,
  deleteCategory,
  seedDefaultCategories,
  updateCategory,
} from "@/actions/categories";

const SESSION = { user: { id: "user_1" } };

describe("seedDefaultCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Not authenticated without a session", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await seedDefaultCategories();

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockCount).not.toHaveBeenCalled();
  });

  it("seeds 8 defaults when the user has zero categories", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockCount.mockResolvedValue(0);
    mockCreateMany.mockResolvedValue({ count: 8 });

    const result = await seedDefaultCategories();

    expect(result).toEqual({ success: true });
    expect(mockCreateMany).toHaveBeenCalledOnce();
    const data = mockCreateMany.mock.calls[0][0].data as Array<{
      userId: string;
      name: string;
      color: string;
    }>;
    expect(data).toHaveLength(8);
    expect(data.map((c) => c.name)).toEqual([
      "Food",
      "Transport",
      "Rent",
      "Utilities",
      "Shopping",
      "Health",
      "Entertainment",
      "Other",
    ]);
    for (const row of data) {
      expect(row.userId).toBe("user_1");
      expect(row.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("skips seeding when categories already exist", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockCount.mockResolvedValue(3);

    const result = await seedDefaultCategories();

    expect(result).toEqual({ success: true });
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("returns a friendly error when prisma throws", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockCount.mockRejectedValue(new Error("db down"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await seedDefaultCategories();

    expect(result).toEqual({
      success: false,
      error: "Failed to seed categories",
    });
    consoleSpy.mockRestore();
  });

  it("treats a duplicate-seed race as success", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockCount.mockResolvedValue(0);
    mockCreateMany.mockRejectedValue({ code: "P2002" });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await seedDefaultCategories();

    expect(result).toEqual({ success: true });
    consoleSpy.mockRestore();
  });

  it("writes duplicate-safe seeds", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockCount.mockResolvedValue(0);
    mockCreateMany.mockResolvedValue({ count: 8 });

    await seedDefaultCategories();

    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({ skipDuplicates: true }),
    );
  });
});

describe("createCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Not authenticated without a session", async () => {
    mockGetSession.mockResolvedValue(null);

    expect(await createCategory({ name: "Coffee", color: "#EF4444" })).toEqual({
      success: false,
      error: "Not authenticated",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a user-scoped category and revalidates", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "cat_1" });

    const result = await createCategory({ name: "Coffee", color: "#EF4444" });

    expect(result).toEqual({ success: true });
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { userId: "user_1", name: "Coffee" },
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { userId: "user_1", name: "Coffee", color: "#EF4444" },
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/settings");
    expect(mockRevalidate).toHaveBeenCalledWith("/transactions");
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidate).toHaveBeenCalledWith("/budgets");
  });

  it("rejects invalid data and duplicate names", async () => {
    mockGetSession.mockResolvedValue(SESSION);

    expect(await createCategory({ name: "", color: "#EF4444" })).toEqual({
      success: false,
      error: "Invalid category data",
    });

    mockFindFirst.mockResolvedValue({ id: "cat_x" });
    expect(await createCategory({ name: "Food", color: "#EF4444" })).toEqual({
      success: false,
      error: "Category name already exists",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("maps unique violations to a friendly error", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockRejectedValue({ code: "P2002" });

    expect(await createCategory({ name: "Food", color: "#EF4444" })).toEqual({
      success: false,
      error: "Category name already exists",
    });
  });

  it("returns a friendly error when prisma throws", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockRejectedValue(new Error("db down"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await createCategory({ name: "Coffee", color: "#EF4444" })).toEqual({
      success: false,
      error: "Failed to save category",
    });
    consoleSpy.mockRestore();
  });
});

describe("updateCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates an owned category and revalidates", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue({
      id: "cat_1",
      userId: "user_1",
      name: "Coffee",
      color: "#EF4444",
    });
    mockUpdate.mockResolvedValue({ id: "cat_1" });

    const result = await updateCategory({
      id: "cat_1",
      name: "Coffee",
      color: "#10B981",
    });

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "cat_1" },
      data: { name: "Coffee", color: "#10B981" },
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/settings");
  });

  it("returns Not found for other users' categories", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue(null);

    expect(
      await updateCategory({ id: "cat_x", name: "Coffee", color: "#EF4444" }),
    ).toEqual({ success: false, error: "Category not found" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("blocks renames to an existing name", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst
      .mockResolvedValueOnce({
        id: "cat_1",
        userId: "user_1",
        name: "Coffee",
        color: "#EF4444",
      })
      .mockResolvedValueOnce({ id: "cat_2" });

    expect(
      await updateCategory({ id: "cat_1", name: "Food", color: "#EF4444" }),
    ).toEqual({ success: false, error: "Category name already exists" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an unreferenced category and revalidates", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue({ id: "cat_1", userId: "user_1" });
    mockTxCount.mockResolvedValue(0);
    mockBudgetCount.mockResolvedValue(0);
    mockDelete.mockResolvedValue({ id: "cat_1" });

    expect(await deleteCategory({ id: "cat_1" })).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "cat_1" } });
    expect(mockRevalidate).toHaveBeenCalledWith("/settings");
    expect(mockRevalidate).toHaveBeenCalledWith("/transactions");
  });

  it("returns Not found for other users' categories", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue(null);

    expect(await deleteCategory({ id: "cat_x" })).toEqual({
      success: false,
      error: "Category not found",
    });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("blocks delete when transactions reference the category", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue({ id: "cat_1", userId: "user_1" });
    mockTxCount.mockResolvedValue(3);
    mockBudgetCount.mockResolvedValue(0);

    const result = await deleteCategory({ id: "cat_1" });

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error).toMatch(/3 transactions.*reassign/i);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("blocks delete when budgets reference the category", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue({ id: "cat_1", userId: "user_1" });
    mockTxCount.mockResolvedValue(0);
    mockBudgetCount.mockResolvedValue(2);

    const result = await deleteCategory({ id: "cat_1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/2 budgets.*reassign/i);
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
