"use client";

import { CheckCircle, Loader2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadItem } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  items: UploadItem[];
  activeReviewId: string | null;
  onSelect: (id: string) => void;
}

export function UploadProgress({ items, activeReviewId, onSelect }: UploadProgressProps) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-700">{items.length} belge yuklendi</h3>
      {items.map((item) => (
        <div key={item.id} className={cn("flex items-center gap-3 p-3 rounded-lg border text-sm",
          activeReviewId === item.id ? "border-blue-300 bg-blue-50" : "bg-white"
        )}>
          {item.status === "uploading" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />}
          {item.status === "done" && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
          {item.status === "error" && <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
          {item.status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-slate-300 flex-shrink-0" />}
          <span className="flex-1 truncate">{item.file.name}</span>
          {item.status === "uploading" && <span className="text-xs text-blue-600">Taraniyor...</span>}
          {item.status === "error" && <span className="text-xs text-red-600">{item.error}</span>}
          {item.status === "done" && (
            <Button variant="ghost" size="sm" onClick={() => onSelect(item.id)} className="text-xs">
              <Eye className="h-3 w-3 mr-1" />Incele
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
