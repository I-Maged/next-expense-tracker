"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createTransactionSchema,
  deleteTransactionSchema,
  updateTransactionSchema,
} from "@/lib/validations";

type ActionResult = { success: true } | { success: false; error: string };

function normalizeNote(note: string | undefined): string | undefined {
  if (note === undefined) return undefined;
  if (note.trim() === "") return undefined;
  return note;
}

export async function createTransaction(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = createTransactionSchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid transaction data" };

    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId: session.user.id },
    });
    if (!category) return { success: false, error: "Category not found" };

    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        categoryId: parsed.data.categoryId,
        type: parsed.data.type,
        amount: parsed.data.amount,
        date: parsed.data.date,
        note: normalizeNote(parsed.data.note),
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[actions/transactions]", error);
    return { success: false, error: "Failed to save transaction" };
  }
}

export async function updateTransaction(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = updateTransactionSchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid transaction data" };

    const existing = await prisma.transaction.findFirst({
      where: { id: parsed.data.id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Transaction not found" };

    if (parsed.data.categoryId !== existing.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: parsed.data.categoryId, userId: session.user.id },
      });
      if (!category) return { success: false, error: "Category not found" };
    }

    await prisma.transaction.update({
      where: { id: existing.id },
      data: {
        categoryId: parsed.data.categoryId,
        type: parsed.data.type,
        amount: parsed.data.amount,
        date: parsed.data.date,
        note: normalizeNote(parsed.data.note),
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[actions/transactions]", error);
    return { success: false, error: "Failed to save transaction" };
  }
}

export async function deleteTransaction(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Not authenticated" };

    const parsed = deleteTransactionSchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid transaction data" };

    const existing = await prisma.transaction.findFirst({
      where: { id: parsed.data.id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Transaction not found" };

    await prisma.transaction.delete({ where: { id: existing.id } });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[actions/transactions]", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}
