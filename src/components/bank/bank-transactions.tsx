"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getBankAccounts,
  getBankTransactions,
  importBankStatement,
  autoMatchTransactions,
  getBankSummary,
} from "@/lib/actions/bank";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Upload,
  Wand2,
  Check,
  X,
  Link2,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";
import type { BankAccount, BankTransaction, BankMatchStatus, BankSummary } from "@/types";

const statusLabels: Record<BankMatchStatus, string> = {
  unmatched: "Eslestirilmemis",
  matched: "Eslesmis",
  manual: "Manuel",
  ignored: "Yok Sayilmis",
};

const statusColors: Record<BankMatchStatus, string> = {
  unmatched: "bg-amber-100 text-amber-800",
  matched: "bg-emerald-100 text-emerald-800",
  manual: "bg-blue-100 text-blue-800",
  ignored: "bg-gray-100 text-gray-600",
};

export function BankTransactions() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [summary, setSummary] = useState<BankSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<BankMatchStatus | "">("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    getBankAccounts()
      .then((accs) => {
        setAccounts(accs);
        if (accs.length > 0) setSelectedAccountId(accs[0].id);
      })
      .catch(() => toast.error("Hesaplar yuklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAccountId) return;
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, filterStatus, filterDateFrom, filterDateTo]);

  function loadTransactions() {
    if (!selectedAccountId) return;
    setLoading(true);
    Promise.all([
      getBankTransactions(selectedAccountId, {
        status: filterStatus as BankMatchStatus || undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      }),
      getBankSummary(selectedAccountId),
    ])
      .then(([txs, sum]) => {
        setTransactions(txs);
        setSummary(sum);
      })
      .catch(() => toast.error("Hareketler yuklenemedi"))
      .finally(() => setLoading(false));
  }

  function handleImport() {
    fileInputRef.current?.click();
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedAccountId) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      startTransition(async () => {
        try {
          const result = await importBankStatement(selectedAccountId, content);
          toast.success(
            `${result.imported} islem iceri aktarildi${
              result.skipped > 0 ? `, ${result.skipped} tekrar atlandi` : ""
            }`
          );
          loadTransactions();
        } catch (err) {
          toast.error((err as Error).message);
        }
      });
    };
    reader.readAsText(file, "UTF-8");
    // Ayni dosyayi tekrar secebilmek icin
    e.target.value = "";
  }

  function handleAutoMatch() {
    if (!selectedAccountId) return;
    startTransition(async () => {
      try {
        const result = await autoMatchTransactions(selectedAccountId);
        toast.success(`${result.matched} islem otomatik eslesti`);
        loadTransactions();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  if (loading && accounts.length === 0)
    return <div className="p-6 text-sm text-ink-faint">Yukleniyor...</div>;

  if (accounts.length === 0)
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-ink-faint mx-auto mb-3" />
        <p className="text-sm text-ink-faint">
          Once &quot;Hesaplar&quot; sekmesinden bir banka hesabi ekleyin.
        </p>
      </div>
    );

  return (
    <div className="p-4 space-y-4">
      {/* Hesap secimi + Aksiyonlar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="h-9 px-3 rounded border border-paper-lines bg-paper text-sm flex-1 sm:flex-none"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.bank_name} - {a.account_name}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-paper-lines"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Filtre</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={onFileSelected}
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleImport}
            disabled={isPending}
            className="border-paper-lines w-full sm:w-auto"
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            CSV Iceri Aktar
          </Button>
          <Button
            size="sm"
            onClick={handleAutoMatch}
            disabled={isPending}
            className="bg-receipt-brown hover:bg-receipt-brown-dark text-white w-full sm:w-auto"
          >
            <Wand2 className="h-3.5 w-3.5 mr-1" />
            Otomatik Eslestir
          </Button>
        </div>
      </div>

      {/* Filtreler */}
      {showFilters && (
        <div className="p-3 rounded border border-paper-lines bg-surface/30 flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-ink-muted font-medium">Durum</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BankMatchStatus | "")}
              className="w-full h-8 px-2 rounded border border-paper-lines bg-paper text-sm"
            >
              <option value="">Tumu</option>
              <option value="unmatched">Eslestirilmemis</option>
              <option value="matched">Eslesmis</option>
              <option value="manual">Manuel</option>
              <option value="ignored">Yok Sayilmis</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted font-medium">
              Baslangic
            </label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="h-8 border-paper-lines text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted font-medium">Bitis</label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="h-8 border-paper-lines text-sm"
            />
          </div>
        </div>
      )}

      {/* Ozet */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded border border-paper-lines">
            <p className="text-xs text-ink-muted">Toplam</p>
            <p className="text-lg font-bold text-ink">{summary.total}</p>
          </div>
          <div className="p-3 rounded border border-emerald-200 bg-emerald-50/50">
            <p className="text-xs text-emerald-700">Eslesmis</p>
            <p className="text-lg font-bold text-emerald-700">
              {summary.matched + summary.manual}
            </p>
          </div>
          <div className="p-3 rounded border border-amber-200 bg-amber-50/50">
            <p className="text-xs text-amber-700">Eslestirilmemis</p>
            <p className="text-lg font-bold text-amber-700">
              {summary.unmatched}
            </p>
          </div>
          <div className="p-3 rounded border border-paper-lines">
            <p className="text-xs text-ink-muted">Yok Sayilan</p>
            <p className="text-lg font-bold text-ink-muted">{summary.ignored}</p>
          </div>
        </div>
      )}

      {/* Tablo */}
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-10 w-10 text-ink-faint mx-auto mb-3" />
          <p className="text-sm text-ink-faint">
            {loading ? "Yukleniyor..." : "Bu hesapta henuz islem yok."}
          </p>
        </div>
      ) : (
        <div className="rounded border border-paper-lines overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50 border-b border-paper-lines">
                <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted hidden sm:table-cell">
                  Tarih
                </th>
                <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted">
                  Aciklama
                </th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium text-ink-muted">
                  Tutar
                </th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium text-ink-muted hidden md:table-cell">
                  Bakiye
                </th>
                <th className="text-center px-3 sm:px-4 py-2.5 font-medium text-ink-muted">
                  Durum
                </th>
                <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-ink-muted hidden lg:table-cell">
                  Eslesen Belge
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-paper-lines last:border-0 hover:bg-surface/30"
                >
                  <td className="px-3 sm:px-4 py-2 text-xs font-mono text-ink hidden sm:table-cell">
                    {new Date(tx.transaction_date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-ink max-w-[200px] truncate">
                    {tx.description}
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-2 text-right font-mono font-medium ${
                      tx.amount >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-right font-mono text-ink-muted text-xs hidden md:table-cell">
                    {tx.balance_after != null
                      ? formatCurrency(tx.balance_after)
                      : "-"}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        statusColors[tx.match_status]
                      }`}
                    >
                      {tx.match_status === "matched" ||
                      tx.match_status === "manual" ? (
                        <Check className="h-3 w-3" />
                      ) : tx.match_status === "ignored" ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      <span className="hidden sm:inline">{statusLabels[tx.match_status]}</span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-xs text-ink-muted hidden lg:table-cell">
                    {tx.document ? (
                      <span className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {(tx.document as { supplier_name?: string })
                          ?.supplier_name || "Belge"}
                        {tx.match_confidence != null && (
                          <span className="text-[10px] text-ink-faint">
                            (%{Math.round(tx.match_confidence)})
                          </span>
                        )}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
