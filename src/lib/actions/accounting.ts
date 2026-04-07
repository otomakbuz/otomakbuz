"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace, getUser } from "./auth";
import { DEFAULT_CHART_OF_ACCOUNTS } from "@/lib/accounting/chart-of-accounts";
import { generateXbrlGlXml } from "@/lib/e-defter/xbrl-gl";
import type { Account, JournalEntry, JournalLine, TrialBalanceRow, CompanyInfo } from "@/types";

// ─── Hesap Planı ───

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("code");
  if (error) throw new Error(error.message);
  return (data || []) as Account[];
}

export async function createAccount(code: string, name: string, accountType: string) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const { data, error } = await supabase
    .from("accounts")
    .insert({ workspace_id: workspace.id, code, name, account_type: accountType })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Account;
}

export async function seedDefaultAccounts() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  // Zaten hesap var mı kontrol et
  const { count } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  if (count && count > 0) throw new Error("Hesap planı zaten yüklenmiş");

  const rows = DEFAULT_CHART_OF_ACCOUNTS.map((a) => ({
    workspace_id: workspace.id,
    code: a.code,
    name: a.name,
    account_type: a.account_type,
    parent_code: a.parent_code,
  }));

  const { error } = await supabase.from("accounts").insert(rows);
  if (error) throw new Error(error.message);
}

// ─── Yevmiye Kayıtları ───

export async function getJournalEntries(): Promise<(JournalEntry & { lines: JournalLine[] })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*, lines:journal_lines(*)")
    .order("entry_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as (JournalEntry & { lines: JournalLine[] })[];
}

export async function createJournalEntry(
  entryDate: string,
  description: string,
  lines: { account_code: string; debit_amount: number; credit_amount: number; description?: string }[]
) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  const user = await getUser();
  if (!workspace || !user) throw new Error("Oturum açılmamış");

  // Borç = Alacak kontrolü
  const totalDebit = lines.reduce((s, l) => s + l.debit_amount, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit_amount, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Borç (${totalDebit.toFixed(2)}) ve Alacak (${totalCredit.toFixed(2)}) eşit olmalıdır`);
  }

  const { data: entry, error: entryError } = await supabase
    .from("journal_entries")
    .insert({
      workspace_id: workspace.id,
      entry_date: entryDate,
      description,
      created_by: user.id,
    })
    .select()
    .single();
  if (entryError) throw new Error(entryError.message);

  const lineRows = lines.map((l) => ({
    journal_entry_id: entry.id,
    account_code: l.account_code,
    debit_amount: l.debit_amount,
    credit_amount: l.credit_amount,
    description: l.description || null,
  }));

  const { error: linesError } = await supabase.from("journal_lines").insert(lineRows);
  if (linesError) throw new Error(linesError.message);

  return entry as JournalEntry;
}

export async function postJournalEntry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("journal_entries")
    .update({ is_posted: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient();
  // Sadece onaylanmamış silinebilir
  const { data: entry } = await supabase
    .from("journal_entries")
    .select("is_posted")
    .eq("id", id)
    .single();

  if (entry?.is_posted) throw new Error("Onaylanmış yevmiye kaydı silinemez");

  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Mizan ───

export async function getTrialBalance(date?: string): Promise<TrialBalanceRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_trial_balance", {
    p_date: date || new Date().toISOString().split("T")[0],
  });
  if (error) throw new Error(error.message);
  return (data || []) as TrialBalanceRow[];
}

// ─── E-Defter Export ───

export async function exportEDefter(month: number, year: number): Promise<{ xml: string; filename: string }> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  // Firma bilgilerini al
  const { data: companyData } = await supabase
    .from("workspaces")
    .select("name, company_tax_id, company_tax_office, company_address, company_phone, company_email")
    .eq("id", workspace.id)
    .single();
  const company = companyData as CompanyInfo & { name: string };

  if (!company?.company_tax_id) {
    throw new Error("E-Defter için firma VKN bilgisi gerekli. Ayarlar > E-Fatura sekmesinden girin.");
  }

  // Dönemin onaylanmış yevmiye kayıtlarını al
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select("*, lines:journal_lines(*)")
    .eq("is_posted", true)
    .gte("entry_date", startDate)
    .lt("entry_date", endDate)
    .order("entry_number");

  if (error) throw new Error(error.message);
  if (!entries || entries.length === 0) {
    throw new Error("Bu dönemde onaylanmış yevmiye kaydı bulunamadı.");
  }

  const xml = generateXbrlGlXml(
    entries as (JournalEntry & { lines: JournalLine[] })[],
    company,
    { month, year }
  );

  const filename = `e-defter_${year}-${String(month).padStart(2, "0")}.xml`;
  return { xml, filename };
}
