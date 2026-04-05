"use server";

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export async function getCategories() {
  const supabase = await createClient();

  // RLS policy 'categories_select' zaten workspace_id = get_user_workspace_id()
  // ile filtreliyor — ekstra auth + workspace round-trip'e gerek yok.
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    // Oturum yoksa boş liste dön (RLS 0 satır döndürür, ama güvenli taraf)
    return [] as Category[];
  }
  return (data || []) as Category[];
}

export async function createCategory(name: string, color: string) {
  const supabase = await createClient();

  // Tek SQL çağrısı ile workspace id'yi al (auth + workspace table yerine)
  const { data: wsId } = await supabase.rpc("get_user_workspace_id");
  if (!wsId) throw new Error("Calisma alani bulunamadi");

  const { data, error } = await supabase
    .from("categories").insert({ workspace_id: wsId, name, color })
    .select().single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function updateCategory(id: string, name: string, color: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories").update({ name, color }).eq("id", id).select().single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
