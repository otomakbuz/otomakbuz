"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLedgerEntry } from "@/lib/actions/ledger";
import { toast } from "sonner";
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LedgerEntryType } from "@/types";

interface ManualEntryFormProps {
  contactId: string;
}

export function ManualEntryForm({ contactId }: ManualEntryFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entryType, setEntryType] = useState<LedgerEntryType>("debit");

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    try {
      await createLedgerEntry({
        contact_id: contactId,
        entry_type: entryType,
        amount: parseFloat(formData.get("amount") as string),
        description: (formData.get("description") as string) || undefined,
        entry_date: (formData.get("entry_date") as string) || undefined,
      });
      toast.success("Hareket eklendi");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ekleme hatası");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Manuel Hareket
      </Button>
    );
  }

  return (
    <div className="receipt-card rounded p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink text-sm">Yeni Hareket</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-faint hover:text-ink">
          İptal
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex rounded border border-paper-lines overflow-hidden">
          <button
            type="button"
            onClick={() => setEntryType("debit")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all",
              entryType === "debit"
                ? "bg-red-50 text-red-700 border-r border-red-200/60"
                : "text-ink-muted hover:bg-surface border-r border-paper-lines"
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
            Borc
          </button>
          <button
            type="button"
            onClick={() => setEntryType("credit")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all",
              entryType === "credit"
                ? "bg-emerald-50 text-emerald-700"
                : "text-ink-muted hover:bg-surface"
            )}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Alacak
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-ink-muted">Tutar *</Label>
            <Input name="amount" type="number" step="0.01" min="0.01" required placeholder="0,00" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-ink-muted">Tarih</Label>
            <Input name="entry_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="h-10" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-ink-muted">Açıklama</Label>
          <Input name="description" placeholder="Örneğin: Nakit ödeme, Havale..." className="h-10" />
        </div>

        <Button type="submit" className="w-full bg-receipt-brown hover:bg-receipt-brown-dark" disabled={saving}>
          <Plus className="h-4 w-4 mr-2" />
          {saving ? "Ekleniyor..." : "Hareketi Ekle"}
        </Button>
      </form>
    </div>
  );
}
