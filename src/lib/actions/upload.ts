"use server";

import { createClient } from "@/lib/supabase/server";
import { getOcrAdapter } from "@/lib/ocr";
import { getUserWorkspace, getUser } from "./auth";

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

export async function uploadAndProcessDocument(formData: FormData) {
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

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filePath = `${workspace.id}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);
  if (uploadError) throw new Error(`Yukleme hatasi: ${uploadError.message}`);

  // Signed URL — bucket private olduğu için public URL 400 dönüyor.
  // 1 yıl expiry ile imzalı URL üretip hem OCR'a hem DB'ye veriyoruz.
  const ONE_YEAR = 60 * 60 * 24 * 365;
  const { data: signedData, error: signedError } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, ONE_YEAR);
  if (signedError || !signedData?.signedUrl) {
    throw new Error(`Signed URL hatasi: ${signedError?.message ?? "bilinmiyor"}`);
  }
  const fileUrl = signedData.signedUrl;

  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      original_file_url: fileUrl,
      file_type: fileExt,
      file_hash: fileHash,
      status: "processing",
    })
    .select()
    .single();

  if (insertError) {
    // Race: aynı anda iki upload → unique index 23505 döner
    if (insertError.code === "23505") {
      // Storage'a yüklenen orphan dosyayı temizle
      await supabase.storage.from("documents").remove([filePath]);
      throw duplicateError("race", "file");
    }
    throw new Error(insertError.message);
  }

  try {
    const ocr = await getOcrAdapter(workspace.id);
    const result = await ocr.processDocument(fileUrl, fileExt);

    const { data: updatedDoc, error: updateError } = await supabase
      .from("documents")
      .update({
        document_type: result.document_type,
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
        vat_rate: result.vat_rate,
        withholding_amount: result.withholding_amount,
        total_amount: result.total_amount,
        currency: result.currency,
        payment_method: result.payment_method,
        // Kalemler
        line_items: result.line_items,
        // Meta
        raw_ocr_text: result.raw_ocr_text,
        confidence_score: result.confidence_score,
        field_scores: result.field_scores,
        parsed_json: result as unknown as Record<string, unknown>,
        status: "needs_review",
      })
      .eq("id", doc.id)
      .select("*, category:categories(*)")
      .single();

    if (updateError) {
      // Katman 2: içerik tuple'ı (supplier_tax_id + document_number + issue_date)
      // başka bir belgeyle çakıştıysa → 23505
      if (updateError.code === "23505") {
        // Yeni yüklenen satırı ve dosyayı temizle
        await supabase.from("documents").delete().eq("id", doc.id);
        await supabase.storage.from("documents").remove([filePath]);

        // Mevcut çakışan kaydı bul (kullanıcıya ID göster)
        const { data: clash } = await supabase
          .from("documents")
          .select("id")
          .eq("workspace_id", workspace.id)
          .eq("supplier_tax_id", result.supplier_tax_id)
          .eq("document_number", result.document_number)
          .eq("issue_date", result.issue_date)
          .neq("id", doc.id)
          .limit(1)
          .maybeSingle();

        throw duplicateError(clash?.id ?? "unknown", "content");
      }
      throw new Error(updateError.message);
    }

    await supabase.from("audit_logs").insert({
      document_id: doc.id, user_id: user.id, action_type: "created", new_value: updatedDoc,
    });

    return updatedDoc;
  } catch (ocrError) {
    // DUPLICATE hatasını olduğu gibi yukarı taşı (UI yakalayacak)
    if (ocrError instanceof Error && ocrError.message.startsWith("DUPLICATE:")) {
      throw ocrError;
    }
    await supabase.from("documents").update({ status: "failed" }).eq("id", doc.id);
    throw ocrError;
  }
}
