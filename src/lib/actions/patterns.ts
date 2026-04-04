"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RecurringPattern } from "@/types";

// Tekrarlayan harcamaları tespit et (RPC çağrısı)
export async function detectRecurringPatterns(): Promise<RecurringPattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("detect_recurring_patterns");
  if (error) throw new Error(error.message);
  revalidatePath("/panel");
  return (data || []) as RecurringPattern[];
}

// Mevcut patternleri getir (tespit çalıştırmadan)
export async function getRecurringPatterns(): Promise<RecurringPattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_patterns")
    .select("*, contact:contacts(company_name)")
    .eq("is_active", true)
    .order("next_expected", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    company_name: (p.contact as Record<string, unknown> | null)?.company_name || "Bilinmiyor",
  })) as RecurringPattern[];
}

// Firma bazlı patternler
export async function getContactPatterns(contactId: string): Promise<RecurringPattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_patterns")
    .select("*")
    .eq("contact_id", contactId)
    .eq("is_active", true)
    .order("next_expected", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as RecurringPattern[];
}

// Pattern deaktif et
export async function deactivatePattern(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recurring_patterns")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/panel");
}
