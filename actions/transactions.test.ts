import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  mockCategoryFindFirst,
  mockTxCreate,
  mockTxFindFirst,
  mockTxUpdate,
  mockTxDelete,
  mockRevalidate,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockCategoryFindFirst: vi.fn(),
  mockTxCreate: vi.fn(),
  mockTxFindFirst: vi.fn(),
  mockTxUpdate: vi.fn(),
  mockTxDelete: vi.fn(),
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
    transaction: {
      create: mockTxCreate,
      findFirst: mockTxFindFirst,
      update: mockTxUpdate,
      delete: mockTxDelete,
    },
  },
}));

import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/actions/transactions";

const SESSION = { user: { id: "user_1" } };
const VALID = {
  type: "EXPENSE",
  amount: 42.5,
  categoryId: "cat_1",
  date: new Date("2026-09-10"),
  note: "Groceries",
};

describe("createTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Not authenticated without a session", async () => {
    mockGetSession.mockResolvedValue(null);

    expect(await createTransaction(VALID)).toEqual({
      success: false,
      error: "Not authenticated",
    });
    expect(mockTxCreate).not.toHaveBeenCalled();
  });

  it("creates a user-scoped transaction and revalidates", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockCategoryFindFirst.mockResolvedValue({ id: "cat_1", userId: "user_1" });
    mockTxCreate.mockResolvedValue({ id: "tx_1" });

    const result = await createTransaction({ ...VALID, amount: "42.50" });

    expect(result).toEqual({ success: true });
    expect(mockCategoryFindFirst).toHaveBeenCalledWith({
      where: { id: "cat_1", userId: "user_1" },
    });
    expect(mockTxCreate).toHaveBeenCalledWith({
      data: {
        userId: "user_1",
        categoryId: "cat_1",
        type: "EXPENSE",
        amount: 42.5,
        date: new Date("2026-09-10"),
        note: "Groceries",
      },
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/transactions");
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects invalid data and foreign categories", async () => {
    mockGetSession.mockResolvedValue(SESSION);

    expect(await createTransaction({ ...VALID, amount: -5 })).toEqual({
      success: false,
      error: "Invalid transaction data",
    });

    mockCategoryFindFirst.mockResolvedValue(null);
    expect(await createTransaction(VALID)).toEqual({
      success: false,
      error: "Category not found",
    });
    expect(mockTxCreate).not.toHaveBeenCalled();
  });

  it("rejects extra decimals and future dates with friendly text", async () => {
    mockGetSession.mockResolvedValue(SESSION);

    expect(await createTransaction({ ...VALID, amount: 10.999 })).toEqual({
      success: false,
      error: "Invalid transaction data",
    });
    expect(
      await createTransaction({
        ...VALID,
        date: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }),
    ).toEqual({ success: false, error: "Invalid transaction data" });
    expect(mockTxCreate).not.toHaveBeenCalled();
  });

  it("returns a friendly error when prisma throws", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockCategoryFindFirst.mockResolvedValue({ id: "cat_1" });
    mockTxCreate.mockRejectedValue(new Error("db down"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await createTransaction(VALID)).toEqual({
      success: false,
      error: "Failed to save transaction",
    });
    consoleSpy.mockRestore();
  });
});

describe("updateTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates an owned transaction and revalidates", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockTxFindFirst.mockResolvedValue({ id: "tx_1", categoryId: "cat_1" });
    mockTxUpdate.mockResolvedValue({ id: "tx_1" });

    const result = await updateTransaction({ ...VALID, id: "tx_1" });

    expect(result).toEqual({ success: true });
    expect(mockTxUpdate).toHaveBeenCalledWith({
      where: { id: "tx_1" },
      data: {
        categoryId: "cat_1",
        type: "EXPENSE",
        amount: 42.5,
        date: new Date("2026-09-10"),
        note: "Groceries",
      },
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/transactions");
  });

  it("returns Not found for other users' transactions", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockTxFindFirst.mockResolvedValue(null);

    expect(await updateTransaction({ ...VALID, id: "tx_x" })).toEqual({
      success: false,
      error: "Transaction not found",
    });
    expect(mockTxUpdate).not.toHaveBeenCalled();
  });

  it("blocks moving to a foreign category", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockTxFindFirst.mockResolvedValue({ id: "tx_1", categoryId: "cat_1" });
    mockCategoryFindFirst.mockResolvedValue(null);

    expect(
      await updateTransaction({ ...VALID, id: "tx_1", categoryId: "cat_evil" }),
    ).toEqual({ success: false, error: "Category not found" });
    expect(mockTxUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an owned transaction and revalidates", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockTxFindFirst.mockResolvedValue({ id: "tx_1" });
    mockTxDelete.mockResolvedValue({ id: "tx_1" });

    expect(await deleteTransaction({ id: "tx_1" })).toEqual({ success: true });
    expect(mockTxDelete).toHaveBeenCalledWith({ where: { id: "tx_1" } });
    expect(mockRevalidate).toHaveBeenCalledWith("/transactions");
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");
  });

  it("returns Not found for other users' transactions", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    mockTxFindFirst.mockResolvedValue(null);

    expect(await deleteTransaction({ id: "tx_x" })).toEqual({
      success: false,
      error: "Transaction not found",
    });
    expect(mockTxDelete).not.toHaveBeenCalled();
  });
});
