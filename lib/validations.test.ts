import { describe, expect, it } from "vitest";

import {
  categorySchema,
  copyLastMonthSchema,
  createCategorySchema,
  createTransactionSchema,
  deleteBudgetSchema,
  deleteCategorySchema,
  updateCategorySchema,
  upsertBudgetSchema,
} from "@/lib/validations";

describe("createTransactionSchema", () => {
  it("accepts a valid expense", () => {
    const parsed = createTransactionSchema.safeParse({
      type: "EXPENSE",
      amount: 42.5,
      categoryId: "cat_1",
      date: new Date("2026-09-10"),
      note: "Groceries",
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts common two-decimal amounts regardless of float representation", () => {
    const base = {
      type: "EXPENSE",
      categoryId: "cat_1",
      date: new Date("2026-09-10"),
    };

    expect(
      createTransactionSchema.safeParse({ ...base, amount: 0.29 }).success,
    ).toBe(true);
    expect(
      createTransactionSchema.safeParse({ ...base, amount: "1.10" }).success,
    ).toBe(true);
    expect(
      createTransactionSchema.safeParse({ ...base, amount: "150.05" }).success,
    ).toBe(true);
  });

  it("rejects non-positive amounts, extra decimals, and future dates", () => {
    const base = {
      type: "EXPENSE",
      amount: 42.5,
      categoryId: "cat_1",
      date: new Date("2026-09-10"),
    };

    expect(
      createTransactionSchema.safeParse({ ...base, amount: 0 }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, amount: -5 }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, amount: 10.999 }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, type: "GIFT" }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, categoryId: "" }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({
        ...base,
        date: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, note: "x".repeat(201) })
        .success,
    ).toBe(false);
  });

  it("reports friendly messages for decimals and future dates", () => {
    const base = {
      type: "EXPENSE",
      amount: 42.5,
      categoryId: "cat_1",
      date: new Date("2026-09-10"),
    };

    const decimals = createTransactionSchema.safeParse({
      ...base,
      amount: 10.999,
    });
    expect(decimals.success).toBe(false);
    if (!decimals.success)
      expect(decimals.error.issues[0]?.message).toMatch(/2 decimals/i);

    const future = createTransactionSchema.safeParse({
      ...base,
      date: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
    expect(future.success).toBe(false);
    if (!future.success)
      expect(future.error.issues[0]?.message).toMatch(/future/i);
  });
});

describe("upsertBudgetSchema", () => {
  it("accepts a valid monthly limit", () => {
    const parsed = upsertBudgetSchema.safeParse({
      categoryId: "cat_1",
      month: "2026-09",
      limit: 500,
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects bad months and non-positive limits", () => {
    const base = { categoryId: "cat_1", month: "2026-09", limit: 500 };

    expect(
      upsertBudgetSchema.safeParse({ ...base, month: "2026-13" }).success,
    ).toBe(false);
    expect(
      upsertBudgetSchema.safeParse({ ...base, month: "Sep 2026" }).success,
    ).toBe(false);
    expect(upsertBudgetSchema.safeParse({ ...base, limit: 0 }).success).toBe(
      false,
    );
    expect(upsertBudgetSchema.safeParse({ ...base, limit: -10 }).success).toBe(
      false,
    );
    expect(
      upsertBudgetSchema.safeParse({ ...base, categoryId: "" }).success,
    ).toBe(false);
  });

  it("coerces string limits and rejects extra decimals", () => {
    const parsed = upsertBudgetSchema.safeParse({
      categoryId: "cat_1",
      month: "2026-09",
      limit: "500.50",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.limit).toBe(500.5);
    expect(
      upsertBudgetSchema.safeParse({
        categoryId: "cat_1",
        month: "2026-09",
        limit: "10.999",
      }).success,
    ).toBe(false);
  });

  it("reports friendly messages for bad months and decimals", () => {
    const badMonth = upsertBudgetSchema.safeParse({
      categoryId: "cat_1",
      month: "Sep 2026",
      limit: 500,
    });
    expect(badMonth.success).toBe(false);
    if (!badMonth.success)
      expect(badMonth.error.issues[0]?.message).toMatch(/YYYY-MM/);

    const decimals = upsertBudgetSchema.safeParse({
      categoryId: "cat_1",
      month: "2026-09",
      limit: "10.999",
    });
    expect(decimals.success).toBe(false);
    if (!decimals.success)
      expect(decimals.error.issues[0]?.message).toMatch(/2 decimals/i);
  });
});

describe("deleteBudgetSchema", () => {
  it("accepts an id and rejects blank ids", () => {
    expect(deleteBudgetSchema.safeParse({ id: "bud_1" }).success).toBe(true);
    expect(deleteBudgetSchema.safeParse({ id: "" }).success).toBe(false);
    expect(deleteBudgetSchema.safeParse({}).success).toBe(false);
  });
});

describe("copyLastMonthSchema", () => {
  it("accepts YYYY-MM and rejects anything else", () => {
    expect(copyLastMonthSchema.safeParse({ month: "2026-09" }).success).toBe(
      true,
    );
    expect(copyLastMonthSchema.safeParse({ month: "2026-13" }).success).toBe(
      false,
    );
    expect(copyLastMonthSchema.safeParse({ month: "Sep 2026" }).success).toBe(
      false,
    );
    expect(copyLastMonthSchema.safeParse({}).success).toBe(false);
  });
});

describe("categorySchema", () => {
  it("accepts a valid name and hex color", () => {
    const parsed = categorySchema.safeParse({ name: "Food", color: "#7C5CFC" });

    expect(parsed.success).toBe(true);
  });

  it("rejects blank or long names and non-hex colors", () => {
    expect(
      categorySchema.safeParse({ name: "", color: "#7C5CFC" }).success,
    ).toBe(false);
    expect(
      categorySchema.safeParse({ name: "   ", color: "#7C5CFC" }).success,
    ).toBe(false);
    expect(
      categorySchema.safeParse({ name: "x".repeat(41), color: "#7C5CFC" })
        .success,
    ).toBe(false);
    expect(
      categorySchema.safeParse({ name: "Food", color: "purple" }).success,
    ).toBe(false);
    expect(
      categorySchema.safeParse({ name: "Food", color: "#FFF" }).success,
    ).toBe(false);
  });
});

describe("createCategorySchema", () => {
  it("accepts a valid name and color and trims whitespace", () => {
    const parsed = createCategorySchema.safeParse({
      name: "  Coffee  ",
      color: "#EF4444",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.name).toBe("Coffee");
  });

  it("rejects blank, long, and bad-color inputs", () => {
    expect(
      createCategorySchema.safeParse({ name: "", color: "#EF4444" }).success,
    ).toBe(false);
    expect(
      createCategorySchema.safeParse({ name: "x".repeat(41), color: "#EF4444" })
        .success,
    ).toBe(false);
    expect(
      createCategorySchema.safeParse({ name: "Food", color: "red" }).success,
    ).toBe(false);
  });
});

describe("updateCategorySchema", () => {
  it("accepts an id with valid fields", () => {
    const parsed = updateCategorySchema.safeParse({
      id: "cat_1",
      name: "Dining",
      color: "#10B981",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects missing ids and invalid fields", () => {
    expect(
      updateCategorySchema.safeParse({ name: "Dining", color: "#10B981" })
        .success,
    ).toBe(false);
    expect(
      updateCategorySchema.safeParse({
        id: "",
        name: "Dining",
        color: "#10B981",
      }).success,
    ).toBe(false);
    expect(
      updateCategorySchema.safeParse({
        id: "cat_1",
        name: "",
        color: "#10B981",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCategorySchema", () => {
  it("accepts an id and rejects blank ids", () => {
    expect(deleteCategorySchema.safeParse({ id: "cat_1" }).success).toBe(true);
    expect(deleteCategorySchema.safeParse({ id: "" }).success).toBe(false);
    expect(deleteCategorySchema.safeParse({}).success).toBe(false);
  });
});
