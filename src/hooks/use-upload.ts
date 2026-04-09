"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { uploadAndProcessDocument } from "@/lib/actions/upload";
import type { Document } from "@/types";

export type UploadStep = "uploading" | "analyzing" | "extracting";

export type UploadItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  /** Mevcut işlem adımı — loading UI'da aşamalı gösterim için */
  step?: UploadStep;
  result?: Document;
  error?: string;
  /** Aynı fotoğraftaki belge sırası (çoklu fiş fotoğrafı için) */
  subIndex?: number;
  /** Aynı fotoğraftaki toplam belge sayısı */
  totalInFile?: number;
};

export function useUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const addFiles = useCallback((files: File[]) => {
    // Her dosya için bir "placeholder" item — OCR bittiğinde gerçek belgelere
    // fan-out edilir (1 fotoğrafta 3 fiş varsa 3 item'e dönüşür).
    const newItems: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(), file, status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => processItem(item.id, item.file));
  }, []);

  async function processItem(itemId: string, file: File) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: "uploading", step: "uploading" as UploadStep } : i)));

    // Adım geçişlerini zamanlayıcıyla simüle et — server action tek çağrı
    // ama kullanıcıya aşamalı ilerleme gösteriyoruz.
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    const setStep = (step: UploadStep) =>
      setItems((prev) => prev.map((i) => (i.id === itemId && i.status === "uploading" ? { ...i, step } : i)));

    stepTimers.push(setTimeout(() => setStep("analyzing"), 1200));
    stepTimers.push(setTimeout(() => setStep("extracting"), 3500));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { documents, skipped } = await uploadAndProcessDocument(formData);
      stepTimers.forEach(clearTimeout);

      if (documents.length === 0) {
        throw new Error("Belge kaydedilemedi");
      }

      // Atlanan içerik ikizleri varsa kullanıcıya bildir (toast)
      if (skipped.length > 0) {
        toast.warning(
          `${skipped.length} belge zaten kayıtlı olduğu için atlandı`
        );
      }

      // Tek belge: mevcut item'ı güncelle.
      // Çoklu belge: mevcut item'ı ilk belgeyle doldur, geri kalanları yeni item olarak ekle.
      if (documents.length === 1) {
        const doc = documents[0];
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, status: "done", result: doc } : i
          )
        );
        setActiveReviewId((current) => current ?? itemId);
        return;
      }

      // Çoklu — fan out
      const firstDoc = documents[0];
      const extraItems: UploadItem[] = documents.slice(1).map((doc, idx) => ({
        id: crypto.randomUUID(),
        file,
        status: "done" as const,
        result: doc,
        subIndex: idx + 1,
        totalInFile: documents.length,
      }));

      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === itemId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          status: "done",
          result: firstDoc,
          subIndex: 0,
          totalInFile: documents.length,
        };
        // İlk item'dan hemen sonra ekstraları araya sıkıştır
        updated.splice(idx + 1, 0, ...extraItems);
        return updated;
      });

      setActiveReviewId((current) => current ?? itemId);
      toast.success(`${documents.length} belge bir fotoğraftan çıkarıldı`);
    } catch (err) {
      stepTimers.forEach(clearTimeout);
      const rawMsg = err instanceof Error ? err.message : "Bilinmeyen hata";
      // DUPLICATE: prefix'i upload.ts'den gelir; kullanıcı dostu toast göster
      if (rawMsg.startsWith("DUPLICATE:")) {
        const friendly = rawMsg.replace(/^DUPLICATE:\s*/, "");
        toast.error(friendly);
        setItems((prev) => prev.map((i) =>
          i.id === itemId ? { ...i, status: "error", error: friendly } : i
        ));
      } else {
        toast.error(rawMsg);
        setItems((prev) => prev.map((i) =>
          i.id === itemId ? { ...i, status: "error", error: rawMsg } : i
        ));
      }
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
