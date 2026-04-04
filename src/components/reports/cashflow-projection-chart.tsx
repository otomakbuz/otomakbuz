"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { CashflowProjection } from "@/types";

interface CashflowProjectionChartProps {
  data: CashflowProjection[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="receipt-card rounded px-3 py-2 shadow-lg border border-paper-lines">
      <p className="text-xs font-medium text-ink mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export function CashflowProjectionChart({ data }: CashflowProjectionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-ink-faint">
        Henuz veri yok
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    shortLabel: d.label,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
        <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: "#8B7355" }} />
        <YAxis tick={{ fontSize: 11, fill: "#8B7355" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="projected_expense" name="Tahmini Gider" stroke="#DC2626" fill="#DC262620" strokeDasharray="5 5" />
        <Area type="monotone" dataKey="actual_expense" name="Gercek Gider" stroke="#DC2626" fill="#DC262640" />
        <Area type="monotone" dataKey="actual_income" name="Gercek Gelir" stroke="#059669" fill="#05966940" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
