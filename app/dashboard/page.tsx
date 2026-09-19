import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { auth } from "@/lib/auth";
import {
  MOCK_BUDGET_VS_ACTUAL,
  MOCK_CATEGORY_SPENDING,
  MOCK_DASHBOARD_MONTH,
  MOCK_DASHBOARD_STATS,
  MOCK_INCOME_EXPENSE_TREND,
  MOCK_RECENT_TRANSACTIONS,
} from "@/lib/mockDashboard";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <AppNavbar activePath="/dashboard" userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-360 flex-col gap-6 px-8 py-8">
        <DashboardView
          stats={MOCK_DASHBOARD_STATS}
          categorySpending={MOCK_CATEGORY_SPENDING}
          trend={MOCK_INCOME_EXPENSE_TREND}
          budgetRows={MOCK_BUDGET_VS_ACTUAL}
          recent={MOCK_RECENT_TRANSACTIONS}
          month={MOCK_DASHBOARD_MONTH}
        />
      </main>
    </div>
  );
}
