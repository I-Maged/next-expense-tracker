"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import type { MockBudget } from "@/lib/mockBudgets";
import { monthKey } from "@/lib/utils";

type Props = {
  budgets: Array<MockBudget>;
};

export function BudgetsView({ budgets }: Props) {
  const [month, setMonth] = useState(monthKey(new Date()));
  const visible = budgets.filter((budget) => budget.month === month);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-8 text-text-primary">
            Budgets
          </h1>
          <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
            Set monthly limits and stay on track.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <Label htmlFor="budgets-month">Month</Label>
            <Input
              id="budgets-month"
              type="month"
              value={month}
              onChange={(event) => {
                if (event.target.value !== "") setMonth(event.target.value);
              }}
            />
          </div>
          <Button variant="secondary">Copy Last Month</Button>
          <Button className="inline-flex items-center">
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
            Set Budget
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium text-text-muted">
            No budgets this month — set your first budget
          </p>
          <Button>Set your first budget</Button>
        </div>
      ) : (
        <div
          data-testid="budget-grid"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {visible.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      )}
    </div>
  );
}
