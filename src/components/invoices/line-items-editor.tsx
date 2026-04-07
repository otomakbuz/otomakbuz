"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { InvoiceLineItem } from "@/types";

const UNITS = [
  { value: "adet", label: "Adet" },
  { value: "kg", label: "Kg" },
  { value: "lt", label: "Lt" },
  { value: "m", label: "m" },
  { value: "m2", label: "m\u00B2" },
  { value: "m3", label: "m\u00B3" },
  { value: "paket", label: "Paket" },
  { value: "kutu", label: "Kutu" },
  { value: "saat", label: "Saat" },
  { value: "gun", label: "G\u00FCn" },
];

const VAT_RATES = [0, 1, 10, 20];

interface LineItemsEditorProps {
  items: InvoiceLineItem[];
  onChange: (items: InvoiceLineItem[]) => void;
  currency?: string;
}

function calcLineItem(
  item: InvoiceLineItem
): InvoiceLineItem {
  const lineTotal = item.quantity * item.unit_price;
  const vatAmount = lineTotal * (item.vat_rate / 100);
  return { ...item, line_total: lineTotal, vat_amount: vatAmount };
}

function newLineItem(): InvoiceLineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unit: "adet",
    unit_price: 0,
    vat_rate: 20,
    line_total: 0,
    vat_amount: 0,
  };
}

function formatNum(val: number): string {
  return val.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function LineItemsEditor({
  items,
  onChange,
  currency = "TRY",
}: LineItemsEditorProps) {
  const updateItem = (index: number, updates: Partial<InvoiceLineItem>) => {
    const updated = items.map((item, i) =>
      i === index ? calcLineItem({ ...item, ...updates }) : item
    );
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, newLineItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, li) => sum + li.line_total, 0);
  const totalVat = items.reduce((sum, li) => sum + li.vat_amount, 0);

  // VAT breakdown by rate
  const vatBreakdown = items.reduce<Record<number, { base: number; vat: number }>>(
    (acc, li) => {
      if (!acc[li.vat_rate]) acc[li.vat_rate] = { base: 0, vat: 0 };
      acc[li.vat_rate].base += li.line_total;
      acc[li.vat_rate].vat += li.vat_amount;
      return acc;
    },
    {}
  );

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-paper-lines bg-surface/50">
              <th className="text-left px-2 py-2 font-medium text-ink-muted w-8">
                #
              </th>
              <th className="text-left px-2 py-2 font-medium text-ink-muted min-w-[200px]">
                Açıklama
              </th>
              <th className="text-left px-2 py-2 font-medium text-ink-muted w-20">
                Miktar
              </th>
              <th className="text-left px-2 py-2 font-medium text-ink-muted w-24">
                Birim
              </th>
              <th className="text-left px-2 py-2 font-medium text-ink-muted w-28">
                Birim Fiyat
              </th>
              <th className="text-left px-2 py-2 font-medium text-ink-muted w-24">
                KDV %
              </th>
              <th className="text-right px-2 py-2 font-medium text-ink-muted w-28">
                Tutar
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className="border-b border-paper-lines last:border-0"
              >
                <td className="px-2 py-1.5 text-ink-faint text-xs">
                  {index + 1}
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, { description: e.target.value })
                    }
                    placeholder="Ürün/hizmet açıklaması"
                    className="h-8 text-sm border-none bg-transparent shadow-none focus-visible:ring-1"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.quantity || ""}
                    onChange={(e) =>
                      updateItem(index, {
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-8 text-sm w-20 border-none bg-transparent shadow-none focus-visible:ring-1"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(index, { unit: e.target.value })}
                    className="h-8 text-sm rounded border-none bg-transparent focus:ring-1 focus:ring-ring w-full"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_price || ""}
                    onChange={(e) =>
                      updateItem(index, {
                        unit_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-8 text-sm w-28 border-none bg-transparent shadow-none focus-visible:ring-1"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <select
                    value={item.vat_rate}
                    onChange={(e) =>
                      updateItem(index, {
                        vat_rate: parseInt(e.target.value),
                      })
                    }
                    className="h-8 text-sm rounded border-none bg-transparent focus:ring-1 focus:ring-ring w-full"
                  >
                    {VAT_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        %{rate}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1.5 text-right text-sm text-ink font-medium whitespace-nowrap">
                  {formatNum(item.line_total)}
                </td>
                <td className="px-1 py-1.5">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 text-ink-faint hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="border border-paper-lines rounded p-3 space-y-2 relative"
          >
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="absolute top-2 right-2 p-1 text-ink-faint hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="text-xs text-ink-faint font-medium">
              Kalem {index + 1}
            </div>
            <Input
              value={item.description}
              onChange={(e) =>
                updateItem(index, { description: e.target.value })
              }
              placeholder="Açıklama"
              className="h-8 text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-ink-faint">Miktar</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.quantity || ""}
                  onChange={(e) =>
                    updateItem(index, {
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-faint">Birim</label>
                <select
                  value={item.unit}
                  onChange={(e) => updateItem(index, { unit: e.target.value })}
                  className="h-8 text-sm rounded border border-input bg-transparent w-full px-1"
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-ink-faint">
                  Birim Fiyat
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.unit_price || ""}
                  onChange={(e) =>
                    updateItem(index, {
                      unit_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] text-ink-faint">KDV</label>
                <select
                  value={item.vat_rate}
                  onChange={(e) =>
                    updateItem(index, {
                      vat_rate: parseInt(e.target.value),
                    })
                  }
                  className="h-8 text-sm rounded border border-input bg-transparent px-2 ml-1"
                >
                  {VAT_RATES.map((rate) => (
                    <option key={rate} value={rate}>
                      %{rate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-ink-faint">Tutar</div>
                <div className="text-sm font-semibold text-ink">
                  {formatNum(item.line_total)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="text-xs gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Kalem Ekle
        </Button>
      </div>

      {/* Totals */}
      <div className="mt-4 border-t border-paper-lines pt-4">
        <div className="flex flex-col items-end gap-1.5 text-sm">
          <div className="flex items-center gap-8">
            <span className="text-ink-muted">Ara Toplam:</span>
            <span className="text-ink font-medium w-28 text-right">
              {formatNum(subtotal)} {currency}
            </span>
          </div>
          {Object.entries(vatBreakdown).map(([rate, { vat }]) => (
            <div key={rate} className="flex items-center gap-8">
              <span className="text-ink-muted">KDV %{rate}:</span>
              <span className="text-ink w-28 text-right">
                {formatNum(vat)} {currency}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-8">
            <span className="text-ink-muted">Toplam KDV:</span>
            <span className="text-ink font-medium w-28 text-right">
              {formatNum(totalVat)} {currency}
            </span>
          </div>
          <div className="flex items-center gap-8 pt-1 border-t border-paper-lines">
            <span className="text-ink font-bold">Genel Toplam:</span>
            <span className="text-ink font-bold text-base w-28 text-right">
              {formatNum(subtotal + totalVat)} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { newLineItem, calcLineItem };
