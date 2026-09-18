import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { TransactionsView } from "@/components/transactions/TransactionsView";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { MOCK_CATEGORIES, MOCK_TRANSACTIONS } from "@/lib/mockTransactions";

export default async function TransactionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <AppNavbar activePath="/transactions" userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-360 flex-col gap-6 px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold leading-8 text-text-primary">
              Transactions
            </h1>
            <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
              Track every dollar in and out.
            </p>
          </div>
          <Button className="inline-flex items-center">
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
        <TransactionsView
          transactions={MOCK_TRANSACTIONS}
          categories={MOCK_CATEGORIES}
        />
      </main>
    </div>
  );
}
