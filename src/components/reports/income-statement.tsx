"use client";

import { useEffect, useState } from "react";
import { getIncomeStatement } from "@/lib/actions/reports";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { IncomeStatementData } from "@/types";

export function IncomeStatement() {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    getIncomeStatement(dateFrom || undefined, dateTo || undefined)
      .then(setData)
      .catch(() => toast.error("Gelir tablosu yüklenemedi"))
      .finally(() => setLoading(false));
  }

  if (loading) return <div className="text-sm text-ink-faint py-8 text-center">Yükleniyor...</div>;
  if (!data) return <div className="text-sm text-ink-muted py-8 text-center">Veri bulunamadı.</div>;

  const marginPct = data.totalIncome > 0 ? ((data.netProfit / data.totalIncome) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          className="h-9 px-3 rounded border border-paper-lines bg-paper text-sm flex-1 sm:flex-none" placeholder="Başlangıç" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          className="h-9 px-3 rounded border border-paper-lines bg-paper text-sm flex-1 sm:flex-none" placeholder="Bitiş" />
        <button onClick={load} className="text-sm text-receipt-brown hover:underline font-medium">Filtrele</button>
      </div>

      <div className="rounded border border-paper-lines overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {/* Gelirler */}
            <tr className="bg-emerald-50/50 border-b border-paper-lines">
              <td colSpan={2} className="px-4 py-3 font-semibold text-emerald-800">A. GELİRLER</td>
            </tr>
            <tr className="border-b border-paper-lines">
              <td className="px-4 py-2 pl-8 text-ink">Toplam Gelir</td>
              <td className="px-4 py-2 text-right font-mono font-medium text-emerald-700">{formatCurrency(data.totalIncome)}</td>
            </tr>

            {/* Giderler */}
            <tr className="bg-red-50/50 border-b border-paper-lines">
              <td colSpan={2} className="px-4 py-3 font-semibold text-red-800">B. GİDERLER</td>
            </tr>
            {data.expenseBreakdown.map((item) => (
              <tr key={item.category} className="border-b border-paper-lines">
                <td className="px-4 py-2 pl-8 text-ink">{item.category}</td>
                <td className="px-4 py-2 text-right font-mono text-red-600">-{formatCurrency(item.amount)}</td>
              </tr>
            ))}
            <tr className="border-b border-paper-lines bg-surface/30">
              <td className="px-4 py-2 pl-8 font-medium text-ink">Toplam Gider</td>
              <td className="px-4 py-2 text-right font-mono font-medium text-red-700">-{formatCurrency(data.totalExpense)}</td>
            </tr>

            {/* KDV */}
            <tr className="border-b border-paper-lines">
              <td className="px-4 py-2 text-ink-muted">Toplam KDV</td>
              <td className="px-4 py-2 text-right font-mono text-ink-muted">{formatCurrency(data.totalVat)}</td>
            </tr>

            {/* Net Kâr */}
            <tr className="bg-surface/80 border-t-2 border-paper-lines">
              <td className="px-4 py-3 font-bold text-ink text-base">
                DÖNEM NET {data.netProfit >= 0 ? "KÂRI" : "ZARARI"}
                <span className="ml-2 text-xs text-ink-muted font-normal">Marj: %{marginPct}</span>
              </td>
              <td className={`px-4 py-3 text-right font-mono font-bold text-base ${data.netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {data.netProfit >= 0 ? formatCurrency(data.netProfit) : `-${formatCurrency(Math.abs(data.netProfit))}`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
