import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Document } from "@/types";

interface OverdueInvoicesCardProps {
  overdue: Document[];
  dueSoon: Document[];
}

export function OverdueInvoicesCard({ overdue, dueSoon }: OverdueInvoicesCardProps) {
  if (overdue.length === 0 && dueSoon.length === 0) return null;

  const overdueTotal = overdue.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const dueSoonTotal = dueSoon.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <div className="receipt-card rounded p-5 border-l-4 border-l-red-400">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Fatura Uyarıları
        </h3>
        <Link href="/faturalarim" className="text-xs text-receipt-brown hover:underline flex items-center gap-1">
          Tümünü gör <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {overdue.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded bg-red-50 border border-red-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  {overdue.length} fatura vadesi geçmiş
                </p>
                <p className="text-xs text-red-600/70">
                  Toplam: {formatCurrency(overdueTotal)}
                </p>
              </div>
            </div>
          </div>
        )}

        {dueSoon.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded bg-orange-50 border border-orange-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-700">
                  {dueSoon.length} faturanın vadesi yaklaşıyor
                </p>
                <p className="text-xs text-orange-600/70">
                  Toplam: {formatCurrency(dueSoonTotal)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* İlk 3 vadesi geçmiş fatura */}
        {overdue.slice(0, 3).map((inv) => (
          <Link
            key={inv.id}
            href={`/belge/${inv.id}`}
            className="flex items-center justify-between px-3 py-2 rounded hover:bg-surface/50 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink truncate">{inv.buyer_name || "Alıcı"}</p>
              <p className="text-[10px] text-ink-faint font-mono">{inv.document_number}</p>
            </div>
            <span className="text-xs font-semibold text-red-600 whitespace-nowrap ml-2">
              {formatCurrency(inv.total_amount || 0)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
