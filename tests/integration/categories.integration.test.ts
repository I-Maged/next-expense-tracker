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

import {
  createCategory,
  deleteCategory,
  seedDefaultCategories,
  updateCategory,
} from "@/actions/categories";
import {
  disconnectTestPrisma,
  getTestPrisma,
  truncateDomain,
} from "./helpers/db";
import { sessionHeaders, signUpTestUser, type TestUser } from "./helpers/auth";

let user: TestUser;

function asUser(): void {
  mockHeaders.mockResolvedValue(sessionHeaders(user));
}

beforeAll(async () => {
  user = await signUpTestUser("cat");
  mockCookies.mockResolvedValue({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  });
});

beforeEach(async () => {
  await truncateDomain();
  asUser();
  vi.clearAllMocks();
  // clearAllMocks wipes the implementation — restore after clearing.
  asUser();
  mockCookies.mockResolvedValue({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  });
});

afterAll(async () => {
  await disconnectTestPrisma();
});

describe("seedDefaultCategories (real DB)", () => {
  it("seeds eight categories once and is a no-op on reseed", async () => {
    expect(await seedDefaultCategories()).toEqual({ success: true });

    const prisma = getTestPrisma();
    expect(await prisma.category.count({ where: { userId: user.id } })).toBe(8);

    expect(await seedDefaultCategories()).toEqual({ success: true });
    expect(await prisma.category.count({ where: { userId: user.id } })).toBe(8);
  });

  it("scopes seeds per user", async () => {
    const other = await signUpTestUser("cat-other");
    mockHeaders.mockResolvedValue(sessionHeaders(other));
    expect(await seedDefaultCategories()).toEqual({ success: true });

    const prisma = getTestPrisma();
    expect(await prisma.category.count({ where: { userId: user.id } })).toBe(0);
    expect(await prisma.category.count({ where: { userId: other.id } })).toBe(8);
  });
});

describe("createCategory / updateCategory / deleteCategory (real DB)", () => {
  it("creates, renames, and deletes a category", async () => {
    expect(
      await createCategory({ name: "Coffee", color: "#EF4444" }),
    ).toEqual({ success: true });
    expect(mockRevalidate).toHaveBeenCalledWith("/settings");

    const prisma = getTestPrisma();
    const created = await prisma.category.findFirst({
      where: { userId: user.id, name: "Coffee" },
    });
    expect(created?.color).toBe("#EF4444");

    expect(
      await updateCategory({
        id: created!.id,
        name: "Coffee Shops",
        color: "#10B981",
      }),
    ).toEqual({ success: true });
    expect(
      await prisma.category.findFirst({ where: { id: created!.id } }),
    ).toMatchObject({ name: "Coffee Shops" });

    expect(await deleteCategory({ id: created!.id })).toEqual({
      success: true,
    });
    expect(
      await prisma.category.findFirst({ where: { id: created!.id } }),
    ).toBeNull();
  });

  it("blocks duplicate names per user but allows them across users", async () => {
    expect(await createCategory({ name: "Dining", color: "#EF4444" })).toEqual({
      success: true,
    });
    expect(await createCategory({ name: "Dining", color: "#10B981" })).toEqual({
      success: false,
      error: "Category name already exists",
    });

    const other = await signUpTestUser("cat-dupe");
    mockHeaders.mockResolvedValue(sessionHeaders(other));
    expect(await createCategory({ name: "Dining", color: "#EF4444" })).toEqual({
      success: true,
    });
  });

  it("blocks deleting a category referenced by transactions and budgets", async () => {
    await seedDefaultCategories();
    const prisma = getTestPrisma();
    const category = await prisma.category.findFirstOrThrow({
      where: { userId: user.id },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        type: "EXPENSE",
        amount: 10,
        date: new Date("2026-09-10"),
      },
    });
    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        type: "EXPENSE",
        amount: 20,
        date: new Date("2026-09-11"),
      },
    });
    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        month: "2026-09",
        limit: 500,
      },
    });

    const result = await deleteCategory({ id: category.id });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error).toMatch(
        /2 transactions and 1 budget|Cannot delete/,
      );
    // Still there.
    expect(
      await prisma.category.findFirst({ where: { id: category.id } }),
    ).not.toBeNull();
  });
});
