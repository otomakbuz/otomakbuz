"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Building2, PieChart, TrendingUp, Calendar } from "lucide-react";
import { MonthlyTrendChart } from "./monthly-trend-chart";
import { SupplierRankingChart } from "./supplier-ranking-chart";
import { CategoryBreakdownChart } from "./category-breakdown-chart";
import { CashflowProjectionChart } from "./cashflow-projection-chart";
import { YearlySummaryTable } from "./yearly-summary-table";
import type {
  MonthlyTrend,
  SupplierRanking,
  CategoryBreakdown,
  CashflowProjection,
  YearlySummary,
} from "@/types";

const tabs = [
  { id: "trend", label: "Trend", icon: BarChart3 },
  { id: "suppliers", label: "Firmalar", icon: Building2 },
  { id: "categories", label: "Kategoriler", icon: PieChart },
  { id: "cashflow", label: "Nakit Akış", icon: TrendingUp },
  { id: "yearly", label: "Yıllık", icon: Calendar },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface ReportTabsProps {
  trends: MonthlyTrend[];
  supplierRanking: SupplierRanking[];
  categoryBreakdown: CategoryBreakdown[];
  cashflowProjection: CashflowProjection[];
  yearlySummary: YearlySummary[];
}

export function ReportTabs({
  trends,
  supplierRanking,
  categoryBreakdown,
  cashflowProjection,
  yearlySummary,
}: ReportTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("trend");

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="receipt-card rounded">
        <div className="flex overflow-x-auto border-b border-paper-lines">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
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

        {/* Tab content */}
        <div className="p-5">
          {activeTab === "trend" && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">Aylık Gelir / Gider Trendi</h3>
              <p className="text-xs text-ink-faint mb-4">Son 12 ayın gelir ve gider karşılaştırması</p>
              <MonthlyTrendChart data={trends} />
            </div>
          )}

          {activeTab === "suppliers" && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">En Çok Harcanan Firmalar</h3>
              <p className="text-xs text-ink-faint mb-4">Toplam harcama tutarına göre ilk 10 firma</p>
              <SupplierRankingChart data={supplierRanking} />
            </div>
          )}

          {activeTab === "categories" && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">Kategori Dağılımı</h3>
              <p className="text-xs text-ink-faint mb-4">Giderlerin kategori bazlı dağılımı</p>
              <CategoryBreakdownChart data={categoryBreakdown} />
            </div>
          )}

          {activeTab === "cashflow" && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">Nakit Akış Projeksiyonu</h3>
              <p className="text-xs text-ink-faint mb-4">Tekrarlayan harcamalardan gelecek 3 ay tahmini</p>
              <CashflowProjectionChart data={cashflowProjection} />
            </div>
          )}

          {activeTab === "yearly" && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">Yıllık Özet</h3>
              <p className="text-xs text-ink-faint mb-4">Yıl bazlı toplam gelir, gider ve net durum</p>
              <YearlySummaryTable data={yearlySummary} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
