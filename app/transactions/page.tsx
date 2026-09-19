import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { seedDefaultCategories } from "@/actions/categories";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { TransactionsView } from "@/components/transactions/TransactionsView";
import type { TransactionTypeFilter } from "@/components/transactions/TransactionFilters";
import type {
  CategoryView,
  TransactionView,
} from "@/components/transactions/types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TRANSACTIONS_PER_PAGE, monthKey } from "@/lib/utils";

type PageSearchParams = {
  [key: string]: string | Array<string> | undefined;
};

function firstParam(
  value: string | Array<string> | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseTypeFilter(value: string | undefined): TransactionTypeFilter {
  if (value === "INCOME" || value === "EXPENSE") return value;
  return "ALL";
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

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  await seedDefaultCategories();

  const params = await searchParams;
  const search = (firstParam(params.search) ?? "").trim();
  const rawCategory = firstParam(params.category) ?? "all";
  const categoryId = rawCategory === "" ? "all" : rawCategory;
  const typeFilter = parseTypeFilter(firstParam(params.type));
  const month = parseMonth(firstParam(params.month));
  const rawPage = Number.parseInt(firstParam(params.page) ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const { start: monthStart, end: monthEnd } = monthRange(month);

  const where = {
    userId: session.user.id,
    date: { gte: monthStart, lt: monthEnd },
    ...(categoryId !== "all" ? { categoryId } : {}),
    ...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
    ...(search !== ""
      ? { note: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [total, rows, categoryRows] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      take: TRANSACTIONS_PER_PAGE,
      skip: (page - 1) * TRANSACTIONS_PER_PAGE,
    }),
    prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / TRANSACTIONS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * TRANSACTIONS_PER_PAGE + 1;
  const end = Math.min(safePage * TRANSACTIONS_PER_PAGE, total);

  const transactions: Array<TransactionView> = rows.map((row) => ({
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

  const categories: Array<CategoryView> = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
  }));

  return (
    <div className="flex min-h-full flex-col">
      <AppNavbar activePath="/transactions" userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-360 flex-col gap-6 px-8 py-8">
        <TransactionsView
          transactions={transactions}
          categories={categories}
          total={total}
          page={safePage}
          totalPages={totalPages}
          start={start}
          end={end}
          search={search}
          categoryId={categoryId}
          typeFilter={typeFilter}
          month={month}
        />
      </main>
    </div>
  );
}
