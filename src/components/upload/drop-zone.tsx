"use client";

import { useCallback, useState } from "react";
import { Upload, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];
// Bazı tarayıcılar HEIC/HEIF için MIME döndürmez → uzantı ile de kabul et
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

function isAcceptedFile(file: File): boolean {
  if (file.size > MAX_SIZE) return false;
  if (file.type && ACCEPTED_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function DropZone({ onFiles, disabled, compact }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const valid = Array.from(fileList).filter(isAcceptedFile);
    if (valid.length > 0) onFiles(valid);
  }, [onFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); if (!disabled) handleFiles(e.dataTransfer.files); }}
      onClick={() => {
        if (disabled) return;
        const input = document.createElement("input");
        input.type = "file"; input.multiple = true;
        input.accept = [...ACCEPTED_TYPES, ...ACCEPTED_EXTENSIONS].join(",");
        input.onchange = () => { if (input.files) handleFiles(input.files); };
        input.click();
      }}
      className={cn(
        "relative border-2 border-dashed rounded cursor-pointer transition-all duration-200",
        compact ? "p-6" : "p-16",
        dragActive
          ? "border-receipt-brown bg-receipt-gold/10 scale-[1.005]"
          : "border-paper-lines hover:border-receipt-gold hover:bg-receipt-gold/5 bg-paper",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn("flex items-center gap-4", compact ? "flex-row" : "flex-col text-center")}>
        <div className={cn(
          "inline-flex items-center justify-center rounded transition-colors flex-shrink-0",
          compact ? "w-10 h-10" : "w-16 h-16 mb-2",
          dragActive ? "bg-receipt-gold/20" : "bg-receipt-gold/10"
        )}>
          {dragActive ? (
            <FileUp className={cn("text-receipt-brown animate-bounce", compact ? "h-5 w-5" : "h-8 w-8")} />
          ) : (
            <Upload className={cn("text-receipt-brown/60", compact ? "h-5 w-5" : "h-8 w-8")} />
          )}
        </div>
        <div className={compact ? "" : ""}>
          <p className={cn("font-semibold text-ink", compact ? "text-sm" : "text-base mb-1")}>
            {dragActive ? "Birakin, yukleniyor..." : "Dosyalari surukleyin veya tiklayin"}
          </p>
          <p className={cn("text-ink-muted", compact ? "text-xs" : "text-sm")}>
            JPG, PNG, HEIC, WEBP, PDF &bull; Maks 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
