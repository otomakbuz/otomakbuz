"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import { parseBankStatement } from "@/lib/bank/statement-parser";
import type {
  BankAccount,
  BankTransaction,
  BankMatchStatus,
  BankSummary,
} from "@/types";

// ─── Bank Accounts ───

export async function getBankAccounts(): Promise<BankAccount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .order("bank_name");
  if (error) throw new Error(error.message);
  return (data || []) as BankAccount[];
}

export async function createBankAccount(account: {
  bank_name: string;
  account_name: string;
  iban?: string;
  currency?: string;
  current_balance?: number;
}) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const { data, error } = await supabase
    .from("bank_accounts")
    .insert({ workspace_id: workspace.id, ...account })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as BankAccount;
}

export async function updateBankAccount(
  id: string,
  updates: Partial<Omit<BankAccount, "id" | "workspace_id" | "created_at">>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as BankAccount;
}

export async function deleteBankAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bank_accounts")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Bank Transactions ───

export async function getBankTransactions(
  accountId: string,
  filters?: {
    status?: BankMatchStatus;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
  }
): Promise<BankTransaction[]> {
  const supabase = await createClient();
  let query = supabase
    .from("bank_transactions")
    .select("*, document:documents(id, supplier_name, total_amount, issue_date, document_type)")
    .eq("bank_account_id", accountId)
    .order("transaction_date", { ascending: false })
    .limit(500);

  if (filters?.status) query = query.eq("match_status", filters.status);
  if (filters?.dateFrom) query = query.gte("transaction_date", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("transaction_date", filters.dateTo);
  if (filters?.amountMin !== undefined) query = query.gte("amount", filters.amountMin);
  if (filters?.amountMax !== undefined) query = query.lte("amount", filters.amountMax);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as BankTransaction[];
}

export async function importBankStatement(
  accountId: string,
  csvContent: string
): Promise<{ imported: number; skipped: number }> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const rows = parseBankStatement(csvContent);
  if (rows.length === 0)
    throw new Error("Dosyada geçerli işlem bulunamadı. Lütfen CSV formatını kontrol edin.");

  // Mevcut işlemleri kontrol et (tarih + tutar + açıklama benzersizliği)
  const { data: existing } = await supabase
    .from("bank_transactions")
    .select("transaction_date, amount, description")
    .eq("bank_account_id", accountId);

  const existingSet = new Set(
    (existing || []).map(
      (e: { transaction_date: string; amount: number; description: string }) =>
        `${e.transaction_date}|${e.amount}|${e.description}`
    )
  );

  const toInsert = rows.filter(
    (r) => !existingSet.has(`${r.transaction_date}|${r.amount}|${r.description}`)
  );

  if (toInsert.length > 0) {
    const insertData = toInsert.map((r) => ({
      workspace_id: workspace.id,
      bank_account_id: accountId,
      transaction_date: r.transaction_date,
      value_date: r.value_date || null,
      description: r.description,
      amount: r.amount,
      balance_after: r.balance_after ?? null,
      reference_no: r.reference_no || null,
      match_status: "unmatched" as const,
    }));

    // Batch insert (Supabase'de max 1000)
    const batchSize = 500;
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);
      const { error } = await supabase.from("bank_transactions").insert(batch);
      if (error) throw new Error(error.message);
    }
  }

  return { imported: toInsert.length, skipped: rows.length - toInsert.length };
}

// ─── Auto-match ───

export async function autoMatchTransactions(
  accountId: string
): Promise<{ matched: number }> {
  const supabase = await createClient();

  // Eşleşmemiş hareketleri al
  const { data: unmatched, error: txErr } = await supabase
    .from("bank_transactions")
    .select("*")
    .eq("bank_account_id", accountId)
    .eq("match_status", "unmatched");
  if (txErr) throw new Error(txErr.message);
  if (!unmatched || unmatched.length === 0) return { matched: 0 };

  // Belgeleri al (son 1 yıl, eşleşmemiş olanlar öncelikli)
  const { data: documents, error: docErr } = await supabase
    .from("documents")
    .select("id, supplier_name, total_amount, issue_date, document_type, contact_id")
    .gte("issue_date", new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0])
    .order("issue_date", { ascending: false })
    .limit(1000);
  if (docErr) throw new Error(docErr.message);
  if (!documents || documents.length === 0) return { matched: 0 };

  // Zaten eşleşmiş belge ID'lerini bul
  const { data: alreadyMatched } = await supabase
    .from("bank_transactions")
    .select("matched_document_id")
    .eq("bank_account_id", accountId)
    .in("match_status", ["matched", "manual"])
    .not("matched_document_id", "is", null);

  const matchedDocIds = new Set(
    (alreadyMatched || []).map((m: { matched_document_id: string }) => m.matched_document_id)
  );

  const availableDocs = documents.filter(
    (d: { id: string }) => !matchedDocIds.has(d.id)
  );

  let matchedCount = 0;

  for (const tx of unmatched) {
    let bestMatch: { docId: string; confidence: number } | null = null;

    for (const doc of availableDocs) {
      if (!doc.total_amount) continue;

      let confidence = 0;

      // Tutar eşleşmesi (tam eşleşme = 50 puan)
      const txAbs = Math.abs(tx.amount);
      const docAbs = Math.abs(doc.total_amount);
      if (Math.abs(txAbs - docAbs) < 0.01) {
        confidence += 50;
      } else if (Math.abs(txAbs - docAbs) / docAbs < 0.02) {
        // %2 fark toleransı = 30 puan
        confidence += 30;
      } else {
        continue; // Tutar hiç uyuşmuyorsa atla
      }

      // Tarih yakınlığı (7 gün içinde = 30 puan)
      if (doc.issue_date && tx.transaction_date) {
        const txDate = new Date(tx.transaction_date).getTime();
        const docDate = new Date(doc.issue_date).getTime();
        const dayDiff = Math.abs(txDate - docDate) / 86400000;
        if (dayDiff <= 1) confidence += 30;
        else if (dayDiff <= 3) confidence += 25;
        else if (dayDiff <= 7) confidence += 15;
        else if (dayDiff <= 14) confidence += 5;
      }

      // Tedarikçi adı eşleşmesi (açıklamada geçiyorsa = 20 puan)
      if (doc.supplier_name && tx.description) {
        const supplierLower = doc.supplier_name.toLowerCase();
        const descLower = tx.description.toLowerCase();
        // Tedarikçi adının en az 4 karakterlik bir parçası açıklamada var mı
        const words = supplierLower.split(/\s+/).filter((w: string) => w.length >= 4);
        const nameMatch = words.some((w: string) => descLower.includes(w));
        if (nameMatch) confidence += 20;
      }

      if (confidence > (bestMatch?.confidence || 0)) {
        bestMatch = { docId: doc.id, confidence };
      }
    }

    // Eşik: en az 65 güven skoru
    if (bestMatch && bestMatch.confidence >= 65) {
      const { error: updateErr } = await supabase
        .from("bank_transactions")
        .update({
          matched_document_id: bestMatch.docId,
          match_confidence: bestMatch.confidence,
          match_status: "matched",
        })
        .eq("id", tx.id);

      if (!updateErr) {
        matchedCount++;
        // Bu belgeyi artık kullanılmış say
        const idx = availableDocs.findIndex((d: { id: string }) => d.id === bestMatch!.docId);
        if (idx !== -1) availableDocs.splice(idx, 1);
      }
    }
  }

  return { matched: matchedCount };
}

