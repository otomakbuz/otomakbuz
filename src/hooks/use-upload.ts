"use client";

import { useState, useCallback } from "react";
import { uploadAndProcessDocument } from "@/lib/actions/upload";
import type { Document } from "@/types";

export type UploadItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  result?: Document;
  error?: string;
};

export function useUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(), file, status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => processItem(item.id, item.file));
  }, []);

  async function processItem(itemId: string, file: File) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: "uploading" } : i)));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadAndProcessDocument(formData);
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: "done", result } : i)));
      setActiveReviewId((current) => current ?? itemId);
    } catch (err) {
      setItems((prev) => prev.map((i) =>
        i.id === itemId ? { ...i, status: "error", error: err instanceof Error ? err.message : "Bilinmeyen hata" } : i
      ));
    }
  }

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((i) => i.status !== "done"));
    setActiveReviewId(null);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (activeReviewId === itemId) setActiveReviewId(null);
  }, [activeReviewId]);

  return { items, activeReviewId, setActiveReviewId, addFiles, clearCompleted, removeItem };
}
