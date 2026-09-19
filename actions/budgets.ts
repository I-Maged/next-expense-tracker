"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shiftMonth } from "@/lib/utils";
import {
  copyLastMonthSchema,
  deleteBudgetSchema,
  upsertBudgetSchema,
} from "@/lib/validations";

type ActionResult = { success: true } | { success: false; error: string };

type CopyResult =
  | { success: true; copied: number; skipped: number }
  | { success: false; error: string };

function isUniqueViolation(error: unknown): boolean {
  // Prisma throws unknown-shaped errors; narrow to code without importing client internals.
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function revalidateBudgetPaths(): void {
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function upsertBudget(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = upsertBudgetSchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid budget data" };

    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId: session.user.id },
    });
    if (!category) return { success: false, error: "Category not found" };

    const existing = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId: parsed.data.categoryId,
        month: parsed.data.month,
      },
    });

    if (existing) {
      await prisma.budget.update({
        where: { id: existing.id },
        data: { limit: parsed.data.limit },
      });
    } else {
      try {
        await prisma.budget.create({
          data: {
            userId: session.user.id,
            categoryId: parsed.data.categoryId,
            month: parsed.data.month,
            limit: parsed.data.limit,
          },
        });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        const raced = await prisma.budget.findFirst({
          where: {
            userId: session.user.id,
            categoryId: parsed.data.categoryId,
            month: parsed.data.month,
          },
        });
        if (!raced) throw error;
        await prisma.budget.update({
          where: { id: raced.id },
          data: { limit: parsed.data.limit },
        });
      }
    }

    revalidateBudgetPaths();
    return { success: true };
  } catch (error) {
    console.error("[actions/budgets]", error);
    return { success: false, error: "Failed to save budget" };
  }
}

export async function deleteBudget(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = deleteBudgetSchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid budget data" };

    const existing = await prisma.budget.findFirst({
      where: { id: parsed.data.id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Budget not found" };

    await prisma.budget.delete({ where: { id: existing.id } });

    revalidateBudgetPaths();
    return { success: true };
  } catch (error) {
    console.error("[actions/budgets]", error);
    return { success: false, error: "Failed to delete budget" };
  }
}

export async function copyLastMonth(input: unknown): Promise<CopyResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = copyLastMonthSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid month" };

    const sourceMonth = shiftMonth(parsed.data.month, -1);
    const [sourceRows, targetRows] = await Promise.all([
      prisma.budget.findMany({
        where: { userId: session.user.id, month: sourceMonth },
      }),
      prisma.budget.findMany({
        where: { userId: session.user.id, month: parsed.data.month },
        select: { categoryId: true },
      }),
    ]);

    if (sourceRows.length === 0)
      return {
        success: false,
        error: `No budgets in ${sourceMonth} to copy`,
      };

    const targetCategoryIds = new Set(targetRows.map((row) => row.categoryId));
    const missing = sourceRows.filter(
      (row) => !targetCategoryIds.has(row.categoryId),
    );

    if (missing.length > 0) {
      await prisma.budget.createMany({
        data: missing.map((row) => ({
          userId: session.user.id,
          categoryId: row.categoryId,
          month: parsed.data.month,
          limit: row.limit,
        })),
        skipDuplicates: true,
      });
    }

    revalidateBudgetPaths();
    return {
      success: true,
      copied: missing.length,
      skipped: sourceRows.length - missing.length,
    };
  } catch (error) {
    console.error("[actions/budgets]", error);
    return { success: false, error: "Failed to copy budgets" };
  }
}
