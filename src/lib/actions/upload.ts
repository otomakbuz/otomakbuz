"use server";

import { createClient } from "@/lib/supabase/server";
import { getOcrAdapter } from "@/lib/ocr";
import { getUserWorkspace, getUser } from "./auth";

export async function uploadAndProcessDocument(formData: FormData) {
  const supabase = await createClient();
  const user = await getUser();
  const workspace = await getUserWorkspace();
  if (!user || !workspace) throw new Error("Oturum acilmamis");

  const file = formData.get("file") as File;
  if (!file) throw new Error("Dosya bulunamadi");

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filePath = `${workspace.id}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);
  if (uploadError) throw new Error(`Yukleme hatasi: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(filePath);

  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({ workspace_id: workspace.id, user_id: user.id, original_file_url: publicUrl, file_type: fileExt, status: "processing" })
    .select().single();

  if (insertError) throw new Error(insertError.message);

  try {
    const ocr = getOcrAdapter();
    const result = await ocr.processDocument(publicUrl, fileExt);

    const { data: updatedDoc, error: updateError } = await supabase
      .from("documents")
      .update({
        document_type: result.document_type, supplier_name: result.supplier_name,
        supplier_tax_id: result.supplier_tax_id, document_number: result.document_number,
        issue_date: result.issue_date, issue_time: result.issue_time,
        subtotal_amount: result.subtotal_amount, vat_amount: result.vat_amount,
        vat_rate: result.vat_rate, total_amount: result.total_amount,
        currency: result.currency, payment_method: result.payment_method,
        raw_ocr_text: result.raw_ocr_text, confidence_score: result.confidence_score,
        field_scores: result.field_scores,
        parsed_json: result as unknown as Record<string, unknown>,
        status: "needs_review",
      })
      .eq("id", doc.id).select("*, category:categories(*)").single();

    if (updateError) throw new Error(updateError.message);

    await supabase.from("audit_logs").insert({
      document_id: doc.id, user_id: user.id, action_type: "created", new_value: updatedDoc,
    });

    return updatedDoc;
  } catch (ocrError) {
    await supabase.from("documents").update({ status: "failed" }).eq("id", doc.id);
    throw ocrError;
  }
}
