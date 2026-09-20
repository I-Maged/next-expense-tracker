import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { seedDefaultCategories } from "@/actions/categories";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { BudgetsView } from "@/components/budgets/BudgetsView";
import type {
  BudgetCategoryView,
  BudgetView,
} from "@/components/budgets/types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthKey } from "@/lib/utils";

type PageSearchParams = {
  [key: string]: string | Array<string> | undefined;
};

function firstParam(
  value: string | Array<string> | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseMonth(value: string | undefined): string {
  if (value !== undefined && /^\d{4}-(0[1-9]|1[0-2])$/.test(value))
    return value;
  return monthKey(new Date());
}

function monthRange(month: string): { start: Date; end: Date } {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const start = new Date(year, monthIndex, 1);
  const end = new Date(
    monthIndex === 11 ? year + 1 : year,
    (monthIndex + 1) % 12,
    1,
  );
  return { start, end };
}

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  await seedDefaultCategories();

  const params = await searchParams;
  const month = parseMonth(firstParam(params.month));
  const { start: monthStart, end: monthEnd } = monthRange(month);

  const [categoryRows, budgetRows, spentRows] = await Promise.all([
    prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
    prisma.budget.findMany({
      where: { userId: session.user.id, month },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        date: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const spentByCategory = new Map(
    spentRows.map((row) => [row.categoryId, row._sum.amount?.toNumber() ?? 0]),
  );

  const budgets: Array<BudgetView> = budgetRows.map((row) => ({
    id: row.id,
    categoryId: row.categoryId,
    category: {
      id: row.category.id,
      name: row.category.name,
      color: row.category.color,
    },
    month: row.month,
    limit: row.limit.toNumber(),
    spent: spentByCategory.get(row.categoryId) ?? 0,
  }));

  const categories: Array<BudgetCategoryView> = categoryRows.map(
    (category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
    }),
  );

  return (
    <div className="flex min-h-full flex-col">
      <AppNavbar activePath="/budgets" userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <BudgetsView budgets={budgets} categories={categories} month={month} />
      </main>
    </div>
  );
}
