"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/settings/CategoryForm";
import { DeleteCategoryDialog } from "@/components/settings/DeleteCategoryDialog";
import type { CategoryWithCount } from "@/components/settings/types";

type Props = {
  categories: Array<CategoryWithCount>;
};

export function CategoryManager({ categories }: Props) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState<CategoryWithCount | null>(null);

  function openAdd(): void {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-8 text-text-primary">
            Settings
          </h1>
          <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
            Manage your categories.
          </p>
        </div>
        <Button className="inline-flex items-center" onClick={openAdd}>
          <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium text-text-muted">
            No categories yet — add your first category
          </p>
          <Button onClick={openAdd}>Add your first category</Button>
        </div>
      ) : (
        <div className="card p-0">
          <ul data-testid="category-list" className="flex flex-col">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium leading-5 text-text-primary">
                      {category.name}
                    </span>
                    <span className="text-xs leading-4 text-text-muted">
                      {category.transactionCount === 0
                        ? "No transactions"
                        : `${category.transactionCount} transaction${category.transactionCount === 1 ? "" : "s"}`}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Edit category ${category.id}`}
                    className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
                    onClick={() => {
                      setEditing(category);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete category ${category.id}`}
                    className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-error"
                    onClick={() => {
                      setDeleting(category);
                    }}
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CategoryForm
        key={formOpen ? (editing?.id ?? "new") : "form-closed"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
        }}
        initial={editing}
        onSuccess={() => {
          router.refresh();
        }}
      />
      <DeleteCategoryDialog
        key={deleting?.id ?? "delete-closed"}
        open={deleting !== null}
        onClose={() => {
          setDeleting(null);
        }}
        category={deleting}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
