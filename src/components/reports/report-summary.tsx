import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
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
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Toplam Belge</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">{documents.length}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Toplam Tutar</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Toplam KDV</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">{formatCurrency(totalVat)}</p></CardContent>
      </Card>
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Kategori Bazli</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from(categoryTotals.values()).sort((a, b) => b.total - a.total).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name} ({cat.count})</span>
                </div>
                <span className="font-medium">{formatCurrency(cat.total)}</span>
              </div>
            ))}
            {categoryTotals.size === 0 && <p className="text-sm text-slate-400">Veri yok</p>}
          </div>
        </CardContent>
      </Card>
      <Card className="sm:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Firma Bazli (En Yuksek 10)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from(supplierTotals.entries()).sort((a, b) => b[1].total - a[1].total).slice(0, 10).map(([name, data]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span>{name} ({data.count})</span>
                <span className="font-medium">{formatCurrency(data.total)}</span>
              </div>
            ))}
            {supplierTotals.size === 0 && <p className="text-sm text-slate-400">Veri yok</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
