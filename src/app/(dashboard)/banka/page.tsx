"use client";

import { useState } from "react";
import { Landmark, CreditCard, ArrowRightLeft, GitCompareArrows } from "lucide-react";
import { cn } from "@/lib/utils";
import { BankAccounts } from "@/components/bank/bank-accounts";
import { BankTransactions } from "@/components/bank/bank-transactions";
import { BankReconciliation } from "@/components/bank/bank-reconciliation";

const tabs = [
  { id: "hesaplar", label: "Hesaplar", icon: CreditCard },
  { id: "hareketler", label: "Hareketler", icon: ArrowRightLeft },
  { id: "eslestirme", label: "Eslestirme", icon: GitCompareArrows },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function BankaPage() {
  const [activeTab, setActiveTab] = useState<TabId>("hesaplar");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <Landmark className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Banka Mutabakat
          </h1>
          <p className="text-ink-muted text-sm">
            Banka hesaplari, ekstre yukle ve belge eslestirme.
          </p>
        </div>
      </div>

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

        {activeTab === "hesaplar" && <BankAccounts />}
        {activeTab === "hareketler" && <BankTransactions />}
        {activeTab === "eslestirme" && <BankReconciliation />}
      </div>
    </div>
  );
}
