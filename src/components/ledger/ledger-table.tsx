"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, FileText, Trash2, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLedgerEntry } from "@/lib/actions/ledger";
import { toast } from "sonner";
import Link from "next/link";
import type { LedgerEntry } from "@/types";

interface LedgerTableProps {
  entries: LedgerEntry[];
  contactId: string;
}

export function LedgerTable({ entries, contactId }: LedgerTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Bu hareketi silmek istediginizden emin misiniz?")) return;
    setDeleting(id);
    try {
      await deleteLedgerEntry(id, contactId);
      toast.success("Hareket silindi");
    } catch {
      toast.error("Silme hatasi");
    } finally {
      setDeleting(null);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="receipt-card rounded">
        <div className="px-5 py-4 border-b border-paper-lines">
          <h3 className="font-semibold text-ink text-sm">Hesap Hareketleri</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-14 h-14 rounded bg-receipt-gold/10 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-receipt-gold/60" />
          </div>
          <p className="text-sm font-medium text-ink mb-1">Henuz hareket yok</p>
          <p className="text-xs text-ink-faint text-center">
            Belge dogrulandiginda veya manuel giris yapildiginda hareketler burada gorunur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-card rounded overflow-hidden">
      <div className="px-5 py-4 border-b border-paper-lines flex items-center justify-between">
        <h3 className="font-semibold text-ink text-sm">Hesap Hareketleri</h3>
        <span className="text-xs text-ink-faint">{entries.length} hareket</span>
      </div>

      <div className="divide-y divide-paper-lines/50">
        {entries.map((entry) => {
          const isDebit = entry.entry_type === "debit";
          const doc = entry.document_id ? entry.document : null;

          return (
            <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-receipt-gold/3 transition-colors">
              {/* Icon */}
              <div className={cn(
                "w-8 h-8 rounded flex items-center justify-center flex-shrink-0",
                isDebit ? "bg-red-50" : "bg-emerald-50"
              )}>
                {isDebit
                  ? <ArrowUpRight className="h-4 w-4 text-red-600" />
                  : <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                }
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {entry.description || (isDebit ? "Borc" : "Alacak")}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-ink-faint">{formatDate(entry.entry_date)}</span>
                  {doc && (
                    <Link href={`/belge/${entry.document_id}`} className="inline-flex items-center gap-1 text-xs text-receipt-brown hover:underline">
                      <LinkIcon className="h-3 w-3" />
                      Belge
                    </Link>
                  )}
                </div>
              </div>

              {/* Amount */}
              <span className={cn(
                "text-sm font-semibold tabular-nums",
                isDebit ? "text-red-600" : "text-emerald-600"
              )}>
                {isDebit ? "-" : "+"}{formatCurrency(entry.amount, entry.currency)}
              </span>

              {/* Delete (only for manual entries) */}
              {!entry.document_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-ink-faint hover:text-red-600"
                  onClick={() => handleDelete(entry.id)}
                  disabled={deleting === entry.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
