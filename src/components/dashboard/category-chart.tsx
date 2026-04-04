import { formatCurrency } from "@/lib/utils";
import { PieChart, Tags } from "lucide-react";

interface CategoryChartProps { data: { name: string; color: string; total: number }[]; }

export function CategoryChart({ data }: CategoryChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="receipt-card rounded">
      <div className="px-6 py-4 border-b border-paper-lines">
        <h3 className="font-semibold text-ink">Kategori Dagilimi</h3>
      </div>
      <div className="p-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded bg-violet-50 flex items-center justify-center mb-4">
              <Tags className="h-7 w-7 text-violet-400" />
            </div>
            <p className="text-sm font-medium text-ink mb-1">Henuz veri yok</p>
            <p className="text-xs text-ink-faint text-center">Belgeler yuklendiginde kategori dagilimi burada gorunur.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.sort((a, b) => b.total - a.total).map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-ink font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-ink tabular-nums">{formatCurrency(item.total)}</span>
                </div>
                <div className="h-2 bg-paper-lines/40 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(item.total / maxTotal) * 100}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
