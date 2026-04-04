"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";

const plans = [
  {
    name: "Başlangıç",
    price: "Ücretsiz",
    period: "",
    description: "Küçük işletmeler ve bireysel kullanıcılar için",
    features: [
      "Ayda 50 belge tarama",
      "1 kullanıcı",
      "Temel raporlama",
      "E-posta desteği",
      "7 gün veri saklama",
    ],
    cta: "Ücretsiz Başla",
    highlighted: false,
  },
  {
    name: "Profesyonel",
    price: "₺299",
    period: "/ay",
    description: "Büyüyen işletmeler için ideal çözüm",
    features: [
      "Sınırsız belge tarama",
      "5 kullanıcı",
      "Gelişmiş raporlar ve grafikler",
      "Cari hesap takibi",
      "Tekrarlayan harcama tespiti",
      "Öncelikli destek",
      "CSV/Excel dışa aktarım",
    ],
    cta: "14 Gün Ücretsiz Dene",
    highlighted: true,
  },
  {
    name: "Kurumsal",
    price: "₺799",
    period: "/ay",
    description: "Büyük ekipler ve muhasebe ofisleri",
    features: [
      "Sınırsız belge tarama",
      "Sınırsız kullanıcı",
      "Tüm Profesyonel özellikleri",
      "API erişimi",
      "Muhasebe yazılımı entegrasyonu",
      "Özel e-posta forwarding",
      "Özel hesap yöneticisi",
      "SLA garantisi",
    ],
    cta: "İletişime Geç",
    highlighted: false,
  },
];

export function PricingDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-ink-muted hover:text-ink transition-colors font-medium"
      >
        {children}
      </button>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-ink tracking-tight">
              Fiyatlandırma
            </DialogTitle>
            <DialogDescription className="text-ink-muted">
              İhtiyacınıza uygun planı seçin. İstediğiniz zaman yükseltin veya iptal edin.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 p-6 pt-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-5 flex flex-col ${
                plan.highlighted
                  ? "bg-ink text-white ring-2 ring-ink"
                  : "bg-surface border border-paper-lines"
              }`}
            >
              <div className="mb-4">
                <h3
                  className={`font-semibold text-sm mb-1 ${
                    plan.highlighted ? "text-receipt-gold" : "text-ink-muted"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-0.5">
                  <span
                    className={`text-3xl font-bold tracking-tight ${
                      plan.highlighted ? "text-white" : "text-ink"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-white/60" : "text-ink-faint"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-2 ${
                    plan.highlighted ? "text-white/50" : "text-ink-faint"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2 mb-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check
                      className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                        plan.highlighted ? "text-receipt-gold" : "text-emerald-600"
                      }`}
                    />
                    <span className={plan.highlighted ? "text-white/80" : "text-ink-muted"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/kayit" onClick={() => setOpen(false)}>
                <Button
                  size="sm"
                  className={`w-full text-xs font-medium rounded-lg ${
                    plan.highlighted
                      ? "bg-white text-ink hover:bg-white/90"
                      : "bg-ink text-white hover:bg-ink-light"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
