"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  inviteMember, cancelInvitation, updateMemberRole, removeMember,
} from "@/lib/actions/team";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Users, Mail, Crown, Pencil, Eye, Trash2, Send, Clock, X,
} from "lucide-react";
import type { WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from "@/types";

const roleLabels: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  owner: { label: "Sahip", icon: Crown, color: "text-receipt-brown bg-receipt-gold/15" },
  editor: { label: "Düzenleyici", icon: Pencil, color: "text-blue-700 bg-blue-50" },
  viewer: { label: "İzleyici", icon: Eye, color: "text-ink-muted bg-surface" },
};

interface TeamTabProps {
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  currentRole: WorkspaceRole;
}

export function TeamTab({ members: initialMembers, invitations: initialInvitations, currentRole }: TeamTabProps) {
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("editor");
  const [sending, setSending] = useState(false);

  const isOwner = currentRole === "owner";

  async function handleInvite() {
    if (!email.trim()) { toast.error("E-posta gerekli"); return; }
    setSending(true);
    try {
      const inv = await inviteMember(email.trim(), role);
      setInvitations((prev) => [inv, ...prev]);
      setEmail("");
      toast.success(`${email} adresine davet gonderildi`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setSending(false);
    }
  }

  async function handleCancelInvite(id: string) {
    try {
      await cancelInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      toast.success("Davet iptal edildi");
    } catch { toast.error("Hata"); }
  }

  async function handleRoleChange(memberId: string, newRole: WorkspaceRole) {
    try {
      await updateMemberRole(memberId, newRole);
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
      toast.success("Rol güncellendi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Bu üyeyi çıkarmak istediğinize emin misiniz?")) return;
    try {
      await removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Üye çıkarıldı");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite form — sadece owner */}
      {isOwner && (
        <div className="receipt-card rounded">
          <div className="px-5 py-4 border-b border-paper-lines">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-receipt-brown" />
              <h3 className="font-semibold text-ink text-sm">Üye Davet Et</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs text-ink-muted font-medium">E-posta</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@sirket.com"
                  className="h-9 text-sm border-paper-lines bg-paper"
                />
              </div>
              <div className="w-32">
                <Label className="text-xs text-ink-muted font-medium">Rol</Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                  className="w-full h-9 px-2 text-sm rounded border border-paper-lines bg-paper text-ink"
                >
                  <option value="editor">Düzenleyici</option>
                  <option value="viewer">İzleyici</option>
                </select>
              </div>
              <Button
                onClick={handleInvite}
                disabled={sending}
                className="h-9 bg-receipt-brown text-white hover:bg-receipt-brown-dark"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {sending ? "..." : "Gönder"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="receipt-card rounded">
        <div className="px-5 py-4 border-b border-paper-lines flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-receipt-brown" />
            <h3 className="font-semibold text-ink text-sm">Takım Üyeleri</h3>
          </div>
          <span className="text-xs text-ink-faint">{members.length} üye</span>
        </div>
        <div className="divide-y divide-paper-lines/50">
          {members.map((m) => {
            const config = roleLabels[m.role] || roleLabels.viewer;
            const Icon = config.icon;
            return (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3.5 group">
                <div className="w-9 h-9 rounded-full bg-receipt-gold/12 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-receipt-brown">
                    {(m.full_name || m.email || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {m.full_name || "Belirtilmemiş"}
                  </p>
                  {m.email && (
                    <p className="text-xs text-ink-faint truncate">{m.email}</p>
                  )}
                </div>

                {/* Role badge / selector */}
                {isOwner && m.role !== "owner" ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value as WorkspaceRole)}
                    className="text-xs px-2 py-1 rounded border border-paper-lines bg-paper text-ink"
                  >
                    <option value="editor">Düzenleyici</option>
                    <option value="viewer">İzleyici</option>
                  </select>
                ) : (
                  <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium", config.color)}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </span>
                )}

                {/* Remove button */}
                {isOwner && m.role !== "owner" && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 transition-opacity p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="receipt-card rounded">
          <div className="px-5 py-4 border-b border-paper-lines flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-receipt-brown" />
              <h3 className="font-semibold text-ink text-sm">Bekleyen Davetler</h3>
            </div>
            <span className="text-xs text-ink-faint">{invitations.length} davet</span>
          </div>
          <div className="divide-y divide-paper-lines/50">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3 group">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{inv.email}</p>
                  <p className="text-[10px] text-ink-faint">
                    {roleLabels[inv.role]?.label || inv.role} &bull; {new Date(inv.expires_at).toLocaleDateString("tr-TR")} tarihine kadar
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleCancelInvite(inv.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 transition-opacity p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
