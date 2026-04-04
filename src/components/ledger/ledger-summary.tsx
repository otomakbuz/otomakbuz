import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { BalanceSummary } from "@/types";

interface LedgerSummaryProps {
  summary: BalanceSummary;
  currency?: string;
}

export function LedgerSummary({ summary, currency = "TRY" }: LedgerSummaryProps) {
  const isPositive = summary.balance >= 0;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {/* Borc (Debit) */}
      <div className="receipt-card rounded p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded bg-red-50 flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-ink-muted">Toplam Borc</p>
            <p className="text-xs text-ink-faint">Firmadan alinan</p>
          </div>
        </div>
        <p className="text-xl font-bold text-red-600">
          {formatCurrency(summary.debit, currency)}
        </p>
      </div>

      {/* Alacak (Credit) */}
      <div className="receipt-card rounded p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded bg-emerald-50 flex items-center justify-center">
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-ink-muted">Toplam Alacak</p>
            <p className="text-xs text-ink-faint">Firmaya satilan</p>
          </div>
        </div>
        <p className="text-xl font-bold text-emerald-600">
          {formatCurrency(summary.credit, currency)}
        </p>
      </div>

      {/* Bakiye */}
      <div className="receipt-card rounded p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded bg-receipt-gold/12 flex items-center justify-center">
            <Scale className="h-4 w-4 text-receipt-brown" />
          </div>
          <div>
            <p className="text-xs text-ink-muted">Net Bakiye</p>
            <p className="text-xs text-ink-faint">{isPositive ? "Alacakli" : "Borclu"}</p>
          </div>
        </div>
        <p className={cn("text-xl font-bold", isPositive ? "text-emerald-600" : "text-red-600")}>
          {isPositive ? "+" : ""}{formatCurrency(summary.balance, currency)}
        </p>
      </div>
    </div>
  );
}
