import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce
    .number()
    .positive()
    .max(999999999.99)
    .refine((n) => Math.round(n * 100) === n * 100, {
      message: "Max 2 decimals",
    }),
  categoryId: z.string().min(1),
  date: z.coerce.date().refine((d) => d.getTime() <= Date.now(), {
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
  limit: z.number().positive().max(999999999.99),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use #RRGGBB"),
});
