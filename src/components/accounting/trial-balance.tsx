"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { getTrialBalance } from "@/lib/actions/accounting";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { TrialBalanceRow } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  asset: "Varlık",
  liability: "Yükümlülük",
  equity: "Özkaynak",
  expense: "Gider",
  income: "Gelir",
};

export function TrialBalance() {
  const [rows, setRows] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function load() {
    setLoading(true);
    getTrialBalance(date)
      .then(setRows)
      .catch(() => toast.error("Mizan yüklenemedi"))
      .finally(() => setLoading(false));
  }

  const totalDebit = rows.reduce((s, r) => s + Number(r.total_debit), 0);
  const totalCredit = rows.reduce((s, r) => s + Number(r.total_credit), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-ink-muted font-medium">Tarih:</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 w-44 border-paper-lines bg-paper"
        />
        <button onClick={load} className="text-sm text-receipt-brown hover:underline font-medium">
          Yenile
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-ink-faint py-8 text-center">Yükleniyor...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-muted text-sm">Henüz onaylanmış yevmiye kaydı yok.</p>
          <p className="text-ink-faint text-xs mt-1">Yevmiye kayıtları onaylandığında mizan otomatik oluşur.</p>
        </div>
      ) : (
        <div className="rounded border border-paper-lines overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-surface/50 border-b border-paper-lines">
                <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted w-16 sm:w-20">Kod</th>
                <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted">Hesap Adı</th>
                <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted w-20 sm:w-24 hidden sm:table-cell">Tür</th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium text-ink-muted w-24 sm:w-32">Borç</th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium text-ink-muted w-24 sm:w-32">Alacak</th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium text-ink-muted w-24 sm:w-32">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.code} className="border-b border-paper-lines last:border-0 hover:bg-surface/30">
                  <td className="px-3 sm:px-4 py-2 font-mono text-xs font-semibold text-ink">{row.code}</td>
                  <td className="px-3 sm:px-4 py-2 text-ink">{row.name}</td>
                  <td className="px-3 sm:px-4 py-2 text-xs text-ink-muted hidden sm:table-cell">{TYPE_LABELS[row.account_type] || row.account_type}</td>
                  <td className="px-3 sm:px-4 py-2 text-right font-mono text-ink">{formatCurrency(Number(row.total_debit))}</td>
                  <td className="px-3 sm:px-4 py-2 text-right font-mono text-ink">{formatCurrency(Number(row.total_credit))}</td>
                  <td className={`px-3 sm:px-4 py-2 text-right font-mono font-medium ${Number(row.balance) >= 0 ? "text-ink" : "text-red-600"}`}>
                    {formatCurrency(Math.abs(Number(row.balance)))}
                    {Number(row.balance) < 0 ? " (A)" : Number(row.balance) > 0 ? " (B)" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface/80 border-t-2 border-paper-lines font-semibold">
                <td colSpan={3} className="px-4 py-3 text-ink">
                  Toplam
                  {isBalanced ? (
                    <span className="ml-2 text-xs text-emerald-600 font-medium">Dengeli</span>
                  ) : (
                    <span className="ml-2 text-xs text-red-600 font-medium">Dengesiz!</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-ink">{formatCurrency(totalDebit)}</td>
                <td className="px-4 py-3 text-right font-mono text-ink">{formatCurrency(totalCredit)}</td>
                <td className="px-4 py-3 text-right font-mono text-ink">{formatCurrency(Math.abs(totalDebit - totalCredit))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
