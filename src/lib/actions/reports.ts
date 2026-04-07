"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type {
  MonthlyTrend,
  SupplierRanking,
  CategoryBreakdown,
  CashflowProjection,
  YearlySummary,
  VatSummary,
  IncomeStatementData,
  BalanceSheetData,
} from "@/types";

export async function getMonthlyTrends(months = 12): Promise<MonthlyTrend[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_monthly_trends", { p_months: months });
  if (error) throw new Error(error.message);
  return (data || []) as MonthlyTrend[];
}

export async function getSupplierRanking(limit = 10, direction = "expense"): Promise<SupplierRanking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_supplier_ranking", {
    p_limit: limit,
    p_direction: direction,
  });
  if (error) throw new Error(error.message);
  return (data || []) as SupplierRanking[];
}

export async function getCategoryBreakdown(direction = "expense"): Promise<CategoryBreakdown[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_category_breakdown", {
    p_direction: direction,
  });
  if (error) throw new Error(error.message);
  return (data || []) as CategoryBreakdown[];
}

export async function getCashflowProjection(months = 3): Promise<CashflowProjection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_cashflow_projection", { p_months: months });
  if (error) throw new Error(error.message);
  return (data || []) as CashflowProjection[];
}

export async function getYearlySummary(): Promise<YearlySummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_yearly_summary");
  if (error) throw new Error(error.message);
  return (data || []) as YearlySummary[];
}

// ─── KDV Beyanname Özeti ───

export async function getVatSummary(month?: number, year?: number): Promise<VatSummary> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();
  const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
  const endDate = m === 12
    ? `${y + 1}-01-01`
    : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const { data: docs } = await supabase
    .from("documents")
    .select("direction, vat_amount, vat_rate, subtotal_amount, total_amount, status")
    .eq("workspace_id", workspace.id)
    .in("status", ["verified", "needs_review"])
    .gte("issue_date", startDate)
    .lt("issue_date", endDate);

  const rows = docs || [];

  // KDV oranlarına göre grupla
  const rateMap = new Map<number, { base: number; vat: number; count: number }>();
  let salesVat = 0;
  let purchaseVat = 0;

  for (const doc of rows) {
    const rate = doc.vat_rate ?? 18;
    const vatAmt = Number(doc.vat_amount) || 0;
    const base = Number(doc.subtotal_amount) || Number(doc.total_amount) || 0;

    const existing = rateMap.get(rate) || { base: 0, vat: 0, count: 0 };
    existing.base += base;
    existing.vat += vatAmt;
    existing.count++;
    rateMap.set(rate, existing);

    if (doc.direction === "income") salesVat += vatAmt;
    else purchaseVat += vatAmt;
  }

  const byRate = Array.from(rateMap.entries())
    .map(([rate, data]) => ({ rate, ...data }))
    .sort((a, b) => a.rate - b.rate);

  return {
    month: m,
    year: y,
    salesVat,
    purchaseVat,
    netPayable: salesVat - purchaseVat,
    documentCount: rows.length,
    byRate,
  };
}

// ─── Gelir Tablosu ───

export async function getIncomeStatement(dateFrom?: string, dateTo?: string): Promise<IncomeStatementData> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  let query = supabase
    .from("documents")
    .select("direction, total_amount, vat_amount, category:categories(name), status")
    .eq("workspace_id", workspace.id)
    .in("status", ["verified"]);

  if (dateFrom) query = query.gte("issue_date", dateFrom);
  if (dateTo) query = query.lte("issue_date", dateTo);

  const { data: docs } = await query;
  const rows = docs || [];

  let totalIncome = 0;
  let totalExpense = 0;
  let totalVat = 0;
  const expenseByCategory = new Map<string, number>();

  for (const doc of rows) {
    const amount = Number(doc.total_amount) || 0;
    totalVat += Number(doc.vat_amount) || 0;

    if (doc.direction === "income") {
      totalIncome += amount;
    } else {
      totalExpense += amount;
      const cat = doc.category as unknown as { name: string } | null;
      const catName = cat?.name || "Kategorisiz";
      expenseByCategory.set(catName, (expenseByCategory.get(catName) || 0) + amount);
    }
  }

  return {
    totalIncome,
    totalExpense,
    grossProfit: totalIncome - totalExpense,
    totalVat,
    netProfit: totalIncome - totalExpense,
    expenseBreakdown: Array.from(expenseByCategory.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

// ─── Bilanço ───

export async function getBalanceSheet(): Promise<BalanceSheetData> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  // Hesap bakiyelerini mizan'dan al
  const { data: trialData } = await supabase.rpc("get_trial_balance");
  const trial = (trialData || []) as Array<{
    code: string; name: string; account_type: string;
    total_debit: number; total_credit: number; balance: number;
  }>;

  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  const assets: { code: string; name: string; balance: number }[] = [];
  const liabilities: { code: string; name: string; balance: number }[] = [];
  const equity: { code: string; name: string; balance: number }[] = [];

  for (const row of trial) {
    const balance = Number(row.balance);
    if (row.account_type === "asset") {
      totalAssets += balance;
      assets.push({ code: row.code, name: row.name, balance });
    } else if (row.account_type === "liability") {
      totalLiabilities += Math.abs(balance);
      liabilities.push({ code: row.code, name: row.name, balance: Math.abs(balance) });
    } else if (row.account_type === "equity") {
      totalEquity += Math.abs(balance);
      equity.push({ code: row.code, name: row.name, balance: Math.abs(balance) });
    }
  }

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
  };
}
