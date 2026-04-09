"use client";

import { Brain, TrendingUp, Target, BarChart3, FileCheck, Clock } from "lucide-react";
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
  buyer_tax_office: "Alıcı V. Dairesi",
  buyer_address: "Alıcı Adres",
  issue_time: "Saat",
  currency: "Para Birimi",
  line_items: "Kalemler",
  withholding_amount: "Stopaj",
  waybill_number: "İrsaliye No",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  fatura: "Fatura",
  fis: "Fiş",
  e_fatura: "E-Fatura",
  e_arsiv: "E-Arşiv",
  serbest_meslek_makbuzu: "Serbest Meslek Makbuzu",
  gider_pusulasi: "Gider Pusulası",
  diger: "Diğer",
  bilinmeyen: "Bilinmeyen",
};

interface AiPerformanceDashboardProps {
  stats: {
    totalProcessed: number;
    avgConfidence: number;
    highConfRate: number;
    fieldAccuracy: { field: string; avg: number; count: number }[];
    monthlyTrend: { month: string; avg: number; count: number }[];
    docTypeAccuracy: { type: string; avg: number; count: number }[];
    confidenceDistribution: { high: number; medium: number; low: number; unread: number };
    recentDocuments: { id: string; supplier_name: string | null; confidence_score: number; created_at: string; document_type: string | null }[];
  };
}

function StatBox({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="receipt-card rounded p-5 text-center">
      <p className={cn("text-3xl font-bold", color || "text-ink")}>{value}</p>
      <p className="text-xs text-ink-muted mt-1">{label}</p>
      {sub && <p className="text-[10px] text-ink-faint mt-0.5">{sub}</p>}
    </div>
  );
}

