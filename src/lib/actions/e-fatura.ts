"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import { generateUblTrXml, validateForEInvoice } from "@/lib/e-fatura/ubl-tr";
import type { CompanyInfo, Document } from "@/types";

export async function getCompanyInfo(): Promise<CompanyInfo & { name: string }> {
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("name, company_tax_id, company_tax_office, company_address, company_phone, company_email")
    .eq("id", workspace.id)
    .single();

  if (error) throw new Error(error.message);
  return data as CompanyInfo & { name: string };
}

export async function updateCompanyInfo(info: Partial<CompanyInfo>) {
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update(info)
    .eq("id", workspace.id);

  if (error) throw new Error(error.message);
}

export async function generateEFaturaXml(documentId: string): Promise<{ xml: string; filename: string }> {
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const supabase = await createClient();

  const [docResult, companyResult] = await Promise.all([
    supabase
      .from("documents")
      .select("*, category:categories(*)")
      .eq("id", documentId)
      .single(),
    supabase
      .from("workspaces")
      .select("name, company_tax_id, company_tax_office, company_address, company_phone, company_email")
      .eq("id", workspace.id)
      .single(),
  ]);

  if (docResult.error) throw new Error(docResult.error.message);
  if (companyResult.error) throw new Error(companyResult.error.message);

  const doc = docResult.data as Document;
  const company = companyResult.data as CompanyInfo & { name: string };

  const errors = validateForEInvoice(doc, company);
  if (errors.length > 0) {
    throw new Error(`E-Fatura oluşturulamadı: ${errors.map((e) => e.message).join(", ")}`);
  }

  const xml = generateUblTrXml(doc, company, company.name);
  const filename = `e-fatura_${doc.document_number || doc.id.slice(0, 8)}_${doc.issue_date || "tarihsiz"}.xml`;

  // e_invoice_uuid yoksa oluştur ve kaydet
  if (!doc.e_invoice_uuid) {
    await supabase
      .from("documents")
      .update({
        e_invoice_uuid: crypto.randomUUID(),
        e_invoice_status: "draft",
      })
      .eq("id", documentId);
  }

  return { xml, filename };
}
