"use client";

import { Brain, CheckCircle, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_LABELS: Record<string, string> = {
  supplier_name: "Firma Adı",
  supplier_tax_id: "VKN/TCKN",
  supplier_tax_office: "Vergi Dairesi",
  supplier_address: "Adres",
  document_number: "Belge No",
  issue_date: "Tarih",
  total_amount: "Toplam Tutar",
  vat_amount: "KDV Tutarı",
  vat_rate: "KDV Oranı",
  subtotal_amount: "Ara Toplam",
  payment_method: "Ödeme Yöntemi",
  document_type: "Belge Türü",
  buyer_name: "Alıcı Adı",
  buyer_tax_id: "Alıcı VKN",
  issue_time: "Saat",
  currency: "Para Birimi",
  line_items: "Kalemler",
};

interface AiPerformanceCardProps {
  totalProcessed: number;
  avgConfidence: number;
  highConfRate: number;
  fieldAccuracy: { field: string; avg: number }[];
}

export function AiPerformanceCard({
  totalProcessed,
  avgConfidence,
  highConfRate,
  fieldAccuracy,
}: AiPerformanceCardProps) {
  if (totalProcessed === 0) {
    return (
      <div className="receipt-card rounded p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-receipt-brown" />
          <h3 className="text-sm font-semibold text-ink">AI Performansı</h3>
        </div>
        <p className="text-sm text-ink-faint">Henüz işlenmiş belge yok.</p>
      </div>
    );
  }

  const topFields = fieldAccuracy.slice(0, 6);

  return (
    <div className="receipt-card rounded p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-receipt-brown" />
          <h3 className="text-sm font-semibold text-ink">AI Performansı</h3>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <BarChart3 className="h-5 w-5 text-receipt-brown" />
        </div>
      </div>

      {/* Üst metrikler */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 rounded bg-surface border border-paper-lines">
          <p className="text-2xl font-bold text-ink">{totalProcessed}</p>
          <p className="text-[10px] text-ink-muted mt-0.5">İşlenen Belge</p>
        </div>
        <div className="text-center p-3 rounded bg-surface border border-paper-lines">
          <p className={cn(
            "text-2xl font-bold",
            avgConfidence >= 85 ? "text-emerald-600" : avgConfidence >= 60 ? "text-amber-600" : "text-red-600"
          )}>
            %{avgConfidence}
          </p>
          <p className="text-[10px] text-ink-muted mt-0.5">Ort. Doğruluk</p>
        </div>
        <div className="text-center p-3 rounded bg-surface border border-paper-lines">
          <p className="text-2xl font-bold text-emerald-600">%{highConfRate}</p>
          <p className="text-[10px] text-ink-muted mt-0.5">Yüksek Güven</p>
        </div>
      </div>

      {/* Alan bazlı doğruluk barları */}
      {topFields.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">Alan Bazlı Doğruluk</p>
          {topFields.map(({ field, avg }) => (
            <div key={field} className="flex items-center gap-2">
              <span className="text-[11px] text-ink-muted w-24 truncate flex-shrink-0">
                {FIELD_LABELS[field] || field}
              </span>
              <div className="flex-1 h-2 rounded-full bg-paper-lines/40 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    avg >= 85 ? "bg-emerald-500" : avg >= 60 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${avg}%` }}
                />
              </div>
              <span className={cn(
                "text-[11px] font-medium w-8 text-right",
                avg >= 85 ? "text-emerald-600" : avg >= 60 ? "text-amber-600" : "text-red-600"
              )}>
                %{avg}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
