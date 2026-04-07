"use client";

import { useRef, useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyTrend } from "@/types";

function MiniTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
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

export function MonthlyTrendMini({ data }: { data: MonthlyTrend[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function measure() {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-ink-faint">
        Henuz veri yok
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height: 200 }}>
      {width > 0 && (
        <BarChart width={width} height={200} data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8B7355" }} />
          <YAxis tick={{ fontSize: 10, fill: "#8B7355" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<MiniTooltip />} />
          <Bar dataKey="income" name="Gelir" fill="#059669" radius={[2, 2, 0, 0]} />
          <Bar dataKey="expense" name="Gider" fill="#DC2626" radius={[2, 2, 0, 0]} />
        </BarChart>
      )}
    </div>
  );
}
