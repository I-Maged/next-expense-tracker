"use client";

import { useState } from "react";

import { deleteCategory } from "@/actions/categories";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CategoryWithCount } from "@/components/settings/types";

type Props = {
  open: boolean;
  onClose: () => void;
  category: CategoryWithCount | null;
  onSuccess?: () => void;
};

export function DeleteCategoryDialog({
  open,
  onClose,
  category,
  onSuccess,
}: Props) {
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleConfirm(): Promise<void> {
    if (category == null) return;
    setFormError("");
    setPending(true);
    const result = await deleteCategory({ id: category.id });
    setPending(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Delete category">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium leading-5 text-text-secondary">
          {category == null
            ? "Delete this category? This cannot be undone."
            : category.transactionCount > 0
              ? `Delete "${category.name}" (${category.transactionCount} transaction${category.transactionCount === 1 ? "" : "s"})? This cannot be undone.`
              : `Delete "${category.name}"? This cannot be undone.`}
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
