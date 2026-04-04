import Link from "next/link";
import { StatusBadge } from "@/components/documents/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Document } from "@/types";
import { ArrowRight, FileText, Upload } from "lucide-react";

export function RecentDocuments({ documents }: { documents: Document[] }) {
  return (
    <div className="receipt-card rounded">
      <div className="flex items-center justify-between px-6 py-4 border-b border-paper-lines">
        <h3 className="font-semibold text-ink">Son Belgeler</h3>
        <Link href="/belgeler" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-dark font-medium transition-colors">
          Tümünü Gör <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="p-2">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 rounded bg-receipt-gold/10 flex items-center justify-center mb-4">
              <Upload className="h-7 w-7 text-receipt-gold/60" />
            </div>
            <p className="text-sm font-medium text-ink mb-1">Henüz belge yok</p>
            <p className="text-xs text-ink-faint mb-4 text-center">İlk belgenizi yükleyerek başlayın.</p>
            <Link href="/yukle"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-receipt-gold/10 text-receipt-brown text-xs font-medium hover:bg-receipt-gold/15 transition-colors">
              <Upload className="h-3.5 w-3.5" />
              Belge Yükle
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-paper-lines/50">
            {documents.map((doc) => (
              <Link key={doc.id} href={`/belge/${doc.id}`}
                className="flex items-center justify-between p-3 rounded hover:bg-receipt-gold/5 transition-colors group">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-ink truncate group-hover:text-brand transition-colors">
                    {doc.supplier_name || "Belirtilmemiş"}
                  </p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    {doc.issue_date ? formatDate(doc.issue_date) : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {doc.total_amount !== null ? formatCurrency(doc.total_amount, doc.currency) : "-"}
                  </span>
                  <StatusBadge status={doc.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
