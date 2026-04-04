"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";

export async function updateWorkspace(name: string, defaultCurrency: string) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Calisma alani bulunamadi");

  const { data, error } = await supabase
    .from("workspaces").update({ name, default_currency: defaultCurrency })
    .eq("id", workspace.id).select().single();

  if (error) throw new Error(error.message);
  return data;
}
