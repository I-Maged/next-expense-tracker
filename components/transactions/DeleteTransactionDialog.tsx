"use client";

import { useState } from "react";

import { deleteTransaction } from "@/actions/transactions";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { TransactionView } from "@/components/transactions/types";

type Props = {
  open: boolean;
  onClose: () => void;
  transaction: TransactionView | null;
  onSuccess?: () => void;
};

export function DeleteTransactionDialog({
  open,
  onClose,
  transaction,
  onSuccess,
}: Props) {
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleConfirm(): Promise<void> {
    if (transaction == null) return;
    setFormError("");
    setPending(true);
    const result = await deleteTransaction({ id: transaction.id });
    setPending(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    onSuccess?.();
    onClose();
  }

  const sign = transaction?.type === "INCOME" ? "+" : "-";

  return (
    <Dialog open={open} onClose={onClose} title="Delete transaction">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium leading-5 text-text-secondary">
          {transaction == null
            ? "Delete this transaction? This cannot be undone."
            : `Delete "${transaction.note === "" ? "Untitled" : transaction.note}" (${sign}${formatCurrency(transaction.amount)})? This cannot be undone.`}
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
