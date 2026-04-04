"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

interface DropZoneProps { onFiles: (files: File[]) => void; disabled?: boolean; }

export function DropZone({ onFiles, disabled }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const valid = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_SIZE);
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
        input.type = "file"; input.multiple = true; input.accept = ACCEPTED_TYPES.join(",");
        input.onchange = () => { if (input.files) handleFiles(input.files); };
        input.click();
      }}
      className={cn("border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
        dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400 bg-white",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
      <p className="font-medium text-slate-700 mb-1">Dosyalari surukleyin veya tiklayin</p>
      <p className="text-sm text-slate-500">JPG, PNG, PDF, WEBP &bull; Maks 10MB</p>
    </div>
  );
}
