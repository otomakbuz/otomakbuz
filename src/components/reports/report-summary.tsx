import { formatCurrency } from "@/lib/utils";
import { FileText, Wallet, Receipt } from "lucide-react";
import type { Document } from "@/types";

export function ReportSummary({ documents }: { documents: Document[] }) {
  const totalAmount = documents.reduce((sum, d) => sum + (d.total_amount || 0), 0);
  const totalVat = documents.reduce((sum, d) => sum + (d.vat_amount || 0), 0);

  const categoryTotals = new Map<string, { name: string; color: string; total: number; count: number }>();
  documents.forEach((doc) => {
    if (doc.category) {
      const existing = categoryTotals.get(doc.category.id);
      if (existing) { existing.total += doc.total_amount || 0; existing.count += 1; }
      else { categoryTotals.set(doc.category.id, { name: doc.category.name, color: doc.category.color, total: doc.total_amount || 0, count: 1 }); }
    }
  });

  const supplierTotals = new Map<string, { total: number; count: number }>();
  documents.forEach((doc) => {
    const name = doc.supplier_name || "Bilinmiyor";
    const existing = supplierTotals.get(name);
    if (existing) { existing.total += doc.total_amount || 0; existing.count += 1; }
    else { supplierTotals.set(name, { total: doc.total_amount || 0, count: 1 }); }
  });

  return (
    <div className="space-y-6">
      {/* Top-level stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="receipt-card rounded p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-brand" />
            </div>
            <span className="text-sm font-medium text-ink-muted">Toplam Belge</span>
          </div>
          <p className="text-2xl font-bold text-ink tabular-nums">{documents.length}</p>
        </div>
        <div className="receipt-card rounded p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-ink-muted">Toplam Tutar</span>
          </div>
          <p className="text-2xl font-bold text-ink tabular-nums">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="receipt-card rounded p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-ink-muted">Toplam KDV</span>
          </div>
          <p className="text-2xl font-bold text-ink tabular-nums">{formatCurrency(totalVat)}</p>
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="receipt-card rounded">
          <div className="px-6 py-4 border-b border-paper-lines">
            <h3 className="font-semibold text-ink">Kategori Bazlı</h3>
          </div>
          <div className="p-6">
            {categoryTotals.size === 0 ? (
              <p className="text-sm text-ink-faint text-center py-4">Veri yok</p>
            ) : (
              <div className="space-y-3">
                {Array.from(categoryTotals.values()).sort((a, b) => b.total - a.total).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: cat.color }} />
                      <span className="text-ink">{cat.name}</span>
                      <span className="text-ink-faint">({cat.count})</span>
                    </div>
                    <span className="font-semibold text-ink tabular-nums">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="receipt-card rounded">
          <div className="px-6 py-4 border-b border-paper-lines">
            <h3 className="font-semibold text-ink">Firma Bazlı (En Yüksek 10)</h3>
          </div>
          <div className="p-6">
            {supplierTotals.size === 0 ? (
              <p className="text-sm text-ink-faint text-center py-4">Veri yok</p>
            ) : (
              <div className="space-y-3">
                {Array.from(supplierTotals.entries()).sort((a, b) => b[1].total - a[1].total).slice(0, 10).map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-ink">
                      {name} <span className="text-ink-faint">({data.count})</span>
                    </span>
                    <span className="font-semibold text-ink tabular-nums">{formatCurrency(data.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
