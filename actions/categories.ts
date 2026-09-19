"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/utils";

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

export async function seedDefaultCategories(): Promise<
  { success: true } | { success: false; error: string }
> {
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
