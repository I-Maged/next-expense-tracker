import { z } from "zod";

import { isMaxTwoDecimals } from "@/lib/utils";

const MAX_FUTURE_OFFSET_MS = 24 * 60 * 60 * 1000;

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce
    .number()
    .positive()
    .max(999999999.99)
    .refine(isMaxTwoDecimals, {
      message: "Max 2 decimals",
    }),
  categoryId: z.string().min(1),
  date: z.coerce
    .date()
    .refine((d) => d.getTime() <= Date.now() + MAX_FUTURE_OFFSET_MS, {
      message: "Date cannot be in the future",
    }),
  note: z.string().max(200).optional(),
});

export const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string().min(1),
});

export const deleteTransactionSchema = z.object({
  id: z.string().min(1),
});

export const upsertBudgetSchema = z.object({
  categoryId: z.string().min(1),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"),
  limit: z.coerce
    .number()
    .positive()
    .max(999999999.99)
    .refine(isMaxTwoDecimals, {
      message: "Max 2 decimals",
    }),
});

export const deleteBudgetSchema = z.object({
  id: z.string().min(1),
});

export const copyLastMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use #RRGGBB"),
});

export const createCategorySchema = categorySchema;

export const updateCategorySchema = categorySchema.extend({
  id: z.string().min(1),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1),
});
