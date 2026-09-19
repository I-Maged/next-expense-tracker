"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/utils";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "@/lib/validations";

const SEED_COLORS: Record<string, string> = {
  Food: "#EF4444",
  Transport: "#2B7FFF",
  Rent: "#7C5CFC",
  Utilities: "#00BC7D",
  Shopping: "#EC4899",
  Health: "#10B981",
  Entertainment: "#F59E0B",
  Other: "#6A7282",
};

type ActionResult = { success: true } | { success: false; error: string };

function isUniqueViolation(error: unknown): boolean {
  // Prisma throws unknown-shaped errors; narrow to code without importing client internals.
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function revalidateCategoryPaths(): void {
  revalidatePath("/settings");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
}

function deleteBlockedMessage(
  transactionCount: number,
  budgetCount: number,
): string {
  const parts: Array<string> = [];
  if (transactionCount > 0)
    parts.push(
      `${transactionCount} transaction${transactionCount === 1 ? "" : "s"}`,
    );
  if (budgetCount > 0)
    parts.push(`${budgetCount} budget${budgetCount === 1 ? "" : "s"}`);
  return `Cannot delete — ${parts.join(" and ")} use this category. Reassign or delete those first.`;
}

export async function seedDefaultCategories(): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const existing = await prisma.category.count({
      where: { userId: session.user.id },
    });
    if (existing > 0) return { success: true };

    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((name) => ({
        userId: session.user.id,
        name,
        color: SEED_COLORS[name] ?? "#6A7282",
      })),
    });
    return { success: true };
  } catch (error) {
    console.error("[actions/categories]", error);
    return { success: false, error: "Failed to seed categories" };
  }
}

export async function createCategory(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = createCategorySchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid category data" };

    const duplicate = await prisma.category.findFirst({
      where: { userId: session.user.id, name: parsed.data.name },
    });
    if (duplicate)
      return { success: false, error: "Category name already exists" };

    try {
      await prisma.category.create({
        data: {
          userId: session.user.id,
          name: parsed.data.name,
          color: parsed.data.color,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error))
        return { success: false, error: "Category name already exists" };
      throw error;
    }

    revalidateCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error("[actions/categories]", error);
    return { success: false, error: "Failed to save category" };
  }
}

export async function updateCategory(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = updateCategorySchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid category data" };

    const existing = await prisma.category.findFirst({
      where: { id: parsed.data.id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Category not found" };

    if (parsed.data.name !== existing.name) {
      const duplicate = await prisma.category.findFirst({
        where: {
          userId: session.user.id,
          name: parsed.data.name,
          id: { not: existing.id },
        },
      });
      if (duplicate)
        return { success: false, error: "Category name already exists" };
    }

    try {
      await prisma.category.update({
        where: { id: existing.id },
        data: { name: parsed.data.name, color: parsed.data.color },
      });
    } catch (error) {
      if (isUniqueViolation(error))
        return { success: false, error: "Category name already exists" };
      throw error;
    }

    revalidateCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error("[actions/categories]", error);
    return { success: false, error: "Failed to save category" };
  }
}

export async function deleteCategory(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = deleteCategorySchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid category data" };

    const existing = await prisma.category.findFirst({
      where: { id: parsed.data.id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Category not found" };

    const [transactionCount, budgetCount] = await Promise.all([
      prisma.transaction.count({
        where: { categoryId: existing.id, userId: session.user.id },
      }),
      prisma.budget.count({
        where: { categoryId: existing.id, userId: session.user.id },
      }),
    ]);
    if (transactionCount > 0 || budgetCount > 0)
      return {
        success: false,
        error: deleteBlockedMessage(transactionCount, budgetCount),
      };

    await prisma.category.delete({ where: { id: existing.id } });

    revalidateCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error("[actions/categories]", error);
    return { success: false, error: "Failed to delete category" };
  }
}
