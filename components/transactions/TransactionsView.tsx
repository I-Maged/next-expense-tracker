"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { MockCategory, MockTransaction } from "@/lib/mockTransactions";
import { TRANSACTIONS_PER_PAGE } from "@/lib/utils";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import type { TransactionTypeFilter } from "@/components/transactions/TransactionFilters";
import { TransactionsPagination } from "@/components/transactions/TransactionsPagination";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";

type Props = {
  transactions: Array<MockTransaction>;
  categories: Array<MockCategory>;
};

export function TransactionsView({ transactions, categories }: Props) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("ALL");
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (
          search.trim() !== "" &&
          !transaction.note.toLowerCase().includes(search.trim().toLowerCase())
        ) {
          return false;
        }
        if (categoryId !== "all" && transaction.categoryId !== categoryId) {
          return false;
        }
        if (typeFilter !== "ALL" && transaction.type !== typeFilter) {
          return false;
        }
        if (month !== "" && !transaction.date.startsWith(month)) {
          return false;
        }
        return true;
      }),
    [transactions, search, categoryId, typeFilter, month],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / TRANSACTIONS_PER_PAGE),
  );
  const safePage = Math.min(page, totalPages);
  const start =
    filtered.length === 0 ? 0 : (safePage - 1) * TRANSACTIONS_PER_PAGE + 1;
  const end = Math.min(safePage * TRANSACTIONS_PER_PAGE, filtered.length);
  const paged = filtered.slice(start - 1, end);

  function handleClearFilters(): void {
    setSearch("");
    setCategoryId("all");
    setTypeFilter("ALL");
    setMonth("");
    setPage(1);
  }

  if (transactions.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-text-muted">
          No transactions yet — add your first transaction
        </p>
        <Button>Add your first transaction</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TransactionFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(value) => {
          setCategoryId(value);
          setPage(1);
        }}
        typeFilter={typeFilter}
        onTypeChange={(value) => {
          setTypeFilter(value);
          setPage(1);
        }}
        month={month}
        onMonthChange={(value) => {
          setMonth(value);
          setPage(1);
        }}
        categories={categories}
      />
      {filtered.length === 0 ? (
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
          <TransactionsTable transactions={paged} />
          <TransactionsPagination
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            start={start}
            end={end}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
