"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { SupplierRanking } from "@/types";

interface SupplierRankingChartProps {
  data: SupplierRanking[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: SupplierRanking }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="receipt-card rounded px-3 py-2 shadow-lg border border-paper-lines">
      <p className="text-xs font-medium text-ink mb-1">{d.company_name}</p>
      <p className="text-xs text-ink-muted">Toplam: {formatCurrency(d.total_amount)}</p>
      <p className="text-xs text-ink-muted">Ort: {formatCurrency(d.avg_amount)}</p>
      <p className="text-xs text-ink-muted">{d.document_count} belge</p>
    </div>
  );
}

export function SupplierRankingChart({ data }: SupplierRankingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-ink-faint">
        Henuz veri yok
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    shortName: d.company_name.length > 12 ? d.company_name.slice(0, 12) + "..." : d.company_name,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#8B7355" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="shortName" width={100} tick={{ fontSize: 11, fill: "#8B7355" }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total_amount" fill="#A0845C" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
