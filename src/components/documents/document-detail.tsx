"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/upload/review-form";
import { StatusBadge } from "./status-badge";
import { deleteDocument } from "@/lib/actions/documents";
import { generateEFaturaXml } from "@/lib/actions/e-fatura";
import { toast } from "sonner";
import { Trash2, ArrowLeft, FileText, Clock, FileCheck } from "lucide-react";
import type { Document, Category, AuditLog } from "@/types";
import { formatDate } from "@/lib/utils";

interface DocumentDetailProps {
  document: Document;
  categories: Category[];
  auditLogs: AuditLog[];
}

export function DocumentDetail({ document: doc, categories, auditLogs }: DocumentDetailProps) {
  const router = useRouter();
  const [showOcr, setShowOcr] = useState(false);
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(doc.file_type.toLowerCase());

  async function handleDelete() {
    if (!confirm("Bu belgeyi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteDocument(doc.id);
      toast.success("Belge silindi");
      router.push("/belgeler");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme hatası");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/belgeler")}
            className="text-ink-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4 mr-1" />Geri
          </Button>
          <h1 className="text-xl font-bold text-ink">{doc.supplier_name || "Belge Detayı"}</h1>
          <StatusBadge status={doc.status} />
        </div>
        <div className="flex gap-2">
          {doc.status === "verified" && (
            <Button
              size="sm" variant="outline"
              className="border-receipt-gold text-receipt-brown hover:bg-receipt-gold/10"
              onClick={async () => {
                try {
                  const { xml, filename } = await generateEFaturaXml(doc.id);
                  const blob = new Blob([xml], { type: "application/xml" });
                  const url = URL.createObjectURL(blob);
                  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("E-Fatura XML indirildi");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "E-Fatura oluşturulamadı");
                }
              }}
            >
              <FileCheck className="h-4 w-4 mr-1" />E-Fatura XML
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600">
            <Trash2 className="h-4 w-4 mr-1" />Sil
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left: Preview (sticky) */}
        <div className="space-y-4 lg:sticky lg:top-[76px]">
          <div className="receipt-card rounded overflow-hidden">
            <div className="aspect-[3/4] relative bg-surface flex items-center justify-center">
              {isImage ? (
                <Image src={doc.original_file_url} alt="Belge" fill className="object-contain" />
              ) : (
                <div className="text-center text-ink-faint">
                  <FileText className="h-16 w-16 mx-auto mb-2" />
                  <p>PDF Önizleme</p>
                  <a href={doc.original_file_url} target="_blank" rel="noopener noreferrer"
                    className="text-receipt-brown hover:text-receipt-brown-dark text-sm font-medium">Dosyayı Aç</a>
                </div>
              )}
            </div>
          </div>

          {/* OCR Text */}
          <div className="receipt-card rounded p-4">
            <Button variant="ghost" size="sm" className="mb-2 text-ink-muted hover:text-ink" onClick={() => setShowOcr(!showOcr)}>
              {showOcr ? "OCR Metnini Gizle" : "OCR Metnini Göster"}
            </Button>
            {showOcr && (
              <pre className="text-xs text-ink-muted bg-surface p-3 rounded whitespace-pre-wrap max-h-64 overflow-y-auto border border-paper-lines">
                {doc.raw_ocr_text || "OCR metni bulunamadı"}
              </pre>
            )}
          </div>

          {/* Audit Log */}
          {auditLogs.length > 0 && (
            <div className="receipt-card rounded p-4">
              <h3 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-ink-faint" />
                Değişiklik Geçmişi
              </h3>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-xs text-ink-muted flex items-center gap-2 py-1">
                    <span className="text-ink-faint tabular-nums">{formatDate(log.created_at)}</span>
                    <span className="w-1 h-1 rounded-full bg-paper-lines" />
                    <span className="capitalize">{log.action_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Review Form */}
        <div className="receipt-card rounded p-5">
          <ReviewForm document={doc} categories={categories} />
        </div>
      </div>
    </div>
  );
}
