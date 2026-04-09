"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createQuickEntry } from "@/lib/actions/documents";
import type { Category, DocumentDirection } from "@/types";
import { cn } from "@/lib/utils";

interface QuickEntryProps {
  categories: Category[];
}

export function QuickEntry({ categories }: QuickEntryProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<DocumentDirection>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Geçerli bir tutar giriniz");
      return;
    }
    if (!description.trim()) {
      toast.error("Açıklama giriniz");
      return;
    }

    setLoading(true);
    try {
      await createQuickEntry({
        direction,
        amount: numAmount,
        description: description.trim(),
        categoryId: categoryId || null,
        date,
      });
      toast.success(direction === "expense" ? "Gider kaydedildi" : "Gelir kaydedildi");
      setAmount("");
      setDescription("");
      setCategoryId("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydetme hatası");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Hızlı Giriş
      </Button>
    );
  }

  return (
    <div className="receipt-card rounded p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Hızlı Gelir/Gider</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-faint hover:text-ink">
          Kapat
        </button>
      </div>

      {/* Gelir / Gider Toggle */}
      <div className="flex rounded border border-paper-lines overflow-hidden">
        <button
          type="button"
          onClick={() => setDirection("expense")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all",
            direction === "expense"
              ? "bg-red-50 text-red-700 border-r border-red-200/60"
              : "text-ink-muted hover:bg-receipt-gold/5 border-r border-paper-lines"
          )}
        >
          <ArrowUpRight className="h-3 w-3" />
          Gider
        </button>
        <button
          type="button"
          onClick={() => setDirection("income")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all",
            direction === "income"
              ? "bg-emerald-50 text-emerald-700"
              : "text-ink-muted hover:bg-receipt-gold/5"
          )}
        >
          <ArrowDownLeft className="h-3 w-3" />
          Gelir
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] text-ink-muted">Tutar (TL)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-8 text-sm mt-0.5"
          />
        </div>
        <div>
          <Label className="text-[10px] text-ink-muted">Tarih</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 text-sm mt-0.5"
          />
        </div>
      </div>

      <div>
        <Label className="text-[10px] text-ink-muted">Açıklama</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ör: Taksi, yemek, kırtasiye..."
          className="h-8 text-sm mt-0.5"
        />
      </div>

      <div>
        <Label className="text-[10px] text-ink-muted">Kategori</Label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-8 text-sm mt-0.5 w-full rounded-lg border border-input bg-transparent px-2"
        >
          <option value="">Seçiniz (opsiyonel)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        size="sm"
        className="w-full gap-1.5 bg-receipt-brown hover:bg-receipt-brown-dark text-white text-xs"
      >
        <Plus className="h-3.5 w-3.5" />
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </div>
  );
}
