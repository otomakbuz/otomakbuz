"use client";

import { useState } from "react";
import { Package, List, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductsTable } from "@/components/inventory/products-table";
import { StockMovementsTable } from "@/components/inventory/stock-movements-table";

const tabs = [
  { id: "urunler", label: "Ürünler", icon: Package },
  { id: "hareketler", label: "Stok Hareketleri", icon: ArrowRightLeft },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function StokPage() {
  const [activeTab, setActiveTab] = useState<TabId>("urunler");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <Package className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Stok Yönetimi</h1>
          <p className="text-ink-muted text-sm">Ürün kartları ve stok hareketleri.</p>
        </div>
      </div>

      <div className="receipt-card rounded">
        <div className="flex border-b border-paper-lines">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-receipt-brown text-receipt-brown"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-paper-lines"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "urunler" && <ProductsTable />}
        {activeTab === "hareketler" && <StockMovementsTable />}
      </div>
    </div>
  );
}
