"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  getBankAccounts,
  getBankTransactions,
  getSuggestedMatches,
  manualMatchTransaction,
  unmatchTransaction,
  ignoreTransaction,
  getBankSummary,
} from "@/lib/actions/bank";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Check,
  X,
  Link2,
  FileText,
  AlertCircle,
  Eye,
  ArrowRight,
} from "lucide-react";
import type { BankAccount, BankTransaction, BankSummary } from "@/types";

interface SuggestedMatch {
  document_id: string;
  supplier_name: string | null;
  total_amount: number | null;
  issue_date: string | null;
  confidence: number;
}

export function BankReconciliation() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [summary, setSummary] = useState<BankSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Secili islem ve onerileri
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedMatch[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  function loadData() {
    if (!selectedAccountId) return;
    setLoading(true);
    Promise.all([
      getBankTransactions(selectedAccountId, { status: "unmatched" }),
      getBankSummary(selectedAccountId),
    ])
      .then(([txs, sum]) => {
        setTransactions(txs);
        setSummary(sum);
        setSelectedTxId(null);
        setSuggestions([]);
      })
      .catch(() => toast.error("Veriler yuklenemedi"))
      .finally(() => setLoading(false));
  }

  function selectTransaction(txId: string) {
    setSelectedTxId(txId);
    setLoadingSuggestions(true);
    getSuggestedMatches(txId)
      .then(setSuggestions)
      .catch(() => toast.error("Oneriler yuklenemedi"))
      .finally(() => setLoadingSuggestions(false));
  }

  function handleMatch(txId: string, docId: string) {
    startTransition(async () => {
      try {
        await manualMatchTransaction(txId, docId);
        toast.success("Eslestirme yapildi");
        loadData();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleIgnore(txId: string) {
    startTransition(async () => {
      try {
        await ignoreTransaction(txId);
        toast.success("Islem yok sayildi");
        loadData();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleUnmatch(txId: string) {
    startTransition(async () => {
      try {
        await unmatchTransaction(txId);
        toast.success("Eslestirme kaldirildi");
        loadData();
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
          Once bir banka hesabi ekleyin.
        </p>
      </div>
    );

  return (
    <div className="p-4 space-y-4">
      {/* Hesap secimi */}
      <div className="flex items-center gap-2">
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="h-9 px-3 rounded border border-paper-lines bg-paper text-sm"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.bank_name} - {a.account_name}
            </option>
          ))}
        </select>
      </div>

      {/* Ozet cubugu */}
      {summary && (
        <div className="flex flex-wrap gap-4 p-3 rounded border border-paper-lines bg-surface/30 text-xs">
          <span className="text-ink-muted">
            Toplam:{" "}
            <strong className="text-ink">{summary.total}</strong>
          </span>
          <span className="text-emerald-700">
            Eslesmis:{" "}
            <strong>{summary.matched + summary.manual}</strong>
          </span>
          <span className="text-amber-700">
            Eslestirilmemis:{" "}
            <strong>{summary.unmatched}</strong>
          </span>
          <span className="text-ink-muted">
            Yok sayilan: <strong>{summary.ignored}</strong>
          </span>
        </div>
      )}

      {/* Ana icerik: Bolunmus gorunum */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sol: Eslestirilmemis islemler */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Eslestirilmemis Islemler
          </h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 rounded border border-paper-lines">
              <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-ink-muted">
                {loading
                  ? "Yukleniyor..."
                  : "Tum islemler eslesmis!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {transactions.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => selectTransaction(tx.id)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    selectedTxId === tx.id
                      ? "border-receipt-brown bg-receipt-gold/10"
                      : "border-paper-lines hover:border-receipt-gold/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-ink-muted">
                      {new Date(tx.transaction_date).toLocaleDateString("tr-TR")}
                    </span>
                    <span
                      className={`font-mono font-medium text-sm ${
                        tx.amount >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-ink truncate">{tx.description}</p>
                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] text-ink-muted hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIgnore(tx.id);
                      }}
                      disabled={isPending}
                    >
                      <X className="h-3 w-3 mr-0.5" />
                      Yok Say
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sag: Onerilen eslesmeler */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-receipt-brown" />
            Onerilen Eslesmeler
          </h3>
          {!selectedTxId ? (
            <div className="text-center py-8 rounded border border-paper-lines border-dashed">
              <ArrowRight className="h-8 w-8 text-ink-faint mx-auto mb-2 rotate-180 md:rotate-0" />
              <p className="text-sm text-ink-faint">
                Eslestirmek icin sol taraftan bir islem secin.
              </p>
            </div>
          ) : loadingSuggestions ? (
            <div className="text-center py-8 rounded border border-paper-lines">
              <p className="text-sm text-ink-faint">
                Oneriler yukleniyor...
              </p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8 rounded border border-paper-lines">
              <FileText className="h-8 w-8 text-ink-faint mx-auto mb-2" />
              <p className="text-sm text-ink-faint">
                Bu islem icin uygun belge bulunamadi.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s) => (
                <div
                  key={s.document_id}
                  className="p-3 rounded border border-paper-lines hover:border-receipt-gold/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink">
                      {s.supplier_name || "Isimsiz Belge"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.confidence >= 80
                          ? "bg-emerald-100 text-emerald-800"
                          : s.confidence >= 50
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      %{Math.round(s.confidence)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-muted mb-2">
                    {s.issue_date && (
                      <span>
                        {new Date(s.issue_date).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                    {s.total_amount != null && (
                      <span className="font-mono">
                        {formatCurrency(s.total_amount)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleMatch(selectedTxId!, s.document_id)
                      }
                      disabled={isPending}
                      className="h-7 text-xs bg-receipt-brown hover:bg-receipt-brown-dark text-white"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Eslestir
                    </Button>
                    <a
                      href={`/belge/${s.document_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 h-7 px-2 text-xs rounded text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      Goruntule
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
