"use client";

import { useEffect, useState } from "react";
import { getVatSummary } from "@/lib/actions/reports";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { VatSummary as VatSummaryType } from "@/types";

const MONTH_NAMES = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function VatSummaryReport() {
  const [data, setData] = useState<VatSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function load() {
    setLoading(true);
    getVatSummary(month, year)
      .then(setData)
      .catch(() => toast.error("KDV özeti yüklenemedi"))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="h-9 px-3 rounded border border-paper-lines bg-paper text-sm flex-1 sm:flex-none">
          {MONTH_NAMES.slice(1).map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-9 px-3 rounded border border-paper-lines bg-paper text-sm flex-1 sm:flex-none">
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={load} className="text-sm text-receipt-brown hover:underline font-medium">Getir</button>
      </div>

      {loading ? (
        <div className="text-sm text-ink-faint py-8 text-center">Yükleniyor...</div>
      ) : !data || data.documentCount === 0 ? (
        <div className="text-center py-8 text-ink-muted text-sm">Bu dönem için belge bulunamadı.</div>
      ) : (
        <>
          {/* Özet kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded border border-paper-lines">
              <p className="text-xs text-ink-muted font-medium">Hesaplanan KDV (Satış)</p>
              <p className="text-lg font-bold text-emerald-700 mt-1">{formatCurrency(data.salesVat)}</p>
            </div>
            <div className="p-4 rounded border border-paper-lines">
              <p className="text-xs text-ink-muted font-medium">İndirilecek KDV (Alış)</p>
              <p className="text-lg font-bold text-red-700 mt-1">{formatCurrency(data.purchaseVat)}</p>
            </div>
            <div className="p-4 rounded border border-paper-lines">
              <p className="text-xs text-ink-muted font-medium">Ödenecek / Devreden KDV</p>
              <p className={`text-lg font-bold mt-1 ${data.netPayable >= 0 ? "text-red-700" : "text-emerald-700"}`}>
                {data.netPayable >= 0 ? formatCurrency(data.netPayable) : `${formatCurrency(Math.abs(data.netPayable))} (Devreden)`}
              </p>
            </div>
          </div>

          {/* KDV oranlarına göre detay */}
          <div className="rounded border border-paper-lines overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface/50 border-b border-paper-lines">
                  <th className="text-left px-4 py-2.5 font-medium text-ink-muted">KDV Oranı</th>
                  <th className="text-right px-4 py-2.5 font-medium text-ink-muted">Matrah</th>
                  <th className="text-right px-4 py-2.5 font-medium text-ink-muted">KDV Tutarı</th>
                  <th className="text-right px-4 py-2.5 font-medium text-ink-muted">Belge Sayısı</th>
                </tr>
              </thead>
              <tbody>
                {data.byRate.map((row) => (
                  <tr key={row.rate} className="border-b border-paper-lines last:border-0">
                    <td className="px-4 py-2 font-medium text-ink">%{row.rate}</td>
                    <td className="px-4 py-2 text-right font-mono text-ink">{formatCurrency(row.base)}</td>
                    <td className="px-4 py-2 text-right font-mono text-ink">{formatCurrency(row.vat)}</td>
                    <td className="px-4 py-2 text-right text-ink-muted">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-ink-faint">{MONTH_NAMES[data.month]} {data.year} — {data.documentCount} belge</p>
        </>
      )}
    </div>
  );
}
