import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface IncomeExpenseCardProps {
  income: number;
  expense: number;
  net: number;
  currency?: string;
}

export function IncomeExpenseCard({ income, expense, net, currency = "TRY" }: IncomeExpenseCardProps) {
  const isPositive = net >= 0;

  return (
    <div className="receipt-card rounded p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-ink">Gelir / Gider Özeti</h3>
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <TrendingUp className="h-5 w-5 text-receipt-brown" />
        </div>
      </div>

      <div className="space-y-3">
        {/* Gelir */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm text-ink-muted">Gelir</span>
          </div>
          <span className="text-sm font-semibold text-emerald-600">
            +{formatCurrency(income, currency)}
          </span>
        </div>

        {/* Gider */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-sm text-ink-muted">Gider</span>
          </div>
          <span className="text-sm font-semibold text-red-600">
            -{formatCurrency(expense, currency)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-paper-lines" />

        {/* Net */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Net Durum</span>
          <span className={cn(
            "text-lg font-bold",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}>
            {isPositive ? "+" : ""}{formatCurrency(net, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
