"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import type { TransactionTypeFilter } from "@/components/transactions/TransactionFilters";
import { TransactionsPagination } from "@/components/transactions/TransactionsPagination";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";
import type {
  CategoryView,
  TransactionView,
} from "@/components/transactions/types";

type Props = {
  transactions: Array<TransactionView>;
  categories: Array<CategoryView>;
  total: number;
  page: number;
  totalPages: number;
  start: number;
  end: number;
  search: string;
  categoryId: string;
  typeFilter: TransactionTypeFilter;
  month: string;
};

export function TransactionsView({
  transactions,
  categories,
  total,
  page,
  totalPages,
  start,
  end,
  search,
  categoryId,
  typeFilter,
  month,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionView | null>(null);
  const [deleting, setDeleting] = useState<TransactionView | null>(null);

  function pushQuery(next: Record<string, string | undefined>): void {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    router.push(query === "" ? pathname : `${pathname}?${query}`);
  }

  function pushFilter(next: {
    search?: string;
    categoryId?: string;
    typeFilter?: string;
    month?: string;
  }): void {
    pushQuery({ ...next, page: undefined });
  }

  function handleClearFilters(): void {
    pushQuery({
      search: undefined,
      categoryId: undefined,
      typeFilter: undefined,
      page: undefined,
    });
  }

  const filtersActive =
    search.trim() !== "" || categoryId !== "all" || typeFilter !== "ALL";

  function openAdd(): void {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-8 text-text-primary">
            Transactions
          </h1>
          <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
            Track every dollar in and out.
          </p>
        </div>
        <Button className="inline-flex items-center" onClick={openAdd}>
          <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {total === 0 && !filtersActive ? (
        <div className="card flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium text-text-muted">
            No transactions yet — add your first transaction
          </p>
          <Button onClick={openAdd}>Add your first transaction</Button>
        </div>
      ) : (
        <>
          <TransactionFilters
            search={search}
            onSearchChange={(value) => {
              pushFilter({ search: value });
            }}
            categoryId={categoryId}
            onCategoryChange={(value) => {
              pushFilter({ categoryId: value === "all" ? undefined : value });
            }}
            typeFilter={typeFilter}
            onTypeChange={(value) => {
              pushFilter({ typeFilter: value === "ALL" ? undefined : value });
            }}
            month={month}
            onMonthChange={(value) => {
              pushFilter({ month: value });
            }}
            categories={categories}
          />
          {total === 0 ? (
            <div className="card flex flex-col items-center gap-4 text-center">
              <p className="text-sm font-medium text-text-muted">
                No transactions match these filters.
              </p>
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <TransactionsTable
                transactions={transactions}
                onEdit={(transaction) => {
                  setEditing(transaction);
                  setFormOpen(true);
                }}
                onDelete={setDeleting}
              />
              <TransactionsPagination
                page={page}
                totalPages={totalPages}
                total={total}
                start={start}
                end={end}
                onPageChange={(nextPage) => {
                  pushQuery({
                    page: nextPage <= 1 ? undefined : String(nextPage),
                  });
                }}
              />
            </>
          )}
        </>
      )}

      <TransactionForm
        key={formOpen ? (editing?.id ?? "new") : "form-closed"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
        }}
        categories={categories}
        initial={editing}
        onSuccess={() => {
          router.refresh();
        }}
      />
      <DeleteTransactionDialog
        key={deleting?.id ?? "delete-closed"}
        open={deleting !== null}
        onClose={() => {
          setDeleting(null);
        }}
        transaction={deleting}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
