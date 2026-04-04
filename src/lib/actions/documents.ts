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
  if (filters?.direction) query = query.eq("direction", filters.direction);
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

  // Sadece güncellenen alanların eski değerlerini al (tüm belge yerine diff)
  const updateKeys = Object.keys(updates);
  const { data: oldDoc } = await supabase.from("documents").select(updateKeys.join(",")).eq("id", id).single();

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select("*, category:categories(*)")
    .single();

  if (error) throw new Error(error.message);

  // Diff-only audit: sadece değişen alanlar kaydedilir (~%80 daha az veri)
  const oldValues: Record<string, unknown> = {};
  const newValues: Record<string, unknown> = {};
  const oldRecord = oldDoc as Record<string, unknown> | null;
  const newRecord = data as Record<string, unknown>;
  for (const key of updateKeys) {
    if (oldRecord && oldRecord[key] !== newRecord[key]) {
      oldValues[key] = oldRecord[key];
      newValues[key] = newRecord[key];
    }
  }

  // Gerçekten değişen bir şey varsa kaydet
  if (Object.keys(newValues).length > 0) {
    await supabase.from("audit_logs").insert({
      document_id: id, user_id: user.id, action_type: "updated",
      old_value: oldValues, new_value: newValues,
    });
  }

  return data as Document;
}

export async function verifyDocument(id: string) {
  const supabase = await createClient();

  // Belge bilgilerini al (cari hareket icin)
  const { data: doc } = await supabase
    .from("documents")
    .select("contact_id, total_amount, direction, supplier_name, issue_date")
    .eq("id", id)
    .single();

  const result = await updateDocument(id, { status: "verified" } as Partial<Document>);

  // Contact bagliysa ve tutar varsa otomatik cari hareket olustur
  if (doc?.contact_id && doc?.total_amount) {
    const { createLedgerEntryFromDocument } = await import("./ledger");
    await createLedgerEntryFromDocument(
      id,
      doc.contact_id,
      doc.total_amount,
      doc.direction || "expense",
      doc.supplier_name || "Bilinmeyen",
      doc.issue_date || undefined
    );
  }

  return result;
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

  // Tek RPC çağrısı — 5 ayrı sorgu yerine 1 database roundtrip
  // Fonksiyon: supabase/migrations/003_performance_optimizations.sql
  const { data, error } = await supabase.rpc("get_dashboard_stats");

  if (error || !data) {
    // RPC henüz deploy edilmediyse fallback (geliştirme ortamı)
    return getDashboardStatsFallback();
  }

  return {
    documents_this_month: data.documents_this_month ?? 0,
    total_expense_this_month: data.total_expense_this_month ?? 0,
    total_income_this_month: data.total_income_this_month ?? 0,
    net_this_month: data.net_this_month ?? 0,
    pending_review_count: data.pending_review_count ?? 0,
    category_distribution: data.category_distribution ?? [],
    recent_documents: (data.recent_documents ?? []) as Document[],
  };
}

// RPC fonksiyonu henüz yoksa fallback — Promise.all ile paralel sorgular
async function getDashboardStatsFallback() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) {
    return {
      documents_this_month: 0, total_expense_this_month: 0,
      total_income_this_month: 0, net_this_month: 0,
      pending_review_count: 0, category_distribution: [], recent_documents: [],
    };
  }

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  // Paralel sorgular — 5 ardışık yerine 5 eşzamanlı
  const [docsRes, expenseRes, pendingRes, catRes, recentRes] = await Promise.all([
    supabase
      .from("documents").select("*", { count: "exact", head: true })
      .eq("workspace_id", workspace.id).gte("created_at", firstOfMonth),
    supabase
      .from("documents").select("total_amount")
      .eq("workspace_id", workspace.id).gte("created_at", firstOfMonth)
      .not("total_amount", "is", null),
    supabase
      .from("documents").select("*", { count: "exact", head: true })
      .eq("workspace_id", workspace.id).eq("status", "needs_review"),
    supabase
      .from("documents")
      .select("category_id, total_amount, category:categories(name, color)")
      .eq("workspace_id", workspace.id)
      .not("category_id", "is", null).not("total_amount", "is", null),
    supabase
      .from("documents").select("*, category:categories(*)")
      .eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const totalExpense = expenseRes.data?.filter((d) => !('direction' in d) || (d as Record<string, unknown>).direction !== 'income').reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;
  const totalIncome = expenseRes.data?.filter((d) => (d as Record<string, unknown>).direction === 'income').reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;

  const categoryMap = new Map<string, { name: string; color: string; total: number }>();
  catRes.data?.forEach((d) => {
    const cat = d.category as unknown as { name: string; color: string } | null;
    if (cat && d.category_id) {
      const existing = categoryMap.get(d.category_id);
      if (existing) { existing.total += d.total_amount || 0; }
      else { categoryMap.set(d.category_id, { name: cat.name, color: cat.color, total: d.total_amount || 0 }); }
    }
  });

  return {
    documents_this_month: docsRes.count || 0,
    total_expense_this_month: totalExpense,
    total_income_this_month: totalIncome,
    net_this_month: totalIncome - totalExpense,
    pending_review_count: pendingRes.count || 0,
    category_distribution: Array.from(categoryMap.values()),
    recent_documents: (recentRes.data || []) as Document[],
  };
}
