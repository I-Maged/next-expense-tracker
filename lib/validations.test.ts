import { describe, expect, it } from "vitest";

import {
  categorySchema,
  createTransactionSchema,
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

  it("rejects non-positive amounts, extra decimals, and future dates", () => {
    const base = {
      type: "EXPENSE",
      amount: 42.5,
      categoryId: "cat_1",
      date: new Date("2026-09-10"),
    };

    expect(createTransactionSchema.safeParse({ ...base, amount: 0 }).success).toBe(false);
    expect(createTransactionSchema.safeParse({ ...base, amount: -5 }).success).toBe(false);
    expect(createTransactionSchema.safeParse({ ...base, amount: 10.999 }).success).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, type: "GIFT" }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, categoryId: "" }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({
        ...base,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }).success,
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, note: "x".repeat(201) }).success,
    ).toBe(false);
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

    expect(upsertBudgetSchema.safeParse({ ...base, month: "2026-13" }).success).toBe(
      false,
    );
    expect(upsertBudgetSchema.safeParse({ ...base, month: "Sep 2026" }).success).toBe(
      false,
    );
    expect(upsertBudgetSchema.safeParse({ ...base, limit: 0 }).success).toBe(false);
    expect(upsertBudgetSchema.safeParse({ ...base, limit: -10 }).success).toBe(false);
    expect(upsertBudgetSchema.safeParse({ ...base, categoryId: "" }).success).toBe(
      false,
    );
  });
});

describe("categorySchema", () => {
  it("accepts a valid name and hex color", () => {
    const parsed = categorySchema.safeParse({ name: "Food", color: "#7C5CFC" });

    expect(parsed.success).toBe(true);
  });

  it("rejects blank or long names and non-hex colors", () => {
    expect(categorySchema.safeParse({ name: "", color: "#7C5CFC" }).success).toBe(false);
    expect(categorySchema.safeParse({ name: "   ", color: "#7C5CFC" }).success).toBe(
      false,
    );
    expect(
      categorySchema.safeParse({ name: "x".repeat(41), color: "#7C5CFC" }).success,
    ).toBe(false);
    expect(categorySchema.safeParse({ name: "Food", color: "purple" }).success).toBe(
      false,
    );
    expect(categorySchema.safeParse({ name: "Food", color: "#FFF" }).success).toBe(
      false,
    );
  });
});
