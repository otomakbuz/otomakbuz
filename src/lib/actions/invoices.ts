"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { Document, CompanyInfo } from "@/types";

export async function getInvoiceData(documentId: string) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

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

  return {
    document: docResult.data as Document,
    company: companyResult.data as CompanyInfo & { name: string },
  };
}
