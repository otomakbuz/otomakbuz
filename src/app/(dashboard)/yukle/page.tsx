"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ReviewForm } from "@/components/upload/review-form";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { useUpload } from "@/hooks/use-upload";
import { getCategories } from "@/lib/actions/categories";
import { getDocuments } from "@/lib/actions/documents";
import type { Category, Document } from "@/types";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** OCR sonucu özetini hesaplar */
function getOcrSummary(doc: Document) {
  const scores = doc.field_scores as Record<string, number> | null;
  if (!scores) return null;
  const values = Object.values(scores).filter((v) => typeof v === "number" && v > 0);
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const high = values.filter((v) => v >= 85).length;
  return { fieldCount: values.length, avgScore: Math.round(avg), highConfCount: high };
}

export default function UploadPage() {
  const { items, activeReviewId, setActiveReviewId, addFiles, removeItem } = useUpload();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);

  const refreshRecent = useCallback(() => {
    getDocuments().then((docs) => setRecentDocs(docs.slice(0, 5)));
  }, []);

  useEffect(() => { getCategories().then(setCategories); }, []);
  useEffect(() => { refreshRecent(); }, [refreshRecent]);

  const activeItem = items.find((i) => i.id === activeReviewId) || null;
  const activeDoc = activeItem?.result;

  // Local preview URL (works even before OCR completes)
  const localPreviewUrl = useMemo(() => {
    if (!activeItem) return null;
    return URL.createObjectURL(activeItem.file);
  }, [activeItem]);

  useEffect(() => {
    return () => { if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); };
  }, [localPreviewUrl]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
            <Upload className="h-5 w-5 text-receipt-brown" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Belge Yükle</h1>
            <p className="text-ink-muted text-sm">Belgeyi yükleyin, sistem otomatik tarayacak.</p>
          </div>
        </div>

        {/* Multi-file list (compact pills) */}
        {items.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-md">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => item.status === "done" && setActiveReviewId(item.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium border transition-all",
                  activeReviewId === item.id
                    ? "border-receipt-gold bg-receipt-gold/10 text-receipt-brown"
                    : "border-paper-lines bg-paper text-ink-muted hover:border-receipt-gold/50"
                )}
              >
                {item.status === "uploading" && <Loader2 className="h-3 w-3 animate-spin" />}
                {item.status === "done" && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                {item.status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                <span className="truncate max-w-[80px]">{item.file.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== SPLIT LAYOUT — önizleme daha dar, form daha geniş ===== */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5 items-start">

        {/* ====== SOL: Belge Önizleme / DropZone ====== */}
        <div className="md:sticky md:top-[76px]">
          <DocumentPreview
            item={activeItem}
            previewUrl={localPreviewUrl}
            onFiles={addFiles}
          />
        </div>

        {/* ====== SAĞ: Form Alanı ====== */}
        <div>
          {activeDoc ? (
            /* OCR tamamlandı — özet + form */
            <div className="space-y-3">
              {/* AI Başarı Özeti */}
              {(() => {
                const summary = getOcrSummary(activeDoc);
                if (!summary) return null;
                return (
                  <div className="receipt-card rounded px-4 py-3 flex items-center gap-3 border-receipt-gold/30 bg-receipt-gold/5">
                    <div className="w-9 h-9 rounded-full bg-receipt-gold/15 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-receipt-brown" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        AI {summary.fieldCount} alan tespit etti
                      </p>
                      <p className="text-xs text-ink-muted">
                        Ortalama güven: %{summary.avgScore} · {summary.highConfCount}/{summary.fieldCount} alan yüksek doğrulukta
                        {activeDoc.category && (
                          <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-receipt-gold/10 text-receipt-brown text-[10px] font-medium">
                            Kategori önerildi: {(activeDoc.category as { name: string }).name}
                          </span>
                        )}
                        {activeDoc.contact_id && (
                          <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                            Cari eşleşti
                          </span>
                        )}
                      </p>
                    </div>
                    <div className={cn(
                      "text-lg font-bold px-3 py-1 rounded-full",
                      summary.avgScore >= 85
                        ? "text-emerald-700 bg-emerald-50"
                        : summary.avgScore >= 60
                          ? "text-amber-700 bg-amber-50"
                          : "text-red-700 bg-red-50"
                    )}>
                      %{summary.avgScore}
                    </div>
                  </div>
                );
              })()}
              <div className="receipt-card rounded p-3">
              <ReviewForm
                document={activeDoc}
                categories={categories}
                onSaved={() => {
                  refreshRecent();
                  const next = items.find(
                    (i) => i.id !== activeReviewId && i.status === "done" && i.result?.status === "needs_review"
                  );
                  setActiveReviewId(next?.id || null);
                }}
              />
              </div>
            </div>
          ) : activeItem && activeItem.status === "uploading" ? (
            /* OCR devam ediyor — aşamalı skeleton form */
            <div className="receipt-card rounded p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 text-receipt-brown animate-spin" />
                <h3 className="font-semibold text-ink text-sm">
                  {activeItem.step === "uploading" && "Dosya yükleniyor..."}
                  {activeItem.step === "analyzing" && "AI belgeyi analiz ediyor..."}
                  {activeItem.step === "extracting" && "Veriler çıkarılıyor..."}
                  {!activeItem.step && "Veriler okunuyor..."}
                </h3>
              </div>
              {/* Skeleton fields — adım ilerledikçe daha fazla alan "beliriyor" */}
              {[...Array(8)].map((_, i) => {
                const currentStepIdx = activeItem.step === "extracting" ? 2 : activeItem.step === "analyzing" ? 1 : 0;
                const isRevealed = activeItem.step === "extracting" && i < 3;
                return (
                  <div key={i} className={cn(
                    "space-y-1.5 transition-all duration-700",
                    currentStepIdx === 0 && i > 3 && "opacity-30",
                    currentStepIdx === 1 && i > 5 && "opacity-30"
                  )}>
                    <div className={cn(
                      "h-3 w-20 rounded",
                      isRevealed ? "bg-receipt-gold/40" : "bg-paper-lines/60 animate-pulse"
                    )} />
                    <div className={cn(
                      "h-9 rounded border transition-all duration-700",
                      isRevealed
                        ? "border-receipt-gold/40 bg-receipt-gold/5"
                        : "border-paper-lines bg-surface/50 animate-pulse",
                      i % 3 === 0 ? "w-full" : "w-3/4"
                    )} />
                  </div>
                );
              })}
              <div className="pt-3 border-t border-paper-lines">
                <div className="h-10 rounded bg-receipt-brown/20 animate-pulse" />
              </div>
            </div>
          ) : (
            /* Henüz belge yok — boş sağ panel */
            <div className="receipt-card rounded min-h-[560px] flex flex-col">
              <div className="px-4 py-3 border-b border-paper-lines">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-receipt-brown" />
                  <h3 className="font-semibold text-ink text-sm">Belge Bilgileri</h3>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-8">
                <div className="w-14 h-14 rounded bg-receipt-gold/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-receipt-gold/40" />
                </div>
                <p className="text-sm font-medium text-ink mb-1">Belge bekleniyor</p>
                <p className="text-xs text-ink-faint text-center max-w-xs">
                  Sol taraftan bir belge yükleyin. OCR ile tarandıktan sonra veriler burada otomatik dolacak.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Son Belgeler ===== */}
      <div className="mt-6">
        <RecentDocuments documents={recentDocs} />
      </div>
    </div>
  );
}
