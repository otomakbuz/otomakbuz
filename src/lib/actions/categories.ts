"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { Category } from "@/types";

export async function getCategories() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  const { data, error } = await supabase
    .from("categories").select("*")
    .eq("workspace_id", workspace.id).order("name");

  if (error) throw new Error(error.message);
  return (data || []) as Category[];
}

export async function createCategory(name: string, color: string) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Calisma alani bulunamadi");

  const { data, error } = await supabase
    .from("categories").insert({ workspace_id: workspace.id, name, color })
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
