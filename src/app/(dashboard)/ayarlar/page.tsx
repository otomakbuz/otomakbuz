"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";
import { updateWorkspace } from "@/lib/actions/workspace";
import { getSettingsPageData } from "@/lib/actions/settings-page";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Settings, Tag, Save, Users, Plug, Mail, FileSpreadsheet, Copy, Check, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamTab } from "@/components/settings/team-tab";
import { OcrTab } from "@/components/settings/ocr-tab";
import type { Category, Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from "@/types";

const tabs = [
  { id: "genel", label: "Genel", icon: Settings },
  { id: "kategoriler", label: "Kategoriler", icon: Tag },
  { id: "ocr", label: "OCR", icon: Brain },
  { id: "takim", label: "Takim", icon: Users },
  { id: "entegrasyon", label: "Entegrasyonlar", icon: Plug },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("genel");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6b7280");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [currentRole, setCurrentRole] = useState<WorkspaceRole>("viewer");

  useEffect(() => {
    // URL'deki ?tab=... query param'ından aktif sekmeyi belirle (hydration-safe)
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && tabs.some((x) => x.id === t)) {
      setActiveTab(t as TabId);
    }
    // Tek server action içinde Promise.allSettled ile 5 sorguyu paralel çalıştır
    // (Next.js server action'ları aynı client oturumunda seri kuyruklar,
    // bu yüzden bundle'lamak tek yoldur).
    getSettingsPageData()
      .then((data) => {
        setWorkspace(data.workspace);
        setCategories(data.categories);
        setMembers(data.members);
        setInvitations(data.invitations);
        setCurrentRole(data.role);
        if (data.errors.length > 0) {
          toast.error(
            `Bazı ayar verileri yüklenemedi: ${data.errors.join(", ")}`
          );
        }
      })
      .catch((err) => {
        console.error("[ayarlar] getSettingsPageData fatal:", err);
        toast.error("Ayarlar yüklenemedi. Lütfen sayfayı yenileyin.");
      });
  }, []);

  async function handleSaveWorkspace(formData: FormData) {
    const name = formData.get("name") as string;
    const currency = formData.get("currency") as string;
    try { await updateWorkspace(name, currency); toast.success("Ayarlar kaydedildi"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Hata"); }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    try {
      const cat = await createCategory(newCatName, newCatColor);
      setCategories((prev) => [...prev, cat]);
      setNewCatName(""); setNewCatColor("#6b7280");
      toast.success("Kategori eklendi");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Hata"); }
  }

  async function handleUpdateCategory(id: string) {
    try {
      const updated = await updateCategory(id, editName, editColor);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      toast.success("Kategori güncellendi");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Hata"); }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kategori silindi");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Hata"); }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <Settings className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Ayarlar</h1>
          <p className="text-ink-muted text-sm">Çalışma alanı, kategoriler ve takım ayarları.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="receipt-card rounded">
        <div className="flex border-b border-paper-lines">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-receipt-brown text-receipt-brown"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-paper-lines"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Genel */}
        {activeTab === "genel" && (
          <div className="p-6">
            {workspace ? (
              <form
                key={workspace.id}
                action={handleSaveWorkspace}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-ink font-medium text-sm">Çalışma Alanı Adı</Label>
                  <Input id="name" name="name" defaultValue={workspace.name || ""}
                    className="h-10 border-paper-lines bg-paper" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-ink font-medium text-sm">Varsayılan Para Birimi</Label>
                  <Input id="currency" name="currency" defaultValue={workspace.default_currency || "TRY"}
                    className="h-10 border-paper-lines bg-paper" />
                </div>
                <Button type="submit" size="sm" className="bg-receipt-brown hover:bg-receipt-brown-dark text-white">
                  <Save className="h-4 w-4 mr-2" />Kaydet
                </Button>
              </form>
            ) : (
              <div className="text-sm text-ink-faint">Yükleniyor...</div>
            )}
          </div>
        )}

        {/* Kategoriler */}
        {activeTab === "kategoriler" && (
          <div className="p-6 space-y-4">
            {/* Add new */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs text-ink-muted font-medium">Yeni Kategori</Label>
                <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Kategori adı" className="h-10 border-paper-lines bg-paper" />
              </div>
              <div>
                <Label className="text-xs text-ink-muted font-medium">Renk</Label>
                <Input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer rounded" />
              </div>
              <Button size="sm" onClick={handleAddCategory}
                className="h-10 bg-receipt-brown hover:bg-receipt-brown-dark text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 p-3 rounded border border-paper-lines hover:border-receipt-gold/50 transition-colors">
                  {editingId === cat.id ? (
                    <>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 flex-1 border-paper-lines bg-paper" />
                      <Input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-10 h-8 p-0.5 cursor-pointer rounded" />
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateCategory(cat.id)}
                        className="text-receipt-brown hover:text-receipt-brown-dark">Kaydet</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                        className="text-ink-muted">İptal</Button>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-paper shadow-sm" style={{ backgroundColor: cat.color }} />
                      <span className="flex-1 text-sm font-medium text-ink">{cat.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color); }}
                        className="text-ink-faint hover:text-ink">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-ink-faint hover:text-red-600" onClick={() => handleDeleteCategory(cat.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-ink-faint text-center py-6">Henüz kategori yok.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* OCR — tab card dışında */}
      {activeTab === "ocr" && <OcrTab />}

      {/* Takım — tab card dışında (kendi kartları var) */}
      {activeTab === "takim" && (
        <TeamTab members={members} invitations={invitations} currentRole={currentRole} />
      )}

      {/* Entegrasyonlar */}
      {activeTab === "entegrasyon" && (
        <div className="space-y-6">
          {/* E-posta ile Yükleme */}
          <div className="receipt-card rounded">
            <div className="px-5 py-4 border-b border-paper-lines">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-receipt-brown" />
                <h3 className="font-semibold text-ink text-sm">E-posta ile Belge Yükleme</h3>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-ink-muted">
                Aşağıdaki adrese fatura/makbuz eki ile e-posta gönderin. Ekler otomatik taranıp sisteme eklenir.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded border border-paper-lines bg-surface text-sm text-ink font-mono select-all">
                  {workspace?.id ? `ws-${workspace.id.slice(0, 8)}@inbound.otomakbuz.com` : "Yukleniyor..."}
                </div>
                <Button
                  variant="outline" size="sm"
                  className="border-paper-lines hover:border-receipt-gold"
                  onClick={() => {
                    const addr = workspace?.id ? `ws-${workspace.id.slice(0, 8)}@inbound.otomakbuz.com` : "";
                    navigator.clipboard.writeText(addr);
                    toast.success("Kopyalandı");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded bg-amber-50 border border-amber-200/60">
                <span className="text-amber-600 text-xs">⚠</span>
                <p className="text-xs text-amber-800">
                  Bu özellik yakın zamanda aktif olacaktır. Şimdilik belgeleri web arayüzü üzerinden yükleyebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          {/* Muhasebe Export */}
          <div className="receipt-card rounded">
            <div className="px-5 py-4 border-b border-paper-lines">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-receipt-brown" />
                <h3 className="font-semibold text-ink text-sm">Muhasebe Programı Aktarımı</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-ink-muted">
                Belgelerinizi muhasebe programınıza aktarmak için uyumlu formatlarda dışa aktarın.
              </p>
              <div className="space-y-2">
                {[
                  { name: "Paraşüt Uyumlu CSV", desc: "Paraşüt muhasebe yazılımına doğrudan import edilebilir", format: "parasut" },
                  { name: "Standart CSV", desc: "Genel amaçlı, tüm muhasebe programlarıyla uyumlu", format: "csv" },
                  { name: "Excel (XLSX)", desc: "Detaylı Excel dosyası, özet sayfası dahil", format: "excel" },
                ].map((item) => (
                  <div key={item.format} className="flex items-center gap-3 p-3 rounded border border-paper-lines hover:border-receipt-gold/50 transition-colors">
                    <div className="w-8 h-8 rounded bg-receipt-gold/10 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="h-4 w-4 text-receipt-brown" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-ink-faint">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <Check className="h-3 w-3" />
                      Hazır
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-faint">
                Dışa aktarma işlemleri için <span className="text-receipt-brown font-medium">Raporlar</span> sayfasini ziyaret edin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
