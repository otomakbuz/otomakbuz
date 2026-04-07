"use client";

import { useState } from "react";
import { BookOpen, List, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountsTable } from "@/components/accounting/accounts-table";
import { JournalTable } from "@/components/accounting/journal-table";
import { TrialBalance } from "@/components/accounting/trial-balance";

const tabs = [
  { id: "hesap-plani", label: "Hesap Planı", icon: List },
  { id: "yevmiye", label: "Yevmiye Defteri", icon: FileText },
  { id: "mizan", label: "Mizan", icon: BarChart3 },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function MuhasebePage() {
  const [activeTab, setActiveTab] = useState<TabId>("hesap-plani");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <BookOpen className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Muhasebe</h1>
          <p className="text-ink-muted text-sm">Hesap planı, yevmiye defteri ve mizan.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="receipt-card rounded">
        <div className="flex border-b border-paper-lines overflow-x-auto">
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

        {activeTab === "hesap-plani" && <AccountsTable />}
        {activeTab === "yevmiye" && <JournalTable />}
        {activeTab === "mizan" && <TrialBalance />}
      </div>
    </div>
  );
}
