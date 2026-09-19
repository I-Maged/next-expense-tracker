"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryView } from "@/components/transactions/types";

export type TransactionTypeFilter = "ALL" | "INCOME" | "EXPENSE";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  typeFilter: TransactionTypeFilter;
  onTypeChange: (value: TransactionTypeFilter) => void;
  month: string;
  onMonthChange: (value: string) => void;
  categories: Array<CategoryView>;
};

export function TransactionFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  typeFilter,
  onTypeChange,
  month,
  onMonthChange,
  categories,
}: Props) {
  return (
    <div className="card">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-search">Search</Label>
          <Input
            id="transaction-search"
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-category">Category</Label>
          <select
            id="transaction-category"
            className="w-full"
            value={categoryId}
            onChange={(event) => {
              onCategoryChange(event.target.value);
            }}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-type">Type</Label>
          <select
            id="transaction-type"
            className="w-full"
            value={typeFilter}
            onChange={(event) => {
              onTypeChange(event.target.value as TransactionTypeFilter);
            }}
          >
            <option value="ALL">All</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction-month">Month</Label>
          <Input
            id="transaction-month"
            type="month"
            value={month}
            onChange={(event) => {
              onMonthChange(event.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
