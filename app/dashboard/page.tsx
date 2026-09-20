import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { seedDefaultCategories } from "@/actions/categories";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import type {
  BudgetActualView,
  CategorySpendingView,
  MonthlyTrendView,
  RecentTransactionView,
} from "@/components/dashboard/types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthKey, shiftMonth } from "@/lib/utils";

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

  const trendMonths = Array.from({ length: 6 }, (_, index) =>
    shiftMonth(month, index - 5),
  );
  const trendRanges = trendMonths.map((trendMonth) => monthRange(trendMonth));

  const [
    expenseSum,
    incomeSum,
    budgetRows,
    spentRows,
    recentRows,
    categoryRows,
    ...trendSums
  ] = await Promise.all([
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
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
    ...trendRanges.flatMap(({ start, end }) => [
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId: session.user.id,
          type: "EXPENSE",
          date: { gte: start, lt: end },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId: session.user.id,
          type: "INCOME",
          date: { gte: start, lt: end },
        },
      }),
    ]),
  ]);

  const spent = expenseSum._sum.amount?.toNumber() ?? 0;
  const income = incomeSum._sum.amount?.toNumber() ?? 0;

  const spentByCategory = new Map(
    spentRows.map((row) => [row.categoryId, row._sum.amount?.toNumber() ?? 0]),
  );

  const overBudgetCount = budgetRows.filter(
    (row) => (spentByCategory.get(row.categoryId) ?? 0) > row.limit.toNumber(),
  ).length;

  const categoryById = new Map(
    categoryRows.map((category) => [category.id, category]),
  );

  const categorySpending: Array<CategorySpendingView> = spentRows
    .map((row) => {
      const category = categoryById.get(row.categoryId);
      if (!category) return null;
      const total = row._sum.amount?.toNumber() ?? 0;
      if (total <= 0) return null;
      return { name: category.name, total, color: category.color };
    })
    .filter((row): row is CategorySpendingView => row !== null)
    .sort((a, b) => b.total - a.total);

  const fullTrend: Array<MonthlyTrendView> = trendMonths.map(
    (trendMonth, index) => ({
      month: trendMonth,
      expense: trendSums[index * 2]._sum.amount?.toNumber() ?? 0,
      income: trendSums[index * 2 + 1]._sum.amount?.toNumber() ?? 0,
    }),
  );
  const trend: Array<MonthlyTrendView> =
    fullTrend.every((row) => row.income === 0 && row.expense === 0)
      ? []
      : fullTrend;

  const budgetActualRows: Array<BudgetActualView> = budgetRows.map((row) => ({
    id: row.id,
    categoryId: row.categoryId,
    category: {
      id: row.category.id,
      name: row.category.name,
      color: row.category.color,
    },
    limit: row.limit.toNumber(),
    spent: spentByCategory.get(row.categoryId) ?? 0,
  }));

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
          categorySpending={categorySpending}
          trend={trend}
          budgetRows={budgetActualRows}
          recent={recent}
          month={month}
        />
      </main>
    </div>
  );
}
