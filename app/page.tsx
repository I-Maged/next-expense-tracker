import { headers } from "next/headers";

import { seedDefaultCategories } from "@/actions/categories";
import { BottomCta } from "@/components/homepage/BottomCta";
import { Features } from "@/components/homepage/Features";
import { Hero } from "@/components/homepage/Hero";
import type { HeroSummary } from "@/components/homepage/types";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { auth } from "@/lib/auth";
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

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const authenticated = session !== null;

  if (!authenticated) {
    return (
      <div className="flex min-h-full flex-col">
        <Navbar ctaHref="/signup" />
        <main className="flex flex-1 flex-col">
          <Hero authenticated={false} />
          <Features />
          <HowItWorks />
          <BottomCta authenticated={false} />
        </main>
        <Footer authenticated={false} />
      </div>
    );
  }

  await seedDefaultCategories();

  const month = monthKey(new Date());
  const { start: monthStart, end: monthEnd } = monthRange(month);

  const [expenseSum, incomeSum, spentRows, categoryRows] = await Promise.all([
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
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        date: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  const categoryById = new Map(
    categoryRows.map((category) => [category.id, category]),
  );

  const summary: HeroSummary = {
    spent: expenseSum._sum.amount?.toNumber() ?? 0,
    income: incomeSum._sum.amount?.toNumber() ?? 0,
    top: spentRows
      .map((row) => {
        const category = categoryById.get(row.categoryId);
        if (!category) return null;
        const total = row._sum.amount?.toNumber() ?? 0;
        if (total <= 0) return null;
        return { name: category.name, total, color: category.color };
      })
      .filter((row): row is HeroSummary["top"][number] => row !== null)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3),
  };

  return (
    <div className="flex min-h-full flex-col">
      <Navbar ctaHref="/dashboard" ctaLabel="Go to Dashboard" />
      <main className="flex flex-1 flex-col">
        <Hero authenticated summary={summary} />
      </main>
      <Footer authenticated />
    </div>
  );
}
