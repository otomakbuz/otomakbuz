"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "@/lib/actions/bank";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, CreditCard } from "lucide-react";
import type { BankAccount } from "@/types";

export function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [fBankName, setFBankName] = useState("");
  const [fAccountName, setFAccountName] = useState("");
  const [fIban, setFIban] = useState("");
  const [fCurrency, setFCurrency] = useState("TRY");
  const [fBalance, setFBalance] = useState("");

  useEffect(() => {
    getBankAccounts()
      .then(setAccounts)
      .catch(() => toast.error("Banka hesapları yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setFBankName("");
    setFAccountName("");
    setFIban("");
    setFCurrency("TRY");
    setFBalance("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(a: BankAccount) {
    setFBankName(a.bank_name);
    setFAccountName(a.account_name);
    setFIban(a.iban || "");
    setFCurrency(a.currency);
    setFBalance(String(a.current_balance));
    setEditingId(a.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!fBankName.trim() || !fAccountName.trim()) return;
    startTransition(async () => {
      try {
        if (editingId) {
          const updated = await updateBankAccount(editingId, {
            bank_name: fBankName,
            account_name: fAccountName,
            iban: fIban || null,
            currency: fCurrency,
            current_balance: parseFloat(fBalance) || 0,
          });
          setAccounts((prev) =>
            prev.map((a) => (a.id === editingId ? (updated as BankAccount) : a))
          );
          toast.success("Hesap guncellendi");
        } else {
          const created = await createBankAccount({
            bank_name: fBankName,
            account_name: fAccountName,
            iban: fIban || undefined,
            currency: fCurrency,
            current_balance: parseFloat(fBalance) || 0,
          });
          setAccounts((prev) => [...prev, created]);
          toast.success("Hesap eklendi");
        }
        resetForm();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Bu hesabı ve tum hareketlerini silmek istediginize emin misiniz?")) return;
    startTransition(async () => {
      try {
        await deleteBankAccount(id);
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        toast.success("Hesap silindi");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  if (loading) return <div className="p-6 text-sm text-ink-faint">Yukleniyor...</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Ozet */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-3 rounded border border-paper-lines">
          <p className="text-xs text-ink-muted">Toplam Hesap</p>
          <p className="text-lg font-bold text-ink">{accounts.length}</p>
        </div>
        <div className="p-3 rounded border border-paper-lines">
          <p className="text-xs text-ink-muted">Aktif Hesap</p>
          <p className="text-lg font-bold text-ink">
            {accounts.filter((a) => a.is_active).length}
          </p>
        </div>
        <div className="p-3 rounded border border-paper-lines">
          <p className="text-xs text-ink-muted">Toplam Bakiye</p>
          <p className="text-lg font-bold text-ink">
            {formatCurrency(
              accounts.reduce((s, a) => s + Number(a.current_balance), 0)
            )}
          </p>
        </div>
      </div>

      {/* Ekle butonu */}
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-receipt-brown hover:bg-receipt-brown-dark text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Yeni Hesap
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 rounded border border-receipt-gold/30 bg-receipt-gold/5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted font-medium">
                Banka Adi *
              </label>
              <select
                value={fBankName}
                onChange={(e) => setFBankName(e.target.value)}
                className="w-full h-8 px-2 rounded border border-paper-lines bg-paper text-sm"
              >
                <option value="">Secin...</option>
                <option value="Ziraat Bankasi">Ziraat Bankasi</option>
                <option value="Is Bankasi">Is Bankasi</option>
                <option value="Garanti BBVA">Garanti BBVA</option>
                <option value="Yapi Kredi">Yapi Kredi</option>
                <option value="Akbank">Akbank</option>
                <option value="Halkbank">Halkbank</option>
                <option value="Vakifbank">Vakifbank</option>
                <option value="QNB Finansbank">QNB Finansbank</option>
                <option value="Denizbank">Denizbank</option>
                <option value="TEB">TEB</option>
                <option value="ING">ING</option>
                <option value="HSBC">HSBC</option>
                <option value="Diger">Diger</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">
                Hesap Adi *
              </label>
              <Input
                value={fAccountName}
                onChange={(e) => setFAccountName(e.target.value)}
                placeholder="Ticari hesap, vadesiz vb."
                className="h-8 border-paper-lines"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-ink-muted font-medium">IBAN</label>
              <Input
                value={fIban}
                onChange={(e) => setFIban(e.target.value)}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                className="h-8 border-paper-lines font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">
                Para Birimi
              </label>
              <select
                value={fCurrency}
                onChange={(e) => setFCurrency(e.target.value)}
                className="w-full h-8 px-2 rounded border border-paper-lines bg-paper text-sm"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">
                Baslangic Bakiyesi
              </label>
              <Input
                type="number"
                value={fBalance}
                onChange={(e) => setFBalance(e.target.value)}
                placeholder="0.00"
                className="h-8 border-paper-lines"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending}
              className="bg-receipt-brown hover:bg-receipt-brown-dark text-white"
            >
              {isPending ? "Kaydediliyor..." : editingId ? "Guncelle" : "Ekle"}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              Iptal
            </Button>
          </div>
        </div>
      )}

      {/* Hesap Listesi */}
      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-10 w-10 text-ink-faint mx-auto mb-3" />
          <p className="text-sm text-ink-faint">
            Henuz banka hesabi eklenmemis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded border border-paper-lines hover:border-receipt-gold/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-receipt-brown" />
                  <span className="font-semibold text-sm text-ink">
                    {a.bank_name}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(a)}
                    className="p-1 rounded hover:bg-receipt-gold/10 text-ink-muted hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1 rounded hover:bg-red-50 text-ink-muted hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-ink-muted mb-1">{a.account_name}</p>
              {a.iban && (
                <p className="text-[10px] font-mono text-ink-faint mb-2">
                  {a.iban}
                </p>
              )}
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-paper-lines">
                <span className="text-xs text-ink-muted">Bakiye</span>
                <span
                  className={`font-bold text-sm font-mono ${
                    Number(a.current_balance) >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(Number(a.current_balance), a.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
