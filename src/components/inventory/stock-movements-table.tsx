"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStockMovements, createStockMovement, getProducts } from "@/lib/actions/inventory";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { StockMovement, Product, MovementType } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  purchase: "Alış",
  sale: "Satış",
  adjustment: "Düzeltme",
  return: "İade",
};

const TYPE_COLORS: Record<string, string> = {
  purchase: "bg-emerald-50 text-emerald-700",
  sale: "bg-red-50 text-red-700",
  adjustment: "bg-blue-50 text-blue-700",
  return: "bg-amber-50 text-amber-700",
};

export function StockMovementsTable() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  // Form
  const [fProductId, setFProductId] = useState("");
  const [fType, setFType] = useState<MovementType>("purchase");
  const [fQty, setFQty] = useState("");
  const [fCost, setFCost] = useState("");
  const [fNote, setFNote] = useState("");
  const [fDate, setFDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    Promise.all([getStockMovements(), getProducts()])
      .then(([m, p]) => { setMovements(m); setProducts(p); })
      .catch(() => toast.error("Stok hareketleri yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  function handleCreate() {
    if (!fProductId || !fQty) return;
    startTransition(async () => {
      try {
        await createStockMovement({
          product_id: fProductId,
          movement_type: fType,
          quantity: parseFloat(fQty),
          unit_cost: fCost ? parseFloat(fCost) : undefined,
          reference_note: fNote || undefined,
          movement_date: fDate,
        });
        const [m, p] = await Promise.all([getStockMovements(), getProducts()]);
        setMovements(m);
        setProducts(p);
        setFProductId(""); setFQty(""); setFCost(""); setFNote("");
        setShowForm(false);
        toast.success("Stok hareketi kaydedildi");
      } catch (err) { toast.error((err as Error).message); }
    });
  }

  if (loading) return <div className="p-6 text-sm text-ink-faint">Yükleniyor...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{movements.length} hareket</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-receipt-brown hover:bg-receipt-brown-dark text-white">
          <Plus className="h-3.5 w-3.5 mr-1" />Yeni Hareket
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded border border-receipt-gold/30 bg-receipt-gold/5 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-ink-muted font-medium">Ürün *</label>
              <select value={fProductId} onChange={(e) => setFProductId(e.target.value)}
                className="w-full h-8 px-2 rounded border border-paper-lines bg-paper text-sm">
                <option value="">Ürün seçin</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Hareket Türü</label>
              <select value={fType} onChange={(e) => setFType(e.target.value as MovementType)}
                className="w-full h-8 px-2 rounded border border-paper-lines bg-paper text-sm">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Tarih</label>
              <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="h-8 border-paper-lines" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-ink-muted font-medium">Miktar *</label>
              <Input type="number" value={fQty} onChange={(e) => setFQty(e.target.value)} placeholder="0" className="h-8 border-paper-lines" />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Birim Fiyat</label>
              <Input type="number" value={fCost} onChange={(e) => setFCost(e.target.value)} placeholder="0.00" className="h-8 border-paper-lines" />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Not</label>
              <Input value={fNote} onChange={(e) => setFNote(e.target.value)} placeholder="Açıklama" className="h-8 border-paper-lines" />
            </div>
          </div>
          <Button size="sm" onClick={handleCreate} disabled={isPending} className="bg-receipt-brown hover:bg-receipt-brown-dark text-white">
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      )}

      {movements.length === 0 ? (
        <p className="text-sm text-ink-faint text-center py-8">Henüz stok hareketi yok.</p>
      ) : (
        <div className="rounded border border-paper-lines overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50 border-b border-paper-lines">
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted">Tarih</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted">Ürün</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted">Tür</th>
                <th className="text-right px-4 py-2.5 font-medium text-ink-muted">Miktar</th>
                <th className="text-right px-4 py-2.5 font-medium text-ink-muted">Birim Fiyat</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted">Not</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const product = m.product as unknown as { code: string; name: string; unit: string } | null;
                const isOut = m.movement_type === "sale" || m.movement_type === "return";
                return (
                  <tr key={m.id} className="border-b border-paper-lines last:border-0 hover:bg-surface/30">
                    <td className="px-4 py-2 text-ink">{formatDate(m.movement_date)}</td>
                    <td className="px-4 py-2 text-ink font-medium">{product ? `${product.code} - ${product.name}` : "-"}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[m.movement_type] || ""}`}>
                        {TYPE_LABELS[m.movement_type] || m.movement_type}
                      </span>
                    </td>
                    <td className={`px-4 py-2 text-right font-mono font-medium ${isOut ? "text-red-600" : "text-emerald-600"}`}>
                      {isOut ? "-" : "+"}{Math.abs(Number(m.quantity))}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-ink-muted">
                      {m.unit_cost ? formatCurrency(Number(m.unit_cost)) : "-"}
                    </td>
                    <td className="px-4 py-2 text-ink-muted text-xs">{m.reference_note || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
