"use client";

import { useState } from "react";

import { deleteBudget } from "@/actions/budgets";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { BudgetView } from "@/components/budgets/types";

type Props = {
  open: boolean;
  onClose: () => void;
  budget: BudgetView | null;
  onSuccess?: () => void;
};

export function DeleteBudgetDialog({
  open,
  onClose,
  budget,
  onSuccess,
}: Props) {
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleConfirm(): Promise<void> {
    if (budget == null) return;
    setFormError("");
    setPending(true);
    const result = await deleteBudget({ id: budget.id });
    setPending(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Delete budget">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium leading-5 text-text-secondary">
          {budget == null
            ? "Delete this budget? This cannot be undone."
            : `Delete the ${budget.month} budget for "${budget.category.name}" (${formatCurrency(budget.limit)})? This cannot be undone.`}
        </p>
        {formError !== "" && (
          <p role="alert" className="text-sm text-error">
            {formError}
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
