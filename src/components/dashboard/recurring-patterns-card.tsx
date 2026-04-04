"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { RefreshCw, Repeat, Calendar, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectRecurringPatterns, deactivatePattern } from "@/lib/actions/patterns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { RecurringPattern } from "@/types";

const frequencyLabels: Record<string, string> = {
  weekly: "Haftalık",
  monthly: "Aylık",
  quarterly: "3 Aylık",
  yearly: "Yıllık",
};

const frequencyColors: Record<string, string> = {
  weekly: "bg-violet-50 text-violet-700 border-violet-200/60",
  monthly: "bg-blue-50 text-blue-700 border-blue-200/60",
  quarterly: "bg-amber-50 text-amber-700 border-amber-200/60",
  yearly: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
};

interface RecurringPatternsCardProps {
  patterns: RecurringPattern[];
}

export function RecurringPatternsCard({ patterns: initialPatterns }: RecurringPatternsCardProps) {
  const router = useRouter();
  const [patterns, setPatterns] = useState(initialPatterns);
  const [detecting, setDetecting] = useState(false);

  async function handleDetect() {
    setDetecting(true);
    try {
      const result = await detectRecurringPatterns();
      setPatterns(result);
      toast.success(`${result.length} tekrarlayan harcama tespit edildi`);
      router.refresh();
    } catch {
      toast.error("Tespit hatası");
    } finally {
      setDetecting(false);
    }
  }

  async function handleDismiss(id: string) {
    try {
      await deactivatePattern(id);
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      toast.success("Harcama şablonu kaldırıldı");
    } catch {
      toast.error("Hata");
    }
  }

  return (
    <div className="receipt-card rounded">
      <div className="flex items-center justify-between px-5 py-4 border-b border-paper-lines">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-receipt-brown" />
          <h3 className="font-semibold text-ink text-sm">Tekrarlayan Harcamalar</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDetect}
          disabled={detecting}
          className="text-xs gap-1.5 text-ink-muted hover:text-ink"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", detecting && "animate-spin")} />
          {detecting ? "Taranıyor..." : "Yeniden Tara"}
        </Button>
      </div>

      <div className="p-2">
        {patterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6">
            <div className="w-12 h-12 rounded bg-receipt-gold/10 flex items-center justify-center mb-3">
              <Repeat className="h-5 w-5 text-receipt-gold/50" />
            </div>
            <p className="text-sm font-medium text-ink mb-1">Henüz tekrarlayan harcama yok</p>
            <p className="text-xs text-ink-faint text-center max-w-xs">
              Aynı firmaya 3+ belge yüklendiğinde tekrarlayan harcamalar otomatik tespit edilir.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {patterns.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-receipt-gold/3 transition-colors group">
                <div className="w-8 h-8 rounded bg-receipt-gold/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-receipt-brown" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {p.company_name || p.pattern_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
                      frequencyColors[p.frequency] || frequencyColors.monthly
                    )}>
                      {frequencyLabels[p.frequency] || p.frequency}
                    </span>
                    {p.next_expected && (
                      <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                        <Calendar className="h-3 w-3" />
                        Sonraki: {formatDate(p.next_expected)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-ink tabular-nums">
                    ~{formatCurrency(p.avg_amount)}
                  </p>
                  <p className="text-[10px] text-ink-faint">{p.occurrence_count}x</p>
                </div>
                <button
                  onClick={() => handleDismiss(p.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint hover:text-red-500 p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
