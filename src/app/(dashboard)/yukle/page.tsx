"use client";

import { useEffect, useState } from "react";
import { DropZone } from "@/components/upload/drop-zone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { ReviewForm } from "@/components/upload/review-form";
import { useUpload } from "@/hooks/use-upload";
import { getCategories } from "@/lib/actions/categories";
import type { Category } from "@/types";

export default function UploadPage() {
  const { items, activeReviewId, setActiveReviewId, addFiles } = useUpload();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => { getCategories().then(setCategories); }, []);

  const activeItem = items.find((i) => i.id === activeReviewId);
  const activeDoc = activeItem?.result;
  const hasItems = items.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Belge Yukle</h1>
        <p className="text-slate-600 text-sm mt-1">Makbuz, fis veya fatura yukleyin. Sistem otomatik tarayacak.</p>
      </div>
      <DropZone onFiles={addFiles} disabled={false} />
      {hasItems && (
        <div className="grid lg:grid-cols-2 gap-6">
          <UploadProgress items={items} activeReviewId={activeReviewId} onSelect={setActiveReviewId} />
          {activeDoc && (
            <div className="bg-white rounded-xl border p-4">
              <ReviewForm document={activeDoc} categories={categories}
                onSaved={() => {
                  const next = items.find((i) => i.id !== activeReviewId && i.status === "done" && i.result?.status === "needs_review");
                  setActiveReviewId(next?.id || null);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