export function AiPerformanceDashboard({ stats }: AiPerformanceDashboardProps) {
  if (stats.totalProcessed === 0) {
    return (
      <div className="receipt-card rounded p-12 text-center">
        <Brain className="h-12 w-12 text-ink-faint mx-auto mb-3" />
        <h3 className="text-base font-semibold text-ink mb-1">Henüz veri yok</h3>
        <p className="text-sm text-ink-muted">Belge yükleyip OCR ile taradıktan sonra AI performans metrikleri burada görünecek.</p>
      </div>
    );
  }

  const maxTrendCount = Math.max(...stats.monthlyTrend.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      {/* Üst metrik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Toplam İşlenen Belge" value={stats.totalProcessed} sub="OCR ile taranan" />
        <StatBox
          label="Ortalama Doğruluk"
          value={`%${stats.avgConfidence}`}
          color={stats.avgConfidence >= 85 ? "text-emerald-600" : stats.avgConfidence >= 60 ? "text-amber-600" : "text-red-600"}
        />
        <StatBox label="Yüksek Güven Oranı" value={`%${stats.highConfRate}`} sub="≥%85 güven" color="text-emerald-600" />
        <StatBox
          label="Alan Sayısı"
          value={stats.fieldAccuracy.length}
          sub="Takip edilen OCR alanı"
        />
      </div>

      {/* Güven Dağılımı */}
      <div className="receipt-card rounded p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-receipt-brown" />
          Güven Skoru Dağılımı
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded bg-emerald-50 border border-emerald-100">
            <p className="text-2xl font-bold text-emerald-600">{stats.confidenceDistribution.high}</p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Yüksek (%85+)</p>
          </div>
          <div className="text-center p-3 rounded bg-amber-50 border border-amber-100">
            <p className="text-2xl font-bold text-amber-600">{stats.confidenceDistribution.medium}</p>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">Orta (%60-84)</p>
          </div>
          <div className="text-center p-3 rounded bg-red-50 border border-red-100">
            <p className="text-2xl font-bold text-red-600">{stats.confidenceDistribution.low}</p>
            <p className="text-[10px] text-red-700 font-medium mt-0.5">Düşük (%30-59)</p>
          </div>
          <div className="text-center p-3 rounded bg-gray-50 border border-gray-200">
            <p className="text-2xl font-bold text-gray-600">{stats.confidenceDistribution.unread}</p>
            <p className="text-[10px] text-gray-600 font-medium mt-0.5">Okunamadı (&lt;%30)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alan Bazlı Doğruluk */}
        <div className="receipt-card rounded p-5">
          <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-receipt-brown" />
            Alan Bazlı Doğruluk
          </h2>
          <div className="space-y-2.5">
            {stats.fieldAccuracy.map(({ field, avg, count }) => (
              <div key={field} className="flex items-center gap-2">
                <span className="text-[11px] text-ink-muted w-28 truncate flex-shrink-0" title={FIELD_LABELS[field] || field}>
                  {FIELD_LABELS[field] || field}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-paper-lines/40 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      avg >= 85 ? "bg-emerald-500" : avg >= 60 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${avg}%` }}
                  />
                </div>
                <span className={cn(
                  "text-[11px] font-semibold w-10 text-right",
                  avg >= 85 ? "text-emerald-600" : avg >= 60 ? "text-amber-600" : "text-red-600"
                )}>
                  %{avg}
                </span>
                <span className="text-[10px] text-ink-faint w-8 text-right">{count}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Belge Türü Bazlı Doğruluk */}
        <div className="receipt-card rounded p-5">
          <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-receipt-brown" />
            Belge Türü Bazlı Doğruluk
          </h2>
          <div className="space-y-3">
            {stats.docTypeAccuracy.map(({ type, avg, count }) => (
              <div key={type} className="flex items-center gap-3 p-3 rounded bg-surface border border-paper-lines">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{DOC_TYPE_LABELS[type] || type}</p>
                  <p className="text-[10px] text-ink-faint">{count} belge işlendi</p>
                </div>
                <div className={cn(
                  "text-lg font-bold px-3 py-1 rounded-full",
                  avg >= 85 ? "text-emerald-700 bg-emerald-50" :
                  avg >= 60 ? "text-amber-700 bg-amber-50" :
                  "text-red-700 bg-red-50"
                )}>
                  %{avg}
                </div>
              </div>
            ))}
            {stats.docTypeAccuracy.length === 0 && (
              <p className="text-sm text-ink-faint text-center py-4">Henüz veri yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Aylık Trend */}
      {stats.monthlyTrend.length > 0 && (
        <div className="receipt-card rounded p-5">
          <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-receipt-brown" />
            Aylık AI Doğruluk Trendi
          </h2>
          <div className="space-y-3">
            {stats.monthlyTrend.map(({ month, avg, count }) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-ink-muted w-20 flex-shrink-0 font-mono">{month}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-6 rounded bg-paper-lines/20 overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded transition-all duration-700",
                        avg >= 85 ? "bg-emerald-400/60" : avg >= 60 ? "bg-amber-400/60" : "bg-red-400/60"
                      )}
                      style={{ width: `${avg}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-ink">
                      %{avg}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 w-16 flex-shrink-0 justify-end">
                  <div className="h-3 rounded bg-receipt-gold/30 transition-all" style={{ width: `${(count / maxTrendCount) * 40}px` }} />
                  <span className="text-[10px] text-ink-faint">{count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-paper-lines">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-400/60" />
              <span className="text-[10px] text-ink-faint">Doğruluk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-receipt-gold/30" />
              <span className="text-[10px] text-ink-faint">Belge sayısı</span>
            </div>
          </div>
        </div>
      )}

      {/* Son İşlenen Belgeler */}
      {stats.recentDocuments.length > 0 && (
        <div className="receipt-card rounded p-5">
          <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-receipt-brown" />
            Son İşlenen Belgeler
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-lines">
                  <th className="text-left px-3 py-2 text-xs font-medium text-ink-muted">Firma</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-ink-muted">Tür</th>
                  <th className="text-center px-3 py-2 text-xs font-medium text-ink-muted">Doğruluk</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-ink-muted">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-paper-lines/50 last:border-0">
                    <td className="px-3 py-2 text-ink font-medium truncate max-w-[200px]">
                      {doc.supplier_name || "—"}
                    </td>
                    <td className="px-3 py-2 text-ink-muted text-xs">
                      {DOC_TYPE_LABELS[doc.document_type || ""] || doc.document_type || "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        doc.confidence_score >= 85 ? "bg-emerald-50 text-emerald-700" :
                        doc.confidence_score >= 60 ? "bg-amber-50 text-amber-700" :
                        doc.confidence_score >= 30 ? "bg-red-50 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        {doc.confidence_score < 30 ? "Okunamadı" : `%${Math.round(doc.confidence_score)}`}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-ink-faint text-xs">
                      {new Date(doc.created_at).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
