"use server";

// Ayarlar sayfası için tek round-trip veri yükleyici.
// Next.js server action'ları aynı client oturumunda SERİ çalıştırır
// (race condition'ları engellemek için). Bu yüzden 5 ayrı action yerine
// tek bir action içinde Promise.all ile paralelleştiriyoruz.

import { getUserWorkspace } from "./auth";
import { getCategories } from "./categories";
import { getTeamMembers, getPendingInvitations, getUserRole } from "./team";
import type {
  Category,
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceRole,
} from "@/types";

export interface SettingsPageData {
  workspace: Workspace | null;
  categories: Category[];
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  role: WorkspaceRole;
}

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const [workspace, categories, members, invitations, role] = await Promise.all([
    getUserWorkspace().catch(() => null),
    getCategories().catch(() => [] as Category[]),
    getTeamMembers().catch(() => [] as WorkspaceMember[]),
    getPendingInvitations().catch(() => [] as WorkspaceInvitation[]),
    getUserRole().catch(() => "viewer" as WorkspaceRole),
  ]);

  return {
    workspace: workspace as Workspace | null,
    categories,
    members,
    invitations,
    role,
  };
}
