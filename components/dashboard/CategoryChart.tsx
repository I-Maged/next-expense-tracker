"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";
import type { CategorySpendingView } from "@/components/dashboard/types";

type Props = {
  data: Array<CategorySpendingView>;
  month: string;
};

export function CategoryChart({ data, month }: Props) {
  return (
    <div data-testid="category-chart" className="card flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold leading-6 text-text-primary">
          Spending by Category
        </h2>
        <p className="text-xs leading-4 text-text-muted">
          Expenses by category · {month}
        </p>
      </div>
      {data.length === 0 ? (
        <p className="text-sm font-medium leading-5 text-text-muted">
          No data this month — add a transaction to see spending by category.
        </p>
      ) : (
        <div data-testid="category-chart-bars" className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#E7EAF3" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={{ stroke: "#E7EAF3" }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={{ stroke: "#E7EAF3" }}
              />
              <Tooltip
                formatter={(value) => {
                  const total = Array.isArray(value) ? value[0] : value;
                  return formatCurrency(Number(total));
                }}
              />
              <Bar dataKey="total" fill="#7C5CFC" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
