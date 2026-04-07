"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProducts, createProduct } from "@/lib/actions/inventory";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, AlertTriangle } from "lucide-react";
import type { Product } from "@/types";

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // Form
  const [fCode, setFCode] = useState("");
  const [fName, setFName] = useState("");
  const [fUnit, setFUnit] = useState("adet");
  const [fCost, setFCost] = useState("");
  const [fPrice, setFPrice] = useState("");
  const [fReorder, setFReorder] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error("Ürünler yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  function handleCreate() {
    if (!fCode.trim() || !fName.trim()) return;
    startTransition(async () => {
      try {
        const p = await createProduct({
          code: fCode, name: fName, unit: fUnit,
          unit_cost: parseFloat(fCost) || 0,
          unit_price: parseFloat(fPrice) || 0,
          reorder_level: parseFloat(fReorder) || 0,
        });
        setProducts((prev) => [...prev, p].sort((a, b) => a.name.localeCompare(b.name)));
        setFCode(""); setFName(""); setFCost(""); setFPrice(""); setFReorder("");
        setShowForm(false);
        toast.success("Ürün eklendi");
      } catch (err) { toast.error((err as Error).message); }
    });
  }

  const filtered = search
    ? products.filter((p) => p.code.includes(search) || p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const totalValue = products.reduce((s, p) => s + Number(p.current_quantity) * Number(p.unit_cost), 0);
  const belowReorder = products.filter((p) => Number(p.current_quantity) <= Number(p.reorder_level) && Number(p.reorder_level) > 0);

  if (loading) return <div className="p-6 text-sm text-ink-faint">Yükleniyor...</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Özet */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-3 rounded border border-paper-lines">
          <p className="text-xs text-ink-muted">Toplam Ürün</p>
          <p className="text-lg font-bold text-ink">{products.length}</p>
        </div>
        <div className="p-3 rounded border border-paper-lines">
          <p className="text-xs text-ink-muted">Stok Değeri</p>
          <p className="text-lg font-bold text-ink">{formatCurrency(totalValue)}</p>
        </div>
        <div className="p-3 rounded border border-paper-lines">
          <p className="text-xs text-ink-muted">Kritik Stok</p>
          <p className={`text-lg font-bold ${belowReorder.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {belowReorder.length > 0 ? `${belowReorder.length} ürün` : "Yok"}
          </p>
        </div>
      </div>

      {/* Arama + Ekle */}
      <div className="flex items-center gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün ara..." className="h-9 border-paper-lines bg-paper max-w-xs" />
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="ml-auto bg-receipt-brown hover:bg-receipt-brown-dark text-white">
          <Plus className="h-3.5 w-3.5 mr-1" />Yeni Ürün
        </Button>
      </div>

      {/* Yeni ürün formu */}
      {showForm && (
        <div className="p-4 rounded border border-receipt-gold/30 bg-receipt-gold/5 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-ink-muted font-medium">Kod *</label>
              <Input value={fCode} onChange={(e) => setFCode(e.target.value)} placeholder="URN-001" className="h-8 border-paper-lines" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-ink-muted font-medium">Ürün Adı *</label>
              <Input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Ürün adı" className="h-8 border-paper-lines" />
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-ink-muted font-medium">Birim</label>
              <select value={fUnit} onChange={(e) => setFUnit(e.target.value)} className="w-full h-8 px-2 rounded border border-paper-lines bg-paper text-sm">
                <option value="adet">Adet</option>
                <option value="kg">Kg</option>
                <option value="lt">Lt</option>
                <option value="m">Metre</option>
                <option value="kutu">Kutu</option>
                <option value="paket">Paket</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Alış Fiyatı</label>
              <Input type="number" value={fCost} onChange={(e) => setFCost(e.target.value)} placeholder="0.00" className="h-8 border-paper-lines" />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Satış Fiyatı</label>
              <Input type="number" value={fPrice} onChange={(e) => setFPrice(e.target.value)} placeholder="0.00" className="h-8 border-paper-lines" />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Kritik Stok</label>
              <Input type="number" value={fReorder} onChange={(e) => setFReorder(e.target.value)} placeholder="0" className="h-8 border-paper-lines" />
            </div>
          </div>
          <Button size="sm" onClick={handleCreate} disabled={isPending} className="bg-receipt-brown hover:bg-receipt-brown-dark text-white">
            {isPending ? "Ekleniyor..." : "Ekle"}
          </Button>
        </div>
      )}

      {/* Tablo */}
      {filtered.length === 0 ? (
        <p className="text-sm text-ink-faint text-center py-8">Henüz ürün eklenmemiş.</p>
      ) : (
        <div className="rounded border border-paper-lines overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50 border-b border-paper-lines">
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted">Kod</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted">Ürün</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted">Birim</th>
                <th className="text-right px-4 py-2.5 font-medium text-ink-muted">Miktar</th>
                <th className="text-right px-4 py-2.5 font-medium text-ink-muted">Alış</th>
                <th className="text-right px-4 py-2.5 font-medium text-ink-muted">Satış</th>
                <th className="text-right px-4 py-2.5 font-medium text-ink-muted">Değer</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const value = Number(p.current_quantity) * Number(p.unit_cost);
                const isCritical = Number(p.current_quantity) <= Number(p.reorder_level) && Number(p.reorder_level) > 0;
                return (
                  <tr key={p.id} className="border-b border-paper-lines last:border-0 hover:bg-surface/30">
                    <td className="px-4 py-2 font-mono text-xs font-semibold text-ink">{p.code}</td>
                    <td className="px-4 py-2 text-ink font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-ink-muted">{p.unit}</td>
                    <td className={`px-4 py-2 text-right font-mono ${isCritical ? "text-red-600 font-bold" : "text-ink"}`}>
                      {Number(p.current_quantity)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-ink-muted">{formatCurrency(Number(p.unit_cost))}</td>
                    <td className="px-4 py-2 text-right font-mono text-ink">{formatCurrency(Number(p.unit_price))}</td>
                    <td className="px-4 py-2 text-right font-mono text-ink">{formatCurrency(value)}</td>
                    <td className="px-2 py-2">
                      {isCritical && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </td>
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
