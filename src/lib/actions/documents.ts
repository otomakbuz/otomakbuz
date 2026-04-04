"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { DocumentFilters, Document } from "@/types";

export async function getDocuments(filters?: DocumentFilters) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  let query = supabase
    .from("documents")
    .select("*, category:categories(*)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `supplier_name.ilike.%${filters.search}%,document_number.ilike.%${filters.search}%,raw_ocr_text.ilike.%${filters.search}%`
    );
  }
  if (filters?.category_id) query = query.eq("category_id", filters.category_id);
  if (filters?.document_type) query = query.eq("document_type", filters.document_type);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.date_from) query = query.gte("issue_date", filters.date_from);
  if (filters?.date_to) query = query.lte("issue_date", filters.date_to);
  if (filters?.amount_min) query = query.gte("total_amount", filters.amount_min);
  if (filters?.amount_max) query = query.lte("total_amount", filters.amount_max);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as Document[];
}

export async function getDocument(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Document;
}

export async function updateDocument(id: string, updates: Partial<Document>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum acilmamis");

  const { data: oldDoc } = await supabase.from("documents").select("*").eq("id", id).single();

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select("*, category:categories(*)")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    document_id: id, user_id: user.id, action_type: "updated",
    old_value: oldDoc, new_value: data,
  });

  return data as Document;
}

export async function verifyDocument(id: string) {
  return updateDocument(id, { status: "verified" } as Partial<Document>);
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum acilmamis");

  await supabase.from("audit_logs").insert({
    document_id: id, user_id: user.id, action_type: "deleted",
    old_value: null, new_value: null,
  });

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getDocumentAuditLogs(documentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) {
    return {
      documents_this_month: 0, total_expense_this_month: 0,
      pending_review_count: 0, category_distribution: [], recent_documents: [],
    };
  }

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const { count: docsThisMonth } = await supabase
    .from("documents").select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id).gte("created_at", firstOfMonth);

  const { data: expenseData } = await supabase
    .from("documents").select("total_amount")
    .eq("workspace_id", workspace.id).gte("created_at", firstOfMonth)
    .not("total_amount", "is", null);

  const totalExpense = expenseData?.reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;

  const { count: pendingCount } = await supabase
    .from("documents").select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id).eq("status", "needs_review");

  const { data: catData } = await supabase
    .from("documents")
    .select("category_id, total_amount, category:categories(name, color)")
    .eq("workspace_id", workspace.id)
    .not("category_id", "is", null).not("total_amount", "is", null);

  const categoryMap = new Map<string, { name: string; color: string; total: number }>();
  catData?.forEach((d) => {
    const cat = d.category as unknown as { name: string; color: string } | null;
    if (cat && d.category_id) {
      const existing = categoryMap.get(d.category_id);
      if (existing) { existing.total += d.total_amount || 0; }
      else { categoryMap.set(d.category_id, { name: cat.name, color: cat.color, total: d.total_amount || 0 }); }
    }
  });

  const { data: recentDocs } = await supabase
    .from("documents").select("*, category:categories(*)")
    .eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(5);

  return {
    documents_this_month: docsThisMonth || 0,
    total_expense_this_month: totalExpense,
    pending_review_count: pendingCount || 0,
    category_distribution: Array.from(categoryMap.values()),
    recent_documents: (recentDocs || []) as Document[],
  };
}
