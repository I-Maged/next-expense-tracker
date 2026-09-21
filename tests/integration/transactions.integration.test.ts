import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { mockHeaders, mockRevalidate, mockCookies } = vi.hoisted(() => ({
  mockHeaders: vi.fn(),
  mockRevalidate: vi.fn(),
  mockCookies: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mockHeaders,
  cookies: mockCookies,
}));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidate }));

import { seedDefaultCategories } from "@/actions/categories";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/actions/transactions";
import {
  disconnectTestPrisma,
  getTestPrisma,
  truncateDomain,
} from "./helpers/db";
import { sessionHeaders, signUpTestUser, type TestUser } from "./helpers/auth";

let user: TestUser;
let categoryId: string;

function asUser(u: TestUser = user): void {
  mockHeaders.mockResolvedValue(sessionHeaders(u));
}

beforeAll(async () => {
  user = await signUpTestUser("tx");
  mockCookies.mockResolvedValue({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  });
});

beforeEach(async () => {
  await truncateDomain();
  vi.clearAllMocks();
  asUser();
  mockCookies.mockResolvedValue({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  });
  expect(await seedDefaultCategories()).toEqual({ success: true });
  const prisma = getTestPrisma();
  categoryId = (
    await prisma.category.findFirstOrThrow({ where: { userId: user.id } })
  ).id;
  vi.clearAllMocks();
  asUser();
});

afterAll(async () => {
  await disconnectTestPrisma();
});

describe("createTransaction (real DB)", () => {
  it("persists a Decimal amount and revalidates", async () => {
    const result = await createTransaction({
      type: "EXPENSE",
      amount: "42.50",
      categoryId,
      date: new Date("2026-09-10"),
      note: "Groceries",
    });
    expect(result).toEqual({ success: true });
    expect(mockRevalidate).toHaveBeenCalledWith("/transactions");
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");

    const prisma = getTestPrisma();
    const rows = await prisma.transaction.findMany({
      where: { userId: user.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].amount.toNumber()).toBe(42.5);
    expect(rows[0].note).toBe("Groceries");
  });

  it("rejects foreign categories and invalid data", async () => {
    const other = await signUpTestUser("tx-foreign");
    const prisma = getTestPrisma();
    const foreign = await prisma.category.create({
      data: { userId: other.id, name: "Theirs", color: "#000000" },
    });

    expect(
      await createTransaction({
        type: "EXPENSE",
        amount: 10,
        categoryId: foreign.id,
        date: new Date("2026-09-10"),
      }),
    ).toEqual({ success: false, error: "Category not found" });

    expect(
      await createTransaction({
        type: "EXPENSE",
        amount: -5,
        categoryId,
        date: new Date("2026-09-10"),
      }),
    ).toEqual({ success: false, error: "Invalid transaction data" });

    expect(await prisma.transaction.count({ where: { userId: user.id } })).toBe(
      0,
    );
  });
});

describe("updateTransaction / deleteTransaction (real DB)", () => {
  it("updates an owned transaction", async () => {
    expect(
      await createTransaction({
        type: "EXPENSE",
        amount: 42.5,
        categoryId,
        date: new Date("2026-09-10"),
        note: "Before",
      }),
    ).toEqual({ success: true });

    const prisma = getTestPrisma();
    const tx = await prisma.transaction.findFirstOrThrow({
      where: { userId: user.id },
    });

    expect(
      await updateTransaction({
        id: tx.id,
        type: "EXPENSE",
        amount: 50,
        categoryId,
        date: new Date("2026-09-11"),
        note: "After",
      }),
    ).toEqual({ success: true });

    const updated = await prisma.transaction.findFirstOrThrow({
      where: { id: tx.id },
    });
    expect(updated.amount.toNumber()).toBe(50);
    expect(updated.note).toBe("After");
  });

  it("hides other users' transactions", async () => {
    const prisma = getTestPrisma();
    const tx = await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId,
        type: "EXPENSE",
        amount: 10,
        date: new Date("2026-09-10"),
      },
    });

    const other = await signUpTestUser("tx-cross");
    asUser(other);

    expect(
      await updateTransaction({
        id: tx.id,
        type: "EXPENSE",
        amount: 99,
        categoryId,
        date: new Date("2026-09-10"),
      }),
    ).toEqual({ success: false, error: "Transaction not found" });
    expect(await deleteTransaction({ id: tx.id })).toEqual({
      success: false,
      error: "Transaction not found",
    });
    // Untouched.
    expect(
      (await prisma.transaction.findFirstOrThrow({ where: { id: tx.id } }))
        .amount.toNumber(),
    ).toBe(10);
  });

  it("deletes and reports a second delete as not found", async () => {
    expect(
      await createTransaction({
        type: "INCOME",
        amount: 100,
        categoryId,
        date: new Date("2026-09-10"),
      }),
    ).toEqual({ success: true });

    const prisma = getTestPrisma();
    const tx = await prisma.transaction.findFirstOrThrow({
      where: { userId: user.id },
    });

    expect(await deleteTransaction({ id: tx.id })).toEqual({ success: true });
    expect(await prisma.transaction.count({ where: { userId: user.id } })).toBe(
      0,
    );
    expect(await deleteTransaction({ id: tx.id })).toEqual({
      success: false,
      error: "Transaction not found",
    });
  });
});