// ─── Manual match / unmatch ───

export async function manualMatchTransaction(
  transactionId: string,
  documentId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bank_transactions")
    .update({
      matched_document_id: documentId,
      match_confidence: 100,
      match_status: "manual",
    })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
}

export async function unmatchTransaction(transactionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bank_transactions")
    .update({
      matched_document_id: null,
      match_confidence: null,
      match_status: "unmatched",
    })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
}

export async function ignoreTransaction(transactionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bank_transactions")
    .update({ match_status: "ignored" })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
}

// ─── Summary ───

export async function getBankSummary(accountId: string): Promise<BankSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_transactions")
    .select("match_status")
    .eq("bank_account_id", accountId);
  if (error) throw new Error(error.message);

  const txs = data || [];
  return {
    total: txs.length,
    matched: txs.filter((t: { match_status: string }) => t.match_status === "matched").length,
    unmatched: txs.filter((t: { match_status: string }) => t.match_status === "unmatched").length,
    ignored: txs.filter((t: { match_status: string }) => t.match_status === "ignored").length,
    manual: txs.filter((t: { match_status: string }) => t.match_status === "manual").length,
  };
}

// ─── Get suggested matches for a transaction ───

export async function getSuggestedMatches(
  transactionId: string
): Promise<
  { document_id: string; supplier_name: string | null; total_amount: number | null; issue_date: string | null; confidence: number }[]
> {
  const supabase = await createClient();

  // İşlemi al
  const { data: tx, error: txErr } = await supabase
    .from("bank_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();
  if (txErr || !tx) throw new Error("İşlem bulunamadı");

  // Belgeleri al
  const { data: documents, error: docErr } = await supabase
    .from("documents")
    .select("id, supplier_name, total_amount, issue_date, document_type")
    .order("issue_date", { ascending: false })
    .limit(500);
  if (docErr) throw new Error(docErr.message);
  if (!documents) return [];

  const suggestions: { document_id: string; supplier_name: string | null; total_amount: number | null; issue_date: string | null; confidence: number }[] = [];

  for (const doc of documents) {
    if (!doc.total_amount) continue;

    let confidence = 0;
    const txAbs = Math.abs(tx.amount);
    const docAbs = Math.abs(doc.total_amount);

    if (Math.abs(txAbs - docAbs) < 0.01) {
      confidence += 50;
    } else if (docAbs > 0 && Math.abs(txAbs - docAbs) / docAbs < 0.05) {
      confidence += 25;
    } else {
      continue;
    }

    if (doc.issue_date && tx.transaction_date) {
      const dayDiff = Math.abs(new Date(tx.transaction_date).getTime() - new Date(doc.issue_date).getTime()) / 86400000;
      if (dayDiff <= 1) confidence += 30;
      else if (dayDiff <= 3) confidence += 25;
      else if (dayDiff <= 7) confidence += 15;
      else if (dayDiff <= 14) confidence += 5;
    }

    if (doc.supplier_name && tx.description) {
      const words = doc.supplier_name.toLowerCase().split(/\s+/).filter((w: string) => w.length >= 4);
      if (words.some((w: string) => tx.description.toLowerCase().includes(w))) {
        confidence += 20;
      }
    }

    if (confidence >= 30) {
      suggestions.push({
        document_id: doc.id,
        supplier_name: doc.supplier_name,
        total_amount: doc.total_amount,
        issue_date: doc.issue_date,
        confidence,
      });
    }
  }

  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}
