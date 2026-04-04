"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import { revalidatePath } from "next/cache";
import type { LedgerEntry, ContactBalance, BalanceSummary, LedgerEntryType } from "@/types";

// Tüm firma bakiyeleri (cari hesap listesi)
export async function getAllBalances(): Promise<ContactBalance[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_all_balances");
  if (error) throw new Error(error.message);
  return (data || []) as ContactBalance[];
}

// Tek firma bakiyesi
export async function getContactBalance(contactId: string): Promise<BalanceSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_contact_balance", { p_contact_id: contactId });
  if (error) throw new Error(error.message);
  return (data || { debit: 0, credit: 0, balance: 0 }) as BalanceSummary;
}

// Firma ekstre hareketleri
export async function getContactLedgerEntries(contactId: string): Promise<LedgerEntry[]> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*, document:documents(id, supplier_name, document_number, total_amount, direction)")
    .eq("workspace_id", workspace.id)
    .eq("contact_id", contactId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as LedgerEntry[];
}

// Manuel hareket ekle
export async function createLedgerEntry(data: {
  contact_id: string;
  entry_type: LedgerEntryType;
  amount: number;
  description?: string;
  entry_date?: string;
  currency?: string;
}): Promise<LedgerEntry> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Workspace bulunamadi");

  const { data: entry, error } = await supabase
    .from("ledger_entries")
    .insert({
      workspace_id: workspace.id,
      contact_id: data.contact_id,
      entry_type: data.entry_type,
      amount: data.amount,
      currency: data.currency || "TRY",
      description: data.description || null,
      entry_date: data.entry_date || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/cari");
  revalidatePath(`/cari/${data.contact_id}`);
  return entry as LedgerEntry;
}

// Hareket sil
export async function deleteLedgerEntry(id: string, contactId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("ledger_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/cari");
  revalidatePath(`/cari/${contactId}`);
}

// Belge dogrulandiginda otomatik cari hareket olustur
export async function createLedgerEntryFromDocument(
  documentId: string,
  contactId: string,
  amount: number,
  direction: "income" | "expense",
  supplierName: string,
  documentDate?: string
): Promise<void> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return;

  // Ayni belge icin zaten hareket var mi kontrol et
  const { data: existing } = await supabase
    .from("ledger_entries")
    .select("id")
    .eq("document_id", documentId)
    .limit(1);

  if (existing && existing.length > 0) return; // Duplicate engelle

  // Gider belgesi -> debit (firmadan aldik), Gelir belgesi -> credit (firmaya sattik)
  const entryType: LedgerEntryType = direction === "expense" ? "debit" : "credit";

  await supabase.from("ledger_entries").insert({
    workspace_id: workspace.id,
    contact_id: contactId,
    document_id: documentId,
    entry_type: entryType,
    amount,
    currency: "TRY",
    description: `${direction === "expense" ? "Gider" : "Gelir"} belgesi: ${supplierName}`,
    entry_date: documentDate || new Date().toISOString().split("T")[0],
  });

  revalidatePath("/cari");
  revalidatePath(`/cari/${contactId}`);
}
