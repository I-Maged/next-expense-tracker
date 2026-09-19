import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { seedDefaultCategories } from "@/actions/categories";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import type { RecentTransactionView } from "@/components/dashboard/types";
import { auth } from "@/lib/auth";
import {
  MOCK_BUDGET_VS_ACTUAL,
  MOCK_CATEGORY_SPENDING,
  MOCK_INCOME_EXPENSE_TREND,
} from "@/lib/mockDashboard";
import { prisma } from "@/lib/prisma";
import { monthKey } from "@/lib/utils";

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

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  await seedDefaultCategories();

  const month = monthKey(new Date());
  const { start: monthStart, end: monthEnd } = monthRange(month);

  const [expenseSum, incomeSum, budgetRows, spentRows, recentRows] =
    await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId: session.user.id,
          type: "EXPENSE",
          date: { gte: monthStart, lt: monthEnd },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId: session.user.id,
          type: "INCOME",
          date: { gte: monthStart, lt: monthEnd },
        },
      }),
      prisma.budget.findMany({
        where: { userId: session.user.id, month },
        include: { category: true },
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
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

  const spent = expenseSum._sum.amount?.toNumber() ?? 0;
  const income = incomeSum._sum.amount?.toNumber() ?? 0;

  const spentByCategory = new Map(
    spentRows.map((row) => [row.categoryId, row._sum.amount?.toNumber() ?? 0]),
  );

  const overBudgetCount = budgetRows.filter(
    (row) => (spentByCategory.get(row.categoryId) ?? 0) > row.limit.toNumber(),
  ).length;

  const recent: Array<RecentTransactionView> = recentRows.map((row) => ({
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    note: row.note ?? "",
    type: row.type,
    amount: row.amount.toNumber(),
    categoryId: row.categoryId,
    category: {
      id: row.category.id,
      name: row.category.name,
      color: row.category.color,
    },
  }));

  return (
    <div className="flex min-h-full flex-col">
      <AppNavbar activePath="/dashboard" userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-360 flex-col gap-6 px-8 py-8">
        <DashboardView
          stats={{
            spent,
            income,
            balance: income - spent,
            overBudgetCount,
          }}
          categorySpending={MOCK_CATEGORY_SPENDING}
          trend={MOCK_INCOME_EXPENSE_TREND}
          budgetRows={MOCK_BUDGET_VS_ACTUAL}
          recent={recent}
          month={month}
        />
      </main>
    </div>
  );
}
