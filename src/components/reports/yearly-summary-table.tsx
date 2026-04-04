"use client";

import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { YearlySummary } from "@/types";

interface YearlySummaryTableProps {
  data: YearlySummary[];
}

export function YearlySummaryTable({ data }: YearlySummaryTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-ink-faint">
        Henuz veri yok
      </div>
    );
  }

  const totals = data.reduce(
    (acc, d) => ({
      expense: acc.expense + d.expense,
      income: acc.income + d.income,
      net: acc.net + d.net,
      document_count: acc.document_count + d.document_count,
    }),
    { expense: 0, income: 0, net: 0, document_count: 0 }
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-paper-lines">
            <th className="text-left py-3 px-4 text-xs font-medium text-ink-muted">Yil</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-ink-muted">Belge</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-ink-muted">Gelir</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-ink-muted">Gider</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-ink-muted">Net</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.year} className="border-b border-paper-lines/50 hover:bg-receipt-gold/3 transition-colors">
              <td className="py-3 px-4 font-semibold text-ink">{d.year}</td>
              <td className="py-3 px-4 text-right text-ink-muted tabular-nums">{d.document_count}</td>
              <td className="py-3 px-4 text-right text-emerald-600 font-medium tabular-nums">
                {formatCurrency(d.income)}
              </td>
              <td className="py-3 px-4 text-right text-red-600 font-medium tabular-nums">
                {formatCurrency(d.expense)}
              </td>
              <td className="py-3 px-4 text-right">
                <span className={cn(
                  "inline-flex items-center gap-1 font-semibold tabular-nums",
                  d.net >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {d.net >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {formatCurrency(Math.abs(d.net))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-receipt-gold/5 font-semibold">
            <td className="py-3 px-4 text-ink">Toplam</td>
            <td className="py-3 px-4 text-right text-ink tabular-nums">{totals.document_count}</td>
            <td className="py-3 px-4 text-right text-emerald-600 tabular-nums">{formatCurrency(totals.income)}</td>
            <td className="py-3 px-4 text-right text-red-600 tabular-nums">{formatCurrency(totals.expense)}</td>
            <td className="py-3 px-4 text-right">
              <span className={cn(
                "inline-flex items-center gap-1 tabular-nums",
                totals.net >= 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {totals.net >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {formatCurrency(Math.abs(totals.net))}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
