"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/upload/review-form";
import { StatusBadge } from "./status-badge";
import { deleteDocument } from "@/lib/actions/documents";
import { toast } from "sonner";
import { Trash2, ArrowLeft, FileText } from "lucide-react";
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
    if (!confirm("Bu belgeyi silmek istediginize emin misiniz?")) return;
    try {
      await deleteDocument(doc.id);
      toast.success("Belge silindi");
      router.push("/belgeler");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme hatasi");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/belgeler")}>
            <ArrowLeft className="h-4 w-4 mr-1" />Geri
          </Button>
          <h1 className="text-xl font-bold text-slate-900">{doc.supplier_name || "Belge Detayi"}</h1>
          <StatusBadge status={doc.status} />
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1" />Sil
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="aspect-[3/4] relative bg-slate-100 flex items-center justify-center">
              {isImage ? (
                <Image src={doc.original_file_url} alt="Belge" fill className="object-contain" />
              ) : (
                <div className="text-center text-slate-400">
                  <FileText className="h-16 w-16 mx-auto mb-2" />
                  <p>PDF Onizleme</p>
                  <a href={doc.original_file_url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm">Dosyayi Ac</a>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <Button variant="ghost" size="sm" className="mb-2" onClick={() => setShowOcr(!showOcr)}>
              {showOcr ? "OCR Metnini Gizle" : "OCR Metnini Goster"}
            </Button>
            {showOcr && (
              <pre className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap max-h-64 overflow-y-auto">
                {doc.raw_ocr_text || "OCR metni bulunamadi"}
              </pre>
            )}
          </div>
          {auditLogs.length > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold text-sm text-slate-900 mb-3">Degisiklik Gecmisi</h3>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-slate-400">{formatDate(log.created_at)}</span>
                    <span className="capitalize">{log.action_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border p-4">
          <ReviewForm document={doc} categories={categories} />
        </div>
      </div>
    </div>
  );
}
