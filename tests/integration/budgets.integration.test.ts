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

import { copyLastMonth, deleteBudget, upsertBudget } from "@/actions/budgets";
import { seedDefaultCategories } from "@/actions/categories";
import {
  disconnectTestPrisma,
  getTestPrisma,
  truncateDomain,
} from "./helpers/db";
import { sessionHeaders, signUpTestUser, type TestUser } from "./helpers/auth";

let user: TestUser;
let categoryId: string;
let secondCategoryId: string;

function asUser(u: TestUser = user): void {
  mockHeaders.mockResolvedValue(sessionHeaders(u));
}

beforeAll(async () => {
  user = await signUpTestUser("bud");
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
  const cats = await prisma.category.findMany({ where: { userId: user.id } });
  categoryId = cats[0].id;
  secondCategoryId = cats[1].id;
  vi.clearAllMocks();
  asUser();
});

afterAll(async () => {
  await disconnectTestPrisma();
});

describe("upsertBudget (real DB)", () => {
  it("creates then updates the monthly limit", async () => {
    expect(
      await upsertBudget({ categoryId, month: "2026-09", limit: 500 }),
    ).toEqual({ success: true });
    expect(mockRevalidate).toHaveBeenCalledWith("/budgets");
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");

    const prisma = getTestPrisma();
    expect(
      (
        await prisma.budget.findFirstOrThrow({
          where: { userId: user.id, categoryId, month: "2026-09" },
        })
      ).limit.toNumber(),
    ).toBe(500);

    expect(
      await upsertBudget({ categoryId, month: "2026-09", limit: 750 }),
    ).toEqual({ success: true });
    expect(await prisma.budget.count({ where: { userId: user.id } })).toBe(1);
    expect(
      (
        await prisma.budget.findFirstOrThrow({
          where: { userId: user.id, categoryId, month: "2026-09" },
        })
      ).limit.toNumber(),
    ).toBe(750);
  });

  it("isolates budgets per user", async () => {
    expect(
      await upsertBudget({ categoryId, month: "2026-09", limit: 500 }),
    ).toEqual({ success: true });
    const prisma = getTestPrisma();
    const mine = await prisma.budget.findFirstOrThrow({
      where: { userId: user.id },
    });

    const other = await signUpTestUser("bud-cross");
    asUser(other);
    expect(await deleteBudget({ id: mine.id })).toEqual({
      success: false,
      error: "Budget not found",
    });
  });
});

describe("copyLastMonth (real DB)", () => {
  it("copies missing rows and is idempotent", async () => {
    const prisma = getTestPrisma();
    await prisma.budget.createMany({
      data: [
        { userId: user.id, categoryId, month: "2026-08", limit: 500 },
        { userId: user.id, categoryId: secondCategoryId, month: "2026-08", limit: 200 },
      ],
    });
    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: secondCategoryId,
        month: "2026-09",
        limit: 250,
      },
    });

    expect(await copyLastMonth({ month: "2026-09" })).toEqual({
      success: true,
      copied: 1,
      skipped: 1,
    });
    expect(
      (
        await prisma.budget.findFirstOrThrow({
          where: { userId: user.id, categoryId, month: "2026-09" },
        })
      ).limit.toNumber(),
    ).toBe(500);

    expect(await copyLastMonth({ month: "2026-09" })).toEqual({
      success: true,
      copied: 0,
      skipped: 2,
    });
  });

  it("reports a friendly error when last month is empty", async () => {
    const result = await copyLastMonth({ month: "2026-09" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/no budgets in 2026-08/i);
  });
});
