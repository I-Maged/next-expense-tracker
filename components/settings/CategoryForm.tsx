"use client";

import { useState } from "react";

import { createCategory, updateCategory } from "@/actions/categories";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryWithCount } from "@/components/settings/types";
import { CATEGORY_COLORS, cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: CategoryWithCount | null;
  onSuccess?: () => void;
};

export function CategoryForm({ open, onClose, initial, onSuccess }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[2]);
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setFormError("");

    if (name.trim() === "") {
      setFormError("Enter a category name");
      return;
    }
    if (name.trim().length > 40) {
      setFormError("Name can have max 40 characters");
      return;
    }
    // State is a plain string; narrow to the palette tuple for includes.
    if (!CATEGORY_COLORS.includes(color as (typeof CATEGORY_COLORS)[number])) {
      setFormError("Choose a color");
      return;
    }

    setPending(true);
    const input =
      initial != null
        ? { id: initial.id, name: name.trim(), color }
        : { name: name.trim(), color };
    const result =
      initial != null
        ? await updateCategory(input)
        : await createCategory(input);
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
      title={initial != null ? "Edit category" : "Add category"}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category-name">Name</Label>
          <Input
            id="category-name"
            placeholder="e.g. Groceries"
            maxLength={40}
            autoFocus
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span
            id="category-color-label"
            className="text-sm font-medium leading-5 text-text-secondary"
          >
            Color
          </span>
          <div
            role="radiogroup"
            aria-labelledby="category-color-label"
            className="flex flex-wrap items-center gap-2"
          >
            {CATEGORY_COLORS.map((swatch) => {
              const selected = swatch === color;
              return (
                <button
                  key={swatch}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={swatch}
                  title={swatch}
                  onClick={() => {
                    setColor(swatch);
                  }}
                  style={{ backgroundColor: swatch }}
                  className={cn(
                    "h-6 w-6 rounded-full transition-shadow",
                    selected
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-surface"
                      : "border border-border",
                  )}
                />
              );
            })}
          </div>
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
                : "Add category"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
