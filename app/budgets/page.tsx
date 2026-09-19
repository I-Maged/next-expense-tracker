import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { BudgetsView } from "@/components/budgets/BudgetsView";
import { auth } from "@/lib/auth";
import { MOCK_BUDGETS } from "@/lib/mockBudgets";

export default async function BudgetsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <AppNavbar activePath="/budgets" userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-360 flex-col gap-6 px-8 py-8">
        <BudgetsView budgets={MOCK_BUDGETS} />
      </main>
    </div>
  );
}
