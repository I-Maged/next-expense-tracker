"use client";

import { useState } from "react";

import { upsertBudget } from "@/actions/budgets";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  BudgetCategoryView,
  BudgetView,
} from "@/components/budgets/types";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Array<BudgetCategoryView>;
  month: string;
  initial?: BudgetView | null;
  onSuccess?: () => void;
};

export function BudgetForm({
  open,
  onClose,
  categories,
  month,
  initial,
  onSuccess,
}: Props) {
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [limit, setLimit] = useState(initial ? String(initial.limit) : "");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setFormError("");

    if (categoryId === "") {
      setFormError("Choose a category");
      return;
    }
    const parsedLimit = Number(limit);
    if (
      limit.trim() === "" ||
      !Number.isFinite(parsedLimit) ||
      parsedLimit <= 0
    ) {
      setFormError("Enter a limit greater than 0");
      return;
    }
    if (Math.round(parsedLimit * 100) !== parsedLimit * 100) {
      setFormError("Limit can have max 2 decimals");
      return;
    }

    setPending(true);
    const result = await upsertBudget({ categoryId, month, limit });
    setPending(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }
    onSuccess?.();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial != null ? "Edit budget" : "Set budget"}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="budget-category">Category</Label>
          <select
            id="budget-category"
            className="w-full"
            value={categoryId}
            disabled={initial != null}
            onChange={(event) => {
              setCategoryId(event.target.value);
            }}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="budget-limit">Monthly limit</Label>
          <Input
            id="budget-limit"
            inputMode="decimal"
            placeholder="0.00"
            autoFocus
            value={limit}
            onChange={(event) => {
              setLimit(event.target.value);
            }}
          />
        </div>
        {formError !== "" && (
          <p role="alert" className="text-sm text-error">
            {formError}
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending
              ? "Saving…"
              : initial != null
                ? "Save changes"
                : "Set budget"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
