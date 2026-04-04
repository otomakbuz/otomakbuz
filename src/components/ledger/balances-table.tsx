"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Building2, ArrowRight, Scale } from "lucide-react";
import type { ContactBalance } from "@/types";

interface BalancesTableProps {
  balances: ContactBalance[];
}

export function BalancesTable({ balances }: BalancesTableProps) {
  if (balances.length === 0) {
    return (
      <div className="receipt-card rounded">
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-16 h-16 rounded bg-receipt-gold/10 flex items-center justify-center mb-4">
            <Scale className="h-7 w-7 text-receipt-gold/60" />
          </div>
          <p className="text-sm font-medium text-ink mb-1">Henüz cari hareket yok</p>
          <p className="text-xs text-ink-faint text-center max-w-sm">
            Belgeler doğrulandığında firmalarla ilişkili cari hareketler otomatik oluşur.
            Rehber&apos;den firma ekleyip belge bağlayarak başlayabilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  // Genel toplam
  const totals = balances.reduce(
    (acc, b) => ({
      debit: acc.debit + b.total_debit,
      credit: acc.credit + b.total_credit,
      balance: acc.balance + b.balance,
    }),
    { debit: 0, credit: 0, balance: 0 }
  );

  return (
    <div className="space-y-4">
      {/* Toplam ozet */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="receipt-card rounded p-4 flex items-center justify-between">
          <span className="text-xs text-ink-muted">Toplam Borc</span>
          <span className="text-sm font-bold text-red-600">{formatCurrency(totals.debit)}</span>
        </div>
        <div className="receipt-card rounded p-4 flex items-center justify-between">
          <span className="text-xs text-ink-muted">Toplam Alacak</span>
          <span className="text-sm font-bold text-emerald-600">{formatCurrency(totals.credit)}</span>
        </div>
        <div className="receipt-card rounded p-4 flex items-center justify-between">
          <span className="text-xs text-ink-muted">Net Bakiye</span>
          <span className={cn("text-sm font-bold", totals.balance >= 0 ? "text-emerald-600" : "text-red-600")}>
            {totals.balance >= 0 ? "+" : ""}{formatCurrency(totals.balance)}
          </span>
        </div>
      </div>

      {/* Firma listesi */}
      <div className="receipt-card rounded overflow-hidden">
        <div className="px-5 py-3.5 border-b border-paper-lines">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-ink-muted">
            <div className="col-span-4">Firma</div>
            <div className="col-span-2 text-right">Borc</div>
            <div className="col-span-2 text-right">Alacak</div>
            <div className="col-span-2 text-right">Bakiye</div>
            <div className="col-span-2 text-right">Son Hareket</div>
          </div>
        </div>
        <div className="divide-y divide-paper-lines/50">
          {balances.map((b) => (
            <Link
              key={b.contact_id}
              href={`/cari/${b.contact_id}`}
              className="grid grid-cols-12 gap-4 items-center px-5 py-3.5 hover:bg-receipt-gold/3 transition-colors group"
            >
              <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded bg-receipt-gold/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-receipt-brown" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate group-hover:text-receipt-brown transition-colors">
                    {b.company_name}
                  </p>
                  <p className="text-xs text-ink-faint">{b.entry_count} hareket</p>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm tabular-nums text-red-600">{formatCurrency(b.total_debit)}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm tabular-nums text-emerald-600">{formatCurrency(b.total_credit)}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  b.balance >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {b.balance >= 0 ? "+" : ""}{formatCurrency(b.balance)}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="text-xs text-ink-faint">
                  {b.last_entry_date ? formatDate(b.last_entry_date) : "-"}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
