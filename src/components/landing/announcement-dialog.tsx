"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Users, BarChart3, Bell, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const updates = [
  {
    icon: Users,
    title: "Çoklu Kullanıcı Desteği",
    description: "Ekibinizi davet edin, roller atayın. Yönetici, editör ve görüntüleyici yetkileri.",
    tag: "Yeni",
  },
  {
    icon: BarChart3,
    title: "Gelişmiş Raporlar",
    description: "Aylık trendler, firma karşılaştırma, nakit akış projeksiyonu ve daha fazlası.",
    tag: "Yeni",
  },
  {
    icon: Bell,
    title: "Akıllı Hatırlatıcılar",
    description: "Tekrarlayan harcamaları otomatik tespit edin, ödeme hatırlatıcıları oluşturun.",
    tag: "Yeni",
  },
  {
    icon: Zap,
    title: "Cari Hesap Takibi",
    description: "Her firma için borç/alacak bakiyesi. Ekstre ve hareket geçmişi.",
    tag: "Yeni",
  },
];

export function AnnouncementDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-paper-lines text-sm text-ink-muted hover:border-receipt-gold/40 transition-colors cursor-pointer"
      >
        {children}
      </button>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-receipt-gold/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-receipt-gold" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-ink tracking-tight">
                Neler Yeni?
              </DialogTitle>
            </DialogHeader>
          </div>
          <DialogDescription className="text-ink-muted text-sm">
            Otomakbuz&apos;un en son güncellemelerine göz atın.
          </DialogDescription>
        </div>

        {/* Updates list */}
        <div className="px-6 pb-2">
          <div className="space-y-1">
            {updates.map((update) => {
              const Icon = update.icon;
              return (
                <div
                  key={update.title}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface border border-paper-lines flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-receipt-brown" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-ink">{update.title}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        {update.tag}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">{update.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-4">
          <Link href="/kayit" onClick={() => setOpen(false)}>
            <Button className="w-full bg-ink hover:bg-ink-light text-white rounded-lg font-medium">
              Hemen Keşfedin
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
