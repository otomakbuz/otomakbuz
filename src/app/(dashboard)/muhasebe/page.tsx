"use client";

import { useState, useTransition } from "react";
import { BookOpen, List, FileText, BarChart3, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AccountsTable } from "@/components/accounting/accounts-table";
import { JournalTable } from "@/components/accounting/journal-table";
import { TrialBalance } from "@/components/accounting/trial-balance";
import { exportEDefter } from "@/lib/actions/accounting";
import { toast } from "sonner";

const tabs = [
  { id: "hesap-plani", label: "Hesap Planı", icon: List },
  { id: "yevmiye", label: "Yevmiye Defteri", icon: FileText },
  { id: "mizan", label: "Mizan", icon: BarChart3 },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function MuhasebePage() {
  const [activeTab, setActiveTab] = useState<TabId>("hesap-plani");
  const [isPending, startTransition] = useTransition();

  function handleExportEDefter() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    startTransition(async () => {
      try {
        const { xml, filename } = await exportEDefter(month, year);
        const blob = new Blob([xml], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), { href: url, download: filename });
        a.click();
        URL.revokeObjectURL(url);
        toast.success("E-Defter XML indirildi");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
            <BookOpen className="h-5 w-5 text-receipt-brown" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Muhasebe</h1>
            <p className="text-ink-muted text-sm">Hesap planı, yevmiye defteri ve mizan.</p>
          </div>
        </div>
        <Button
          size="sm" variant="outline" onClick={handleExportEDefter} disabled={isPending}
          className="border-receipt-gold text-receipt-brown hover:bg-receipt-gold/10 w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-1.5" />
          {isPending ? "Hazırlanıyor..." : "E-Defter İndir"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="receipt-card rounded">
        <div className="flex border-b border-paper-lines overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-receipt-brown text-receipt-brown"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-paper-lines"
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "hesap-plani" && <AccountsTable />}
        {activeTab === "yevmiye" && <JournalTable />}
        {activeTab === "mizan" && <TrialBalance />}
      </div>
    </div>
  );
}
