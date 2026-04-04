"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { CategoryBreakdown } from "@/types";

const FALLBACK_COLORS = [
  "#4A3728", "#A0845C", "#059669", "#DC2626", "#2563EB",
  "#7C3AED", "#D97706", "#0891B2", "#BE185D", "#64748B",
];

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryBreakdown }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="receipt-card rounded px-3 py-2 shadow-lg border border-paper-lines">
      <p className="text-xs font-medium text-ink mb-1">{d.category_name}</p>
      <p className="text-xs text-ink-muted">{formatCurrency(d.total_amount)} ({d.percentage}%)</p>
      <p className="text-xs text-ink-muted">{d.document_count} belge</p>
    </div>
  );
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-ink-faint">
        Henuz veri yok
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            dataKey="total_amount"
            nameKey="category_name"
            strokeWidth={2}
            stroke="#FFFDF8"
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.category_id}
                fill={entry.color !== "#94a3b8" ? entry.color : FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend table */}
      <div className="w-full lg:w-auto min-w-[200px]">
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={d.category_id} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: d.color !== "#94a3b8" ? d.color : FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
              />
              <span className="text-ink flex-1 truncate">{d.category_name}</span>
              <span className="text-ink-muted tabular-nums">{d.percentage}%</span>
              <span className="text-ink font-medium tabular-nums">{formatCurrency(d.total_amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
