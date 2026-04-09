"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { FileText, Loader2, Upload, FileUp, Eye, AlertCircle, CloudUpload, Brain, ScanText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadItem, UploadStep } from "@/hooks/use-upload";

const STEPS: { key: UploadStep; label: string; icon: typeof CloudUpload }[] = [
  { key: "uploading", label: "Dosya yükleniyor", icon: CloudUpload },
  { key: "analyzing", label: "AI analiz ediyor", icon: Brain },
  { key: "extracting", label: "Veriler çıkarılıyor", icon: ScanText },
];

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

function isAcceptedFile(file: File): boolean {
  if (file.size > MAX_SIZE) return false;
  if (file.type && ACCEPTED_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

interface DocumentPreviewProps {
  item: UploadItem | null;
  previewUrl: string | null;
  onFiles: (files: File[]) => void;
}

export function DocumentPreview({ item, previewUrl, onFiles }: DocumentPreviewProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const valid = Array.from(fileList).filter(isAcceptedFile);
    if (valid.length > 0) onFiles(valid);
  }, [onFiles]);

  const openFilePicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file"; input.multiple = true;
    input.accept = [...ACCEPTED_TYPES, ...ACCEPTED_EXTENSIONS].join(",");
    input.onchange = () => { if (input.files) handleFiles(input.files); };
    input.click();
  }, [handleFiles]);

  // Belge var ve tamamlandı — önizleme göster
  if (item && (item.status === "done" || item.status === "uploading")) {
    const doc = item.result;
    const lowerName = item.file.name.toLowerCase();
    const isHeic =
      item.file.type === "image/heic" ||
      item.file.type === "image/heif" ||
      lowerName.endsWith(".heic") ||
      lowerName.endsWith(".heif");
    // HEIC tarayıcıda render edilemez → image olarak davranma, özel placeholder göster
    const isImage = item.file.type.startsWith("image/") && !isHeic;
    const fileUrl = doc?.original_file_url || previewUrl;
    const isProcessing = item.status === "uploading";

    return (
      <div className="receipt-card rounded flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-paper-lines flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 text-receipt-brown animate-spin" />
            ) : (
              <Eye className="h-4 w-4 text-receipt-brown" />
            )}
            <h3 className="font-semibold text-ink text-sm">
              {isProcessing ? "OCR Taranıyor..." : "Belge Önizleme"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-ink-faint truncate max-w-[160px]">{item.file.name}</span>
            <button
              onClick={openFilePicker}
              className="text-[11px] text-receipt-brown hover:text-receipt-brown-dark font-medium"
            >
              Değiştir
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 relative bg-surface/50 min-h-[500px]">
          {isProcessing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/60 backdrop-blur-[2px]">
              <div className="flex flex-col items-center w-64">
                {/* Aktif adımın ikonu */}
                <div className="w-16 h-16 rounded-full bg-receipt-gold/15 flex items-center justify-center mb-5">
                  {(() => {
                    const currentStep = item.step || "uploading";
                    const StepIcon = STEPS.find((s) => s.key === currentStep)?.icon || CloudUpload;
                    return <StepIcon className="h-7 w-7 text-receipt-brown animate-pulse" />;
                  })()}
                </div>

                {/* Aşamalı stepper */}
                <div className="flex flex-col gap-3 w-full">
                  {STEPS.map((step, idx) => {
                    const currentIdx = STEPS.findIndex((s) => s.key === (item.step || "uploading"));
                    const isDone = idx < currentIdx;
                    const isActive = idx === currentIdx;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500",
                          isDone && "bg-emerald-100 text-emerald-600",
                          isActive && "bg-receipt-gold/20 text-receipt-brown ring-2 ring-receipt-gold/30",
                          !isDone && !isActive && "bg-paper-lines/30 text-ink-faint"
                        )}>
                          {isDone ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isActive ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm transition-all duration-500",
                          isDone && "text-emerald-600 font-medium",
                          isActive && "text-ink font-semibold",
                          !isDone && !isActive && "text-ink-faint"
                        )}>
                          {step.label}
                          {isActive && <span className="animate-pulse">...</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {isImage && (previewUrl || fileUrl) ? (
            <Image
              src={previewUrl || fileUrl || ""}
              alt="Belge önizleme"
              fill
              className="object-contain p-3"
              sizes="50vw"
              unoptimized={!!previewUrl}
            />
          ) : fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full min-h-[500px] border-0"
              title="PDF Önizleme"
            />
          ) : previewUrl && item.file.type === "application/pdf" ? (
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[500px] border-0"
              title="PDF Önizleme"
            />
          ) : previewUrl ? (
            <Image
              src={previewUrl}
              alt="Belge önizleme"
              fill
              className="object-contain p-3"
              sizes="50vw"
              unoptimized
            />
          ) : isHeic ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 rounded-full bg-receipt-gold/15 flex items-center justify-center mb-3">
                <FileText className="h-8 w-8 text-receipt-brown" />
              </div>
              <p className="text-sm font-semibold text-ink">HEIC Fotoğraf</p>
              <p className="text-xs text-ink-muted mt-1 max-w-[240px]">
                Tarayıcı HEIC önizlemesini desteklemiyor — dosya yine de yüklendi ve OCR ile işlenecek.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <FileText className="h-12 w-12 text-ink-faint mb-3" />
              <p className="text-sm text-ink-muted">Önizleme kullanılamıyor</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hata durumu
  if (item && item.status === "error") {
    return (
      <div
        className="receipt-card rounded flex flex-col h-full cursor-pointer"
        onClick={openFilePicker}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="px-4 py-3 border-b border-paper-lines">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-red-600 text-sm">İşlenemedi</h3>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
          <p className="text-sm text-red-600 mb-1">{item.error || "Bilinmeyen hata"}</p>
          <p className="text-xs text-ink-faint">Tekrar denemek için tıklayın</p>
        </div>
      </div>
    );
  }

  // Boş durum — DropZone olarak davran
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
      onClick={openFilePicker}
      className={cn(
        "receipt-card rounded flex flex-col h-full cursor-pointer transition-all duration-200 min-h-[560px]",
        dragActive && "ring-2 ring-receipt-brown ring-offset-2"
      )}
    >
      <div className="px-4 py-3 border-b border-paper-lines">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-receipt-brown" />
          <h3 className="font-semibold text-ink text-sm">Belge Önizleme</h3>
        </div>
      </div>
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center px-8 border-2 border-dashed m-3 rounded transition-all",
        dragActive
          ? "border-receipt-brown bg-receipt-gold/10"
          : "border-paper-lines hover:border-receipt-gold hover:bg-receipt-gold/5"
      )}>
        <div className={cn(
          "w-16 h-16 rounded flex items-center justify-center mb-5 transition-colors",
          dragActive ? "bg-receipt-gold/20" : "bg-receipt-gold/10"
        )}>
          {dragActive ? (
            <FileUp className="h-8 w-8 text-receipt-brown animate-bounce" />
          ) : (
            <Upload className="h-8 w-8 text-receipt-brown/50" />
          )}
        </div>
        <p className="font-semibold text-ink mb-1 text-center">
          {dragActive ? "Bırakın, yükleniyor..." : "Belge sürükleyin veya tıklayın"}
        </p>
        <p className="text-sm text-ink-muted text-center">
          JPG, PNG, HEIC, WEBP, PDF &bull; Maks 10MB
        </p>
        <p className="text-xs text-ink-faint mt-3 text-center">
          Belge yüklendikten sonra burada önizlenecek
        </p>
      </div>
    </div>
  );
}
