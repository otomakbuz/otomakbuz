"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccounts, seedDefaultAccounts, createAccount } from "@/lib/actions/accounting";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";
import type { Account } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  asset: "Varlık",
  liability: "Yükümlülük",
  equity: "Özkaynak",
  expense: "Gider",
  income: "Gelir",
};

const TYPE_COLORS: Record<string, string> = {
  asset: "text-blue-700 bg-blue-50",
  liability: "text-red-700 bg-red-50",
  equity: "text-purple-700 bg-purple-50",
  expense: "text-orange-700 bg-orange-50",
  income: "text-emerald-700 bg-emerald-50",
};

export function AccountsTable() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("asset");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => toast.error("Hesap planı yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  function handleSeed() {
    startTransition(async () => {
      try {
        await seedDefaultAccounts();
        const data = await getAccounts();
        setAccounts(data);
        toast.success("Tek Düzen Hesap Planı yüklendi");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleAdd() {
    if (!newCode.trim() || !newName.trim()) return;
    startTransition(async () => {
      try {
        const acc = await createAccount(newCode, newName, newType);
        setAccounts((prev) => [...prev, acc].sort((a, b) => a.code.localeCompare(b.code)));
        setNewCode("");
        setNewName("");
        setShowAdd(false);
        toast.success("Hesap eklendi");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  const filtered = search
    ? accounts.filter((a) => a.code.includes(search) || a.name.toLowerCase().includes(search.toLowerCase()))
    : accounts;

  if (loading) return <div className="p-6 text-sm text-ink-faint">Yükleniyor...</div>;

  if (accounts.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-ink-muted mb-4">Henüz hesap planı oluşturulmamış.</p>
        <Button onClick={handleSeed} disabled={isPending} className="bg-receipt-brown hover:bg-receipt-brown-dark text-white">
          <Download className="h-4 w-4 mr-2" />
          {isPending ? "Yükleniyor..." : "Tek Düzen Hesap Planı Yükle"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hesap ara (kod veya ad)..."
          className="h-9 border-paper-lines bg-paper max-w-xs"
        />
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} className="ml-auto">
          <Plus className="h-3.5 w-3.5 mr-1" />Yeni Hesap
        </Button>
      </div>

      {showAdd && (
        <div className="p-3 rounded border border-paper-lines bg-surface/50 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
            <div>
              <label className="text-xs text-ink-muted font-medium">Kod</label>
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="101" className="h-8 border-paper-lines" />
            </div>
            <div className="col-span-2 sm:col-span-1 sm:flex-1">
              <label className="text-xs text-ink-muted font-medium">Hesap Adı</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Alınan Çekler" className="h-8 border-paper-lines" />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Tür</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full h-8 px-2 rounded border border-paper-lines bg-paper text-sm">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <Button size="sm" onClick={handleAdd} disabled={isPending} className="bg-receipt-brown hover:bg-receipt-brown-dark text-white h-8 w-full sm:w-auto">Ekle</Button>
        </div>
      )}

      <div className="rounded border border-paper-lines overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface/50 border-b border-paper-lines">
              <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted w-20 sm:w-24">Kod</th>
              <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted">Hesap Adı</th>
              <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted w-32 hidden sm:table-cell">Tür</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((acc) => (
              <tr key={acc.id} className="border-b border-paper-lines last:border-0 hover:bg-surface/30">
                <td className="px-3 sm:px-4 py-2 font-mono text-xs text-ink font-semibold">{acc.code}</td>
                <td className="px-3 sm:px-4 py-2 text-ink">{acc.name}</td>
                <td className="px-3 sm:px-4 py-2 hidden sm:table-cell">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[acc.account_type] || ""}`}>
                    {TYPE_LABELS[acc.account_type] || acc.account_type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-faint">{filtered.length} hesap gösteriliyor</p>
    </div>
  );
}
