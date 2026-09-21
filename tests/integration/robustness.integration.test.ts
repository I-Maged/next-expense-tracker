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

import { upsertBudget } from "@/actions/budgets";
import { createCategory } from "@/actions/categories";
import { createTransaction } from "@/actions/transactions";
import { TRANSACTIONS_PER_PAGE } from "@/lib/utils";
import {
  disconnectTestPrisma,
  getTestPrisma,
  truncateDomain,
} from "./helpers/db";
import { sessionHeaders, signUpTestUser, type TestUser } from "./helpers/auth";

let user: TestUser;

function asUser(u: TestUser = user): void {
  mockHeaders.mockResolvedValue(sessionHeaders(u));
}

beforeAll(async () => {
  user = await signUpTestUser("rob");
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
});

afterAll(async () => {
  await disconnectTestPrisma();
});

async function createCategoryRow(name: string): Promise<string> {
  expect(await createCategory({ name, color: "#EF4444" })).toEqual({
    success: true,
  });
  asUser();
  return (
    await getTestPrisma().category.findFirstOrThrow({
      where: { userId: user.id, name },
    })
  ).id;
}

describe("robustness: races and precision (real DB)", () => {
  it("concurrent upserts for the same key converge to one row", async () => {
    const categoryId = await createCategoryRow("Race");
    asUser();

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        upsertBudget({ categoryId, month: "2026-09", limit: 100 + i }),
      ),
    );
    expect(results.every((r) => r.success)).toBe(true);

    const prisma = getTestPrisma();
    expect(
      await prisma.budget.count({
        where: { userId: user.id, categoryId, month: "2026-09" },
      }),
    ).toBe(1);
  });

  it("concurrent duplicate category names leave exactly one winner", async () => {
    const results = await Promise.all(
      Array.from({ length: 3 }, () =>
        createCategory({ name: "RaceCat", color: "#EF4444" }),
      ),
    );
    expect(results.filter((r) => r.success)).toHaveLength(1);
    const losers = results.filter((r) => !r.success);
    expect(losers).toHaveLength(2);
    for (const loser of losers) {
      expect(loser).toEqual({
        success: false,
        error: "Category name already exists",
      });
    }

    const prisma = getTestPrisma();
    expect(
      await prisma.category.count({
        where: { userId: user.id, name: "RaceCat" },
      }),
    ).toBe(1);
  });

  it("accepts Decimal(12,2) extremes and rejects extra decimals", async () => {
    const categoryId = await createCategoryRow("Precision");
    asUser();

    expect(
      await upsertBudget({
        categoryId,
        month: "2026-09",
        limit: 999999999.99,
      }),
    ).toEqual({ success: true });
    const prisma = getTestPrisma();
    expect(
      (
        await prisma.budget.findFirstOrThrow({
          where: { userId: user.id, categoryId, month: "2026-09" },
        })
      ).limit.toNumber(),
    ).toBe(999999999.99);

    expect(
      await upsertBudget({ categoryId, month: "2026-10", limit: 10.999 }),
    ).toEqual({ success: false, error: "Invalid budget data" });
    expect(
      await createTransaction({
        type: "EXPENSE",
        amount: 10.999,
        categoryId,
        date: new Date("2026-09-10"),
      }),
    ).toEqual({ success: false, error: "Invalid transaction data" });

    // Common float-representation amounts still pass.
    expect(
      await createTransaction({
        type: "EXPENSE",
        amount: 0.29,
        categoryId,
        date: new Date("2026-09-10"),
      }),
    ).toEqual({ success: true });
  });
});

describe("robustness: pagination bounds and auth expiry (real DB)", () => {
  it("paginates exactly TRANSACTIONS_PER_PAGE per page", async () => {
    const categoryId = await createCategoryRow("Paged");
    const prisma = getTestPrisma();
    await prisma.transaction.createMany({
      data: Array.from({ length: TRANSACTIONS_PER_PAGE + 1 }, (_, i) => ({
        userId: user.id,
        categoryId,
        type: "EXPENSE",
        amount: 1 + i,
        date: new Date("2026-09-10"),
      })),
    });

    const page1 = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: TRANSACTIONS_PER_PAGE,
      skip: 0,
    });
    const page2 = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: TRANSACTIONS_PER_PAGE,
      skip: TRANSACTIONS_PER_PAGE,
    });
    const page3 = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: TRANSACTIONS_PER_PAGE,
      skip: TRANSACTIONS_PER_PAGE * 2,
    });
    expect(page1).toHaveLength(TRANSACTIONS_PER_PAGE);
    expect(page2).toHaveLength(1);
    expect(page3).toHaveLength(0);
  });

  it("returns empty lists for filters with no matches", async () => {
    const prisma = getTestPrisma();
    expect(
      await prisma.transaction.findMany({
        where: { userId: user.id, categoryId: "cat_missing" },
      }),
    ).toEqual([]);
    expect(
      await prisma.budget.findMany({
        where: { userId: user.id, month: "1999-01" },
      }),
    ).toEqual([]);
  });

  it("rejects actions after the session is revoked", async () => {
    const categoryId = await createCategoryRow("Revoked");
    asUser();

    // Simulate expiry / sign-out by deleting the session row.
    await getTestPrisma().session.deleteMany({ where: { userId: user.id } });

    expect(
      await createTransaction({
        type: "EXPENSE",
        amount: 10,
        categoryId,
        date: new Date("2026-09-10"),
      }),
    ).toEqual({ success: false, error: "Not authenticated" });
  });
});
