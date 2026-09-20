import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  mockCategoryFindFirst,
  mockFindFirst,
  mockFindMany,
  mockCreate,
  mockCreateMany,
  mockUpdate,
  mockDelete,
  mockRevalidate,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockCategoryFindFirst: vi.fn(),
  mockFindFirst: vi.fn(),
  mockFindMany: vi.fn(),
  mockCreate: vi.fn(),
  mockCreateMany: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockRevalidate: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidate }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: { findFirst: mockCategoryFindFirst },
    budget: {
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      create: mockCreate,
      createMany: mockCreateMany,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { copyLastMonth, deleteBudget, upsertBudget } from "@/actions/budgets";

const SESSION = { user: { id: "user_1" } };
const VALID = { categoryId: "cat_1", month: "2026-09", limit: 500 };

describe("upsertBudget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Not authenticated without a session", async () => {
    mockGetSession.mockResolvedValue(null);

    expect(await upsertBudget(VALID)).toEqual({
      success: false,
      error: "Not authenticated",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a budget and revalidates when none exists", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockCategoryFindFirst.mockResolvedValue({ id: "cat_1" });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "bud_1" });

    expect(await upsertBudget({ ...VALID, limit: "500" })).toEqual({
      success: true,
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: "user_1",
        categoryId: "cat_1",
        month: "2026-09",
        limit: 500,
      },
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/budgets");
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");
  });

  it("updates the limit when a budget already exists", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockCategoryFindFirst.mockResolvedValue({ id: "cat_1" });
    mockFindFirst.mockResolvedValue({ id: "bud_1" });
    mockUpdate.mockResolvedValue({ id: "bud_1" });

    expect(await upsertBudget({ ...VALID, limit: 750 })).toEqual({
      success: true,
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "bud_1" },
      data: { limit: 750 },
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects invalid data and foreign categories", async () => {
    mockGetSession.mockResolvedValue(SESSION);

    expect(await upsertBudget({ ...VALID, limit: -5 })).toEqual({
      success: false,
      error: "Invalid budget data",
    });
    expect(await upsertBudget({ ...VALID, month: "Sep 2026" })).toEqual({
      success: false,
      error: "Invalid budget data",
    });

    mockCategoryFindFirst.mockResolvedValue(null);
    expect(await upsertBudget(VALID)).toEqual({
      success: false,
      error: "Category not found",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects extra-decimal limits with friendly text", async () => {
    mockGetSession.mockResolvedValue(SESSION);

    expect(await upsertBudget({ ...VALID, limit: 10.999 })).toEqual({
      success: false,
      error: "Invalid budget data",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("recovers from a unique race by updating instead", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockCategoryFindFirst.mockResolvedValue({ id: "cat_1" });
    mockFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "bud_9",
    });
    mockCreate.mockRejectedValue({ code: "P2002" });
    mockUpdate.mockResolvedValue({ id: "bud_9" });

    expect(await upsertBudget(VALID)).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "bud_9" },
      data: { limit: 500 },
    });
  });

  it("returns a friendly error when prisma throws", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockCategoryFindFirst.mockResolvedValue({ id: "cat_1" });
    mockFindFirst.mockRejectedValue(new Error("db down"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await upsertBudget(VALID)).toEqual({
      success: false,
      error: "Failed to save budget",
    });
    consoleSpy.mockRestore();
  });
});

describe("deleteBudget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an owned budget and revalidates", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue({ id: "bud_1" });
    mockDelete.mockResolvedValue({ id: "bud_1" });

    expect(await deleteBudget({ id: "bud_1" })).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "bud_1" } });
    expect(mockRevalidate).toHaveBeenCalledWith("/budgets");
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");
  });

  it("returns Not found for other users' budgets", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindFirst.mockResolvedValue(null);

    expect(await deleteBudget({ id: "bud_x" })).toEqual({
      success: false,
      error: "Budget not found",
    });
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

describe("copyLastMonth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("copies missing rows and reports counts", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindMany
      .mockResolvedValueOnce([
        { categoryId: "cat_1", limit: 500 },
        { categoryId: "cat_2", limit: 200 },
      ])
      .mockResolvedValueOnce([{ categoryId: "cat_2" }]);
    mockCreateMany.mockResolvedValue({ count: 1 });

    expect(await copyLastMonth({ month: "2026-09" })).toEqual({
      success: true,
      copied: 1,
      skipped: 1,
    });
    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        {
          userId: "user_1",
          categoryId: "cat_1",
          month: "2026-09",
          limit: 500,
        },
      ],
      skipDuplicates: true,
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/budgets");
  });

  it("reports zero copied when everything already exists", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindMany
      .mockResolvedValueOnce([{ categoryId: "cat_1", limit: 500 }])
      .mockResolvedValueOnce([{ categoryId: "cat_1" }]);

    expect(await copyLastMonth({ month: "2026-09" })).toEqual({
      success: true,
      copied: 0,
      skipped: 1,
    });
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("returns a friendly error when last month is empty", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);

    const result = await copyLastMonth({ month: "2026-09" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/no budgets in 2026-08/i);
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("rejects invalid months", async () => {
    mockGetSession.mockResolvedValue(SESSION);

    expect(await copyLastMonth({ month: "soon" })).toEqual({
      success: false,
      error: "Invalid month",
    });
  });
});
