"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from "@/types";

// Mevcut üyeleri getir
export async function getTeamMembers(): Promise<WorkspaceMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("*")
    .order("joined_at", { ascending: true });

  if (error) throw new Error(error.message);

  // Her üye için profil bilgisi çek
  const members = data || [];
  const userIds = members.map((m: Record<string, unknown>) => m.user_id as string);

  if (userIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles || []).map((p: Record<string, unknown>) => [p.id as string, p.full_name as string | null])
  );

  return members.map((m: Record<string, unknown>) => ({
    ...m,
    full_name: profileMap.get(m.user_id as string) || null,
  })) as WorkspaceMember[];
}

// Kullanıcının rolünü getir
export async function getUserRole(): Promise<WorkspaceRole> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_user_role");
  if (error || !data) return "viewer";
  return data as WorkspaceRole;
}

// Bekleyen davetleri getir
export async function getPendingInvitations(): Promise<WorkspaceInvitation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_invitations")
    .select("*")
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as WorkspaceInvitation[];
}

// Davet gönder
export async function inviteMember(email: string, role: WorkspaceRole = "editor"): Promise<WorkspaceInvitation> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum bulunamadi");

  // Kullanıcının owner olduğunu kontrol et
  const userRole = await getUserRole();
  if (userRole !== "owner") throw new Error("Sadece workspace sahibi davet gonderebilir");

  // Workspace ID
  const { data: wsData } = await supabase.rpc("get_user_workspace_id");
  if (!wsData) throw new Error("Workspace bulunamadi");

  // Zaten üye mi?
  const { data: existing } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", wsData)
    .eq("user_id", user.id);

  // Zaten bekleyen davet var mı?
  const { data: existingInv } = await supabase
    .from("workspace_invitations")
    .select("id")
    .eq("workspace_id", wsData)
    .eq("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());

  if (existingInv && existingInv.length > 0) {
    throw new Error("Bu e-posta adresine zaten bekleyen bir davet var");
  }

  const { data, error } = await supabase
    .from("workspace_invitations")
    .insert({
      workspace_id: wsData,
      email,
      role: role === "owner" ? "editor" : role, // owner olarak davet edilemez
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/ayarlar");
  return data as WorkspaceInvitation;
}

// Davet iptal et
export async function cancelInvitation(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_invitations")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/ayarlar");
}

// Üye rolünü değiştir
export async function updateMemberRole(memberId: string, role: WorkspaceRole): Promise<void> {
  const supabase = await createClient();

  const userRole = await getUserRole();
  if (userRole !== "owner") throw new Error("Sadece workspace sahibi rol degistirebilir");

  if (role === "owner") throw new Error("Owner rolu atanamaz");

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/ayarlar");
}

// Üyeyi çıkar
export async function removeMember(memberId: string): Promise<void> {
  const supabase = await createClient();

  const userRole = await getUserRole();
  if (userRole !== "owner") throw new Error("Sadece workspace sahibi uye cikarabilir");

  // Owner kendini çıkaramaz
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("id", memberId)
    .single();

  if (member?.role === "owner") throw new Error("Workspace sahibi cikarilmaz");

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/ayarlar");
}

// Davet kabul et
export async function acceptInvitation(token: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });

  if (error) return { success: false, error: error.message };

  const result = data as Record<string, unknown>;
  if (result.error) return { success: false, error: result.error as string };

  revalidatePath("/");
  return { success: true };
}
