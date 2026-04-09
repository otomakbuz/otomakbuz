"use server";

import { createClient } from "@/lib/supabase/server";
import { getOcrAdapter } from "@/lib/ocr";
import { getUserWorkspace, getUser } from "./auth";
import { convertHeicToJpeg } from "@/lib/heic-to-jpeg";
import { normalizeVatRate, guessDocumentType } from "@/lib/utils/turkish-validators";

/**
 * Dosyanın SHA-256 hash'ini hex olarak hesaplar.
 * Web Crypto (Node 20+) — ekstra bağımlılık yok.
 */
async function computeFileHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Kullanıcıya yönelik duplicate hatası — UI'da tanınabilsin diye prefix'li */
function duplicateError(existingId: string, reason: "file" | "content"): Error {
  const msg =
    reason === "file"
      ? "Bu dosya daha önce yüklenmiş"
      : "Aynı belge (fatura/fiş) zaten kayıtlı";
  const err = new Error(`DUPLICATE: ${msg} (#${existingId.slice(0, 8)})`);
  return err;
}

/**
 * Multi-document upload sonucu. Bir fotoğrafta birden fazla fiş/fatura
 * olduğunda OCR N tane OcrResult döner; her biri ayrı documents satırı
 * olur (aynı file_hash + farklı sub_index).
 */
export interface UploadResult {
  documents: import("@/types").Document[];
  skipped: { reason: "content-duplicate"; existingId: string; subIndex: number }[];
}

