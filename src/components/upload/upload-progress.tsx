"use client";

import { CheckCircle, Loader2, AlertCircle, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadItem } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  items: UploadItem[];
  activeReviewId: string | null;
  onSelect: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UploadProgress({ items, activeReviewId, onSelect, onRemove }: UploadProgressProps) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-ink-muted">{items.length} belge</h3>
      </div>
      {items.map((item) => (
        <div key={item.id} className={cn(
          "flex items-center gap-2.5 px-3 py-2.5 rounded border text-sm transition-all duration-150 group",
          activeReviewId === item.id
            ? "border-receipt-gold bg-receipt-gold/8 shadow-sm"
            : "border-paper-lines bg-paper hover:border-receipt-gold/50"
        )}>
          {item.status === "uploading" && <Loader2 className="h-3.5 w-3.5 text-receipt-brown animate-spin flex-shrink-0" />}
          {item.status === "done" && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
          {item.status === "error" && <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
          {item.status === "pending" && <div className="h-3.5 w-3.5 rounded-full border-2 border-paper-lines flex-shrink-0" />}

          <span className="flex-1 truncate text-xs font-medium text-ink">{item.file.name}</span>

          {item.status === "uploading" && <span className="text-[10px] text-receipt-brown font-medium">Taranıyor...</span>}
          {item.status === "error" && <span className="text-[10px] text-red-600 truncate max-w-[100px]">{item.error}</span>}
          {item.status === "done" && (
            <Button variant="ghost" size="sm" onClick={() => onSelect(item.id)}
              className={cn(
                "h-6 px-2 text-[10px] gap-1",
                activeReviewId === item.id
                  ? "text-receipt-brown font-semibold"
                  : "text-ink-muted hover:text-receipt-brown"
              )}>
              <Eye className="h-3 w-3" />
              {activeReviewId === item.id ? "Aktif" : "Incele"}
            </Button>
          )}

          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 transition-opacity p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
