"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getJournalEntries, createJournalEntry, postJournalEntry, deleteJournalEntry, getAccounts } from "@/lib/actions/accounting";
import { toast } from "sonner";
import { Plus, Check, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { JournalEntry, JournalLine, Account } from "@/types";

export function JournalTable() {
  const [entries, setEntries] = useState<(JournalEntry & { lines: JournalLine[] })[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDesc, setFormDesc] = useState("");
  const [formLines, setFormLines] = useState([
    { account_code: "", debit_amount: 0, credit_amount: 0 },
    { account_code: "", debit_amount: 0, credit_amount: 0 },
  ]);

  useEffect(() => {
    Promise.all([getJournalEntries(), getAccounts()])
      .then(([e, a]) => { setEntries(e); setAccounts(a); })
      .catch(() => toast.error("Yevmiye kayıtları yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  function addLine() {
    setFormLines([...formLines, { account_code: "", debit_amount: 0, credit_amount: 0 }]);
  }

  function updateLine(i: number, field: string, value: string | number) {
    setFormLines(formLines.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function removeLine(i: number) {
    if (formLines.length <= 2) return;
    setFormLines(formLines.filter((_, idx) => idx !== i));
  }

  function handleCreate() {
    const validLines = formLines.filter((l) => l.account_code && (l.debit_amount > 0 || l.credit_amount > 0));
    if (validLines.length < 2) { toast.error("En az 2 satır gerekli"); return; }
    startTransition(async () => {
      try {
        await createJournalEntry(formDate, formDesc, validLines);
        const data = await getJournalEntries();
        setEntries(data);
        setShowForm(false);
        setFormDesc("");
        setFormLines([
          { account_code: "", debit_amount: 0, credit_amount: 0 },
          { account_code: "", debit_amount: 0, credit_amount: 0 },
        ]);
        toast.success("Yevmiye kaydı oluşturuldu");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handlePost(id: string) {
    startTransition(async () => {
      try {
        await postJournalEntry(id);
        setEntries((prev) => prev.map((e) => e.id === id ? { ...e, is_posted: true } : e));
        toast.success("Yevmiye kaydı onaylandı");
      } catch (err) { toast.error((err as Error).message); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Bu yevmiye kaydını silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      try {
        await deleteJournalEntry(id);
        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast.success("Yevmiye kaydı silindi");
      } catch (err) { toast.error((err as Error).message); }
    });
  }

  const totalDebit = formLines.reduce((s, l) => s + (Number(l.debit_amount) || 0), 0);
  const totalCredit = formLines.reduce((s, l) => s + (Number(l.credit_amount) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  if (loading) return <div className="p-6 text-sm text-ink-faint">Yükleniyor...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{entries.length} kayıt</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-receipt-brown hover:bg-receipt-brown-dark text-white">
          <Plus className="h-3.5 w-3.5 mr-1" />Yeni Yevmiye
        </Button>
      </div>

      {/* Yeni Yevmiye Formu */}
      {showForm && (
        <div className="p-4 rounded border border-receipt-gold/30 bg-receipt-gold/5 space-y-3">
          <div className="flex gap-3">
            <div>
              <label className="text-xs text-ink-muted font-medium">Tarih</label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="h-8 w-40 border-paper-lines" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-ink-muted font-medium">Açıklama</label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Yevmiye açıklaması" className="h-8 border-paper-lines" />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-ink-muted">
                <th className="text-left py-1">Hesap</th>
                <th className="text-right py-1 w-28">Borç</th>
                <th className="text-right py-1 w-28">Alacak</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {formLines.map((line, i) => (
                <tr key={i}>
                  <td className="py-1 pr-2">
                    <select
                      value={line.account_code}
                      onChange={(e) => updateLine(i, "account_code", e.target.value)}
                      className="w-full h-8 px-2 rounded border border-paper-lines bg-paper text-sm"
                    >
                      <option value="">Hesap seçin</option>
                      {accounts.map((a) => <option key={a.id} value={a.code}>{a.code} - {a.name}</option>)}
                    </select>
                  </td>
                  <td className="py-1 px-1">
                    <Input
                      type="number" min="0" step="0.01"
                      value={line.debit_amount || ""}
                      onChange={(e) => updateLine(i, "debit_amount", parseFloat(e.target.value) || 0)}
                      className="h-8 text-right border-paper-lines"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <Input
                      type="number" min="0" step="0.01"
                      value={line.credit_amount || ""}
                      onChange={(e) => updateLine(i, "credit_amount", parseFloat(e.target.value) || 0)}
                      className="h-8 text-right border-paper-lines"
                    />
                  </td>
                  <td className="py-1">
                    <button onClick={() => removeLine(i)} className="text-ink-faint hover:text-red-500" disabled={formLines.length <= 2}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-paper-lines font-medium">
                <td className="py-2 text-right pr-2">Toplam:</td>
                <td className="py-2 px-1 text-right">{formatCurrency(totalDebit)}</td>
                <td className="py-2 px-1 text-right">{formatCurrency(totalCredit)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={addLine}>
              <Plus className="h-3 w-3 mr-1" />Satır Ekle
            </Button>
            <div className="flex-1" />
            {!isBalanced && totalDebit > 0 && (
              <span className="text-xs text-red-600 font-medium">Borç ve Alacak eşit olmalıdır</span>
            )}
            <Button size="sm" onClick={handleCreate} disabled={isPending || !isBalanced} className="bg-receipt-brown hover:bg-receipt-brown-dark text-white">
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      )}

      {/* Liste */}
      {entries.length === 0 ? (
        <p className="text-sm text-ink-faint text-center py-8">Henüz yevmiye kaydı yok.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const entryDebit = entry.lines.reduce((s, l) => s + Number(l.debit_amount), 0);
            return (
              <div key={entry.id} className="rounded border border-paper-lines overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface/30"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-ink-faint" /> : <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />}
                  <span className="text-xs text-ink-muted font-mono">#{entry.entry_number}</span>
                  <span className="text-sm text-ink">{entry.entry_date ? formatDate(entry.entry_date) : "-"}</span>
                  <span className="text-sm text-ink font-medium flex-1 truncate">{entry.description || "-"}</span>
                  <span className="text-sm text-ink font-mono">{formatCurrency(entryDebit)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${entry.is_posted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {entry.is_posted ? "Onaylı" : "Taslak"}
                  </span>
                </div>
                {isExpanded && (
                  <div className="border-t border-paper-lines bg-surface/20 px-4 py-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-ink-muted">
                          <th className="text-left py-1">Hesap</th>
                          <th className="text-right py-1 w-28">Borç</th>
                          <th className="text-right py-1 w-28">Alacak</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.lines.map((line) => (
                          <tr key={line.id}>
                            <td className="py-1 font-mono">{line.account_code} <span className="text-ink-muted">{line.description || ""}</span></td>
                            <td className="py-1 text-right">{Number(line.debit_amount) > 0 ? formatCurrency(Number(line.debit_amount)) : ""}</td>
                            <td className="py-1 text-right">{Number(line.credit_amount) > 0 ? formatCurrency(Number(line.credit_amount)) : ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!entry.is_posted && (
                      <div className="flex gap-2 mt-3 pt-2 border-t border-paper-lines">
                        <Button size="sm" variant="outline" onClick={() => handlePost(entry.id)} disabled={isPending} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          <Check className="h-3 w-3 mr-1" />Onayla
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(entry.id)} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="h-3 w-3 mr-1" />Sil
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
