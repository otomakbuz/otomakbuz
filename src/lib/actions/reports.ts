"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  MonthlyTrend,
  SupplierRanking,
  CategoryBreakdown,
  CashflowProjection,
  YearlySummary,
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
