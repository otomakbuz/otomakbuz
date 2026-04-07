"use client";

import { useEffect, useState } from "react";
import { getBalanceSheet } from "@/lib/actions/reports";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { BalanceSheetData } from "@/types";

export function BalanceSheet() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBalanceSheet()
      .then(setData)
      .catch(() => toast.error("Bilanço yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-ink-faint py-8 text-center">Yükleniyor...</div>;

  if (!data || (data.assets.length === 0 && data.liabilities.length === 0 && data.equity.length === 0)) {
    return (
      <div className="text-center py-8">
        <p className="text-ink-muted text-sm">Bilanço verisi bulunamadı.</p>
        <p className="text-ink-faint text-xs mt-1">Onaylanmış yevmiye kayıtları olduğunda bilanço otomatik oluşur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sol: Varlıklar */}
        <div className="flex-1 rounded border border-paper-lines overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50/50 border-b border-paper-lines">
                <th colSpan={2} className="text-left px-4 py-3 font-semibold text-blue-800">AKTİF (VARLIKLAR)</th>
              </tr>
            </thead>
            <tbody>
              {data.assets.map((item) => (
                <tr key={item.code} className="border-b border-paper-lines last:border-0">
                  <td className="px-4 py-2 text-ink">
                    <span className="font-mono text-xs text-ink-muted mr-2">{item.code}</span>
                    {item.name}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-ink">{formatCurrency(item.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50/30 border-t-2 border-paper-lines font-bold">
                <td className="px-4 py-3 text-blue-800">TOPLAM AKTİF</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">{formatCurrency(data.totalAssets)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Sağ: Pasif */}
        <div className="flex-1 rounded border border-paper-lines overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-50/50 border-b border-paper-lines">
                <th colSpan={2} className="text-left px-4 py-3 font-semibold text-red-800">PASİF (KAYNAKLAR)</th>
              </tr>
            </thead>
            <tbody>
              {data.liabilities.length > 0 && (
                <>
                  <tr className="bg-surface/30 border-b border-paper-lines">
                    <td colSpan={2} className="px-4 py-1.5 text-xs font-medium text-ink-muted">Yabancı Kaynaklar</td>
                  </tr>
                  {data.liabilities.map((item) => (
                    <tr key={item.code} className="border-b border-paper-lines">
                      <td className="px-4 py-2 text-ink">
                        <span className="font-mono text-xs text-ink-muted mr-2">{item.code}</span>
                        {item.name}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-ink">{formatCurrency(item.balance)}</td>
                    </tr>
                  ))}
                </>
              )}
              {data.equity.length > 0 && (
                <>
                  <tr className="bg-surface/30 border-b border-paper-lines">
                    <td colSpan={2} className="px-4 py-1.5 text-xs font-medium text-ink-muted">Özkaynaklar</td>
                  </tr>
                  {data.equity.map((item) => (
                    <tr key={item.code} className="border-b border-paper-lines last:border-0">
                      <td className="px-4 py-2 text-ink">
                        <span className="font-mono text-xs text-ink-muted mr-2">{item.code}</span>
                        {item.name}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-ink">{formatCurrency(item.balance)}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-red-50/30 border-t-2 border-paper-lines font-bold">
                <td className="px-4 py-3 text-red-800">TOPLAM PASİF</td>
                <td className="px-4 py-3 text-right font-mono text-red-800">{formatCurrency(data.totalLiabilities + data.totalEquity)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Denge kontrolü */}
      <div className={`text-center py-2 rounded text-sm font-medium ${data.isBalanced ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
        {data.isBalanced
          ? "Bilanço dengede — Aktif = Pasif"
          : `Bilanço dengesiz — Fark: ${formatCurrency(Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)))}`}
      </div>
    </div>
  );
}
