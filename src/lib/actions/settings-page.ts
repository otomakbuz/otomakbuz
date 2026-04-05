"use server";

// Ayarlar sayfası için tek round-trip veri yükleyici.
// Next.js server action'ları aynı client oturumunda SERİ çalıştırır
// (race condition'ları engellemek için). Bu yüzden 5 ayrı action yerine
// tek bir action içinde Promise.allSettled ile paralelleştiriyoruz.
//
// allSettled tercih sebebi: bir sorgu fail olsa bile diğerlerini UI'da
// göstermek istiyoruz (kısmi degradation). Hata bilgisi client'a iletiliyor
// ki kullanıcı toast ile haberdar olsun.

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
  /** Herhangi bir alt sorgu fail olduysa kullanıcıya gösterilecek özet */
  errors: string[];
}

function valueOr<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  label: string,
  errors: string[]
): T {
  if (result.status === "fulfilled") return result.value;
  const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
  console.error(`[getSettingsPageData] ${label} failed:`, msg);
  errors.push(label);
  return fallback;
}

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const [wsRes, catsRes, memsRes, invsRes, roleRes] = await Promise.allSettled([
    getUserWorkspace(),
    getCategories(),
    getTeamMembers(),
    getPendingInvitations(),
    getUserRole(),
  ]);

  const errors: string[] = [];

  return {
    workspace: valueOr(wsRes, null, "workspace", errors) as Workspace | null,
    categories: valueOr(catsRes, [] as Category[], "categories", errors),
    members: valueOr(memsRes, [] as WorkspaceMember[], "members", errors),
    invitations: valueOr(invsRes, [] as WorkspaceInvitation[], "invitations", errors),
    role: valueOr(roleRes, "viewer" as WorkspaceRole, "role", errors),
    errors,
  };
}
