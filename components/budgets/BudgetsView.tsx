"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { copyLastMonth } from "@/actions/budgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { DeleteBudgetDialog } from "@/components/budgets/DeleteBudgetDialog";
import type {
  BudgetCategoryView,
  BudgetView,
} from "@/components/budgets/types";
import { monthKey } from "@/lib/utils";

type Props = {
  budgets: Array<BudgetView>;
  categories: Array<BudgetCategoryView>;
  month: string;
};

export function BudgetsView({ budgets, categories, month }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetView | null>(null);
  const [deleting, setDeleting] = useState<BudgetView | null>(null);
  const [copyPending, setCopyPending] = useState(false);
  const [copyError, setCopyError] = useState("");

  function pushMonth(value: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === monthKey(new Date())) {
      params.delete("month");
    } else {
      params.set("month", value);
    }
    const query = params.toString();
    router.push(query === "" ? pathname : `${pathname}?${query}`);
  }

  function openAdd(): void {
    setEditing(null);
    setFormOpen(true);
  }

  async function handleCopy(): Promise<void> {
    setCopyError("");
    setCopyPending(true);
    const result = await copyLastMonth({ month });
    setCopyPending(false);
    if (!result.success) {
      setCopyError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-8 text-text-primary">
            Budgets
          </h1>
          <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
            Set monthly limits and stay on track.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <Label htmlFor="budgets-month">Month</Label>
            <Input
              id="budgets-month"
              type="month"
              value={month}
              onChange={(event) => {
                if (event.target.value !== "") pushMonth(event.target.value);
              }}
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleCopy}
            disabled={copyPending}
          >
            {copyPending ? "Copying…" : "Copy Last Month"}
          </Button>
          <Button className="inline-flex items-center" onClick={openAdd}>
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
            Set Budget
          </Button>
        </div>
      </div>

      {copyError !== "" && (
        <p role="alert" className="text-sm text-error">
          {copyError}
        </p>
      )}

      {budgets.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium text-text-muted">
            No budgets this month — set your first budget
          </p>
          <Button onClick={openAdd}>Set your first budget</Button>
        </div>
      ) : (
        <div
          data-testid="budget-grid"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={(item) => {
                setEditing(item);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <BudgetForm
        key={formOpen ? (editing?.id ?? "new") : "form-closed"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
        }}
        categories={categories}
        month={month}
        initial={editing}
        onSuccess={() => {
          router.refresh();
        }}
      />
      <DeleteBudgetDialog
        key={deleting?.id ?? "delete-closed"}
        open={deleting !== null}
        onClose={() => {
          setDeleting(null);
        }}
        budget={deleting}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
