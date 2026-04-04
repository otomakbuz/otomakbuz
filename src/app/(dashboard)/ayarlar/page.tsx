"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";
import { getUserWorkspace } from "@/lib/actions/auth";
import { updateWorkspace } from "@/lib/actions/workspace";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Category, Workspace } from "@/types";

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6b7280");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  useEffect(() => {
    getUserWorkspace().then((ws) => setWorkspace(ws as Workspace | null));
    getCategories().then(setCategories);
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
      toast.success("Kategori guncellendi");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Hata"); }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Bu kategoriyi silmek istediginize emin misiniz?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kategori silindi");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Hata"); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <p className="text-slate-600 text-sm mt-1">Calisma alani ve kategori ayarlarinizi yonetin.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Calisma Alani</CardTitle></CardHeader>
        <CardContent>
          <form action={handleSaveWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Calisma Alani Adi</Label>
              <Input id="name" name="name" defaultValue={workspace?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Varsayilan Para Birimi</Label>
              <Input id="currency" name="currency" defaultValue={workspace?.default_currency || "TRY"} />
            </div>
            <Button type="submit" size="sm">Kaydet</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Kategoriler</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">Yeni Kategori</Label>
              <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Kategori adi" />
            </div>
            <div>
              <Label className="text-xs">Renk</Label>
              <Input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
            </div>
            <Button size="sm" onClick={handleAddCategory}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 p-2 rounded-lg border">
                {editingId === cat.id ? (
                  <>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 flex-1" />
                    <Input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-10 h-8 p-0.5 cursor-pointer" />
                    <Button size="sm" variant="ghost" onClick={() => handleUpdateCategory(cat.id)}>Kaydet</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Iptal</Button>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 text-sm">{cat.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteCategory(cat.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
