import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { seedDefaultCategories } from "@/actions/categories";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { CategoryManager } from "@/components/settings/CategoryManager";
import type { CategoryWithCount } from "@/components/settings/types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  await seedDefaultCategories();

  const categoryRows = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { transactions: true } } },
  });

  const categories: Array<CategoryWithCount> = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
    transactionCount: category._count.transactions,
  }));

  return (
    <div className="flex min-h-full flex-col">
      <AppNavbar activePath="/settings" userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <CategoryManager categories={categories} />
      </main>
    </div>
  );
}
