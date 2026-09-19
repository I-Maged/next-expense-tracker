"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";
import type { MonthlyTrendView } from "@/components/dashboard/types";

type Props = {
  data: Array<MonthlyTrendView>;
};

export function TrendChart({ data }: Props) {
  return (
    <div data-testid="trend-chart" className="card flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold leading-6 text-text-primary">
          Income vs Expense
        </h2>
        <p className="text-xs leading-4 text-text-muted">Last 6 months</p>
      </div>
      {data.length === 0 ? (
        <p className="text-sm font-medium leading-5 text-text-muted">
          No data yet — add a transaction to see income versus expense.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "#10B981" }}
              />
              Income
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "#7C5CFC" }}
              />
              Expense
            </span>
          </div>
          <div data-testid="trend-chart-lines" className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <CartesianGrid stroke="#E7EAF3" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E7EAF3" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E7EAF3" }}
                />
                <Tooltip
                  formatter={(value) => {
                    const amount = Array.isArray(value) ? value[0] : value;
                    return formatCurrency(Number(amount));
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#7C5CFC"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