export async function uploadAndProcessDocument(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();
  const user = await getUser();
  const workspace = await getUserWorkspace();
  if (!user || !workspace) throw new Error("Oturum acilmamis");

  const file = formData.get("file") as File;
  if (!file) throw new Error("Dosya bulunamadi");

  // ───────────────────────────────────────────────────────────
  // Katman 1: Dosya ikizi kontrolü (storage upload'tan ÖNCE)
  // ───────────────────────────────────────────────────────────
  const fileHash = await computeFileHash(file);

  const { data: existingByHash } = await supabase
    .from("documents")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("file_hash", fileHash)
    .limit(1)
    .maybeSingle();

  if (existingByHash) {
    throw duplicateError(existingByHash.id, "file");
  }

  const origExt = file.name.split(".").pop()?.toLowerCase() || "bin";
  const isHeic = origExt === "heic" || origExt === "heif";

  // HEIC/HEIF → JPEG dönüşümü (OCR sağlayıcıları HEIC desteklemiyor)
  let uploadPayload: File | Buffer = file;
  let fileExt = origExt;
  let contentType = file.type;
  if (isHeic) {
    const arrayBuf = await file.arrayBuffer();
    uploadPayload = await convertHeicToJpeg(arrayBuf);
    fileExt = "jpeg";
    contentType = "image/jpeg";
  }

  const filePath = `${workspace.id}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, uploadPayload, {
      contentType,
    });
  if (uploadError) throw new Error(`Yukleme hatasi: ${uploadError.message}`);

  // Signed URL — bucket private olduğu için public URL 400 dönüyor.
  // 1 yıl expiry ile imzalı URL üretip hem OCR'a hem DB'ye veriyoruz.
  const ONE_YEAR = 60 * 60 * 24 * 365;
  const { data: signedData, error: signedError } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, ONE_YEAR);
  if (signedError || !signedData?.signedUrl) {
    await supabase.storage.from("documents").remove([filePath]);
    throw new Error(`Signed URL hatasi: ${signedError?.message ?? "bilinmiyor"}`);
  }
  const fileUrl = signedData.signedUrl;

  // ───────────────────────────────────────────────────────────
  // OCR — tek görselde N belge olabilir
  // ───────────────────────────────────────────────────────────
  let results;
  try {
    const ocr = await getOcrAdapter(workspace.id);
    results = await ocr.processDocument(fileUrl, fileExt);
  } catch (ocrError) {
    // OCR tamamen başarısız — storage'a yüklenen orphan dosyayı temizle
    await supabase.storage.from("documents").remove([filePath]);
    throw ocrError;
  }

  if (!results || results.length === 0) {
    await supabase.storage.from("documents").remove([filePath]);
    throw new Error("OCR belgeyi okuyamadı. Lütfen daha net bir fotoğraf yükleyin.");
  }

  // ───────────────────────────────────────────────────────────
  // Otomatik kategori tahmini — önceki belgelerin kategorisine bak
  // ───────────────────────────────────────────────────────────
  async function guessCategory(supplierName: string | null, supplierTaxId: string | null): Promise<string | null> {
    if (!supplierName && !supplierTaxId) return null;

    // 1) VKN ile eşleşme (en güvenilir)
    if (supplierTaxId) {
      const { data: byTax } = await supabase
        .from("documents")
        .select("category_id")
        .eq("workspace_id", workspace.id)
        .eq("supplier_tax_id", supplierTaxId)
        .not("category_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (byTax?.category_id) return byTax.category_id;
    }

    // 2) Firma adı ile eşleşme
    if (supplierName) {
      const { data: byName } = await supabase
        .from("documents")
        .select("category_id")
        .eq("workspace_id", workspace.id)
        .ilike("supplier_name", supplierName)
        .not("category_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (byName?.category_id) return byName.category_id;
    }

    return null;
  }

  // ───────────────────────────────────────────────────────────
  // Her belgeyi ayrı satır olarak insert et
  // ───────────────────────────────────────────────────────────
  const created: import("@/types").Document[] = [];
  const skipped: UploadResult["skipped"] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    // Türkçe belge tanıma düzeltmeleri
    const normalizedVatRate = normalizeVatRate(result.vat_rate);
    const guessedDocType = result.document_type || guessDocumentType(result.raw_ocr_text || "");

    // Otomatik kategori tahmini + cari eşleştirmesi
    const guessedCategoryId = await guessCategory(result.supplier_name, result.supplier_tax_id);

    let contactId: string | null = null;
    if (result.supplier_name) {
      try {
        const { matchContactByName } = await import("./contacts");
        const matched = await matchContactByName(result.supplier_name);
        if (matched) contactId = matched.id;
      } catch { /* cari eşleşmezse devam et */ }
    }

    const { data: insertedDoc, error: insertError } = await supabase
      .from("documents")
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        original_file_url: fileUrl,
        file_type: fileExt,
        file_hash: fileHash,
        sub_index: i,
        status: "needs_review",
        document_type: guessedDocType || result.document_type,
        category_id: guessedCategoryId,
        // Düzenleyen (satıcı)
        supplier_name: result.supplier_name,
        supplier_tax_id: result.supplier_tax_id,
        supplier_tax_office: result.supplier_tax_office,
        supplier_address: result.supplier_address,
        // Alıcı
        buyer_name: result.buyer_name,
        buyer_tax_id: result.buyer_tax_id,
        buyer_tax_office: result.buyer_tax_office,
        buyer_address: result.buyer_address,
        // Belge meta
        document_number: result.document_number,
        issue_date: result.issue_date,
        issue_time: result.issue_time,
        waybill_number: result.waybill_number,
        // Tutarlar
        subtotal_amount: result.subtotal_amount,
        vat_amount: result.vat_amount,
        vat_rate: normalizedVatRate,
        withholding_amount: result.withholding_amount,
        total_amount: result.total_amount,
        currency: result.currency,
        payment_method: result.payment_method,
        contact_id: contactId,
        // Kalemler
        line_items: result.line_items,
        // Meta
        raw_ocr_text: result.raw_ocr_text,
        confidence_score: result.confidence_score,
        field_scores: result.field_scores,
        parsed_json: result as unknown as Record<string, unknown>,
      })
      .select("*, category:categories(*)")
      .single();

    if (insertError) {
      // 23505: ya file_hash + sub_index çakıştı (race) ya da içerik tuple
      // (supplier_tax_id + document_number + issue_date) başka bir belgeyle çakıştı.
      if (insertError.code === "23505") {
        const { data: clash } = await supabase
          .from("documents")
          .select("id")
          .eq("workspace_id", workspace.id)
          .eq("supplier_tax_id", result.supplier_tax_id ?? "")
          .eq("document_number", result.document_number ?? "")
          .eq("issue_date", result.issue_date ?? "")
          .limit(1)
          .maybeSingle();
        skipped.push({
          reason: "content-duplicate",
          existingId: clash?.id ?? "unknown",
          subIndex: i,
        });
        console.warn(
          `[upload] belge #${i} içerik ikizi olduğu için atlandı (mevcut: ${clash?.id?.slice(0, 8) ?? "?"})`
        );
        continue;
      }
      // Diğer DB hataları — bu satırı atla ama log'la
      console.error(`[upload] belge #${i} insert hatası:`, insertError);
      continue;
    }

    created.push(insertedDoc);
    await supabase.from("audit_logs").insert({
      document_id: insertedDoc.id,
      user_id: user.id,
      action_type: "created",
      new_value: insertedDoc,
    });
  }

  // Hiçbir belge başarılı olmadıysa: orphan storage dosyasını temizle ve hata fırlat
  if (created.length === 0) {
    await supabase.storage.from("documents").remove([filePath]);
    if (skipped.length > 0) {
      throw duplicateError(skipped[0].existingId, "content");
    }
    throw new Error("Belge(ler) kaydedilemedi. Lütfen tekrar deneyin.");
  }

  return { documents: created, skipped };
}
