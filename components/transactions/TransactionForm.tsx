"use client";

import { useState } from "react";

import { createTransaction, updateTransaction } from "@/actions/transactions";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CategoryView,
  TransactionView,
} from "@/components/transactions/types";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Array<CategoryView>;
  initial?: TransactionView | null;
  onSuccess?: () => void;
};

function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function TransactionForm({
  open,
  onClose,
  categories,
  initial,
  onSuccess,
}: Props) {
  const [type, setType] = useState<"EXPENSE" | "INCOME">(
    initial?.type ?? "EXPENSE",
  );
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [date, setDate] = useState(initial?.date ?? todayKey());
  const [note, setNote] = useState(initial?.note ?? "");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const today = todayKey();

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setFormError("");

    const parsedAmount = Number(amount);
    if (
      amount.trim() === "" ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setFormError("Enter an amount greater than 0");
      return;
    }
    if (Math.round(parsedAmount * 100) !== parsedAmount * 100) {
      setFormError("Amount can have max 2 decimals");
      return;
    }
    if (categoryId === "") {
      setFormError("Choose a category");
      return;
    }
    if (date === "" || date > today) {
      setFormError("Date cannot be in the future");
      return;
    }
    if (note.length > 200) {
      setFormError("Note can have max 200 characters");
      return;
    }

    setPending(true);
    const input = { type, amount, categoryId, date, note };
    const result =
      initial != null
        ? await updateTransaction({ ...input, id: initial.id })
        : await createTransaction(input);
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
      title={initial != null ? "Edit transaction" : "Add transaction"}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Type">
          {(["EXPENSE", "INCOME"] as const).map((option) => (
            <Button
              key={option}
              variant={option === type ? "primary" : "secondary"}
              aria-pressed={option === type}
              onClick={() => {
                setType(option);
              }}
            >
              {option === "EXPENSE" ? "Expense" : "Income"}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-amount">Amount</Label>
          <Input
            id="transaction-amount"
            inputMode="decimal"
            placeholder="0.00"
            autoFocus
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-form-category">Category</Label>
          <select
            id="transaction-form-category"
            className="w-full"
            value={categoryId}
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
          <Label htmlFor="transaction-form-date">Date</Label>
          <Input
            id="transaction-form-date"
            type="date"
            max={today}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-form-note">Note</Label>
          <Input
            id="transaction-form-note"
            placeholder="Optional note"
            maxLength={200}
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
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
                : "Add transaction"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
