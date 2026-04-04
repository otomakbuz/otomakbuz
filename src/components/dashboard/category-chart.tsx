import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface CategoryChartProps { data: { name: string; color: string; total: number }[]; }

export function CategoryChart({ data }: CategoryChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Kategori Dagilimi</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Henuz veri yok.</p>
        ) : (
          <div className="space-y-3">
            {data.sort((a, b) => b.total - a.total).map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">{formatCurrency(item.total)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(item.total / maxTotal) * 100}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
