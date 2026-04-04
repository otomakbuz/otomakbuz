"use client";

import { useState } from "react";
import { Upload, Scan, FolderCheck, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stepDetails = [
  {
    number: "1",
    icon: Upload,
    title: "Yükleyin",
    headline: "Belgenizi sisteme yükleyin",
    description:
      "Makbuz, fiş veya faturanızı bilgisayarınızdan sürükleyip bırakın ya da mobil cihazınızdan fotoğraf çekin. Birden fazla belgeyi aynı anda yükleyebilirsiniz.",
    details: [
      { label: "Desteklenen Formatlar", value: "PDF, JPG, PNG, HEIC" },
      { label: "Maksimum Dosya Boyutu", value: "25 MB" },
      { label: "Toplu Yükleme", value: "20 belgeye kadar" },
      { label: "Yükleme Yöntemi", value: "Sürükle-bırak, dosya seçici, kamera" },
    ],
  },
  {
    number: "2",
    icon: Scan,
    title: "Taransın",
    headline: "OCR ile otomatik okuma",
    description:
      "Gelişmiş OCR motorumuz belgenizi saniyeler içinde okur. Firma adı, vergi numarası, tarih, tutar ve KDV bilgileri otomatik olarak çıkarılır. Her alan için güvenilirlik skoru hesaplanır.",
    details: [
      { label: "İşlem Süresi", value: "Ortalama 2 saniye" },
      { label: "Doğruluk", value: "%99 üzeri" },
      { label: "Çıkarılan Alan", value: "12 farklı veri noktası" },
      { label: "Dil Desteği", value: "Türkçe optimizasyonlu" },
    ],
  },
  {
    number: "3",
    icon: FolderCheck,
    title: "Yönetin",
    headline: "Belgelerinizi organize edin",
    description:
      "Taranan verileri doğrulayın, kategorize edin ve raporlayın. Cari hesap takibi yapın, hatırlatıcılar oluşturun ve muhasebeciye hazır dosyalar oluşturun.",
    details: [
      { label: "Rapor Formatları", value: "CSV, Excel, PDF" },
      { label: "Kategori Sayısı", value: "Özelleştirilebilir" },
      { label: "Cari Hesap", value: "Otomatik bakiye takibi" },
      { label: "Hatırlatıcı", value: "Ödeme tarihi bildirimi" },
    ],
  },
];

export function StepDialog({
  stepNumber,
  children,
}: {
  stepNumber: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const step = stepDetails.find((s) => s.number === stepNumber);
  if (!step) return <>{children}</>;

  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)} className="group cursor-pointer">
        {children}
      </button>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Top accent */}
        <div className="bg-surface p-6 border-b border-paper-lines">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-receipt-gold/30 bg-receipt-gold/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-receipt-brown" />
            </div>
            <div>
              <span className="text-xs font-mono text-ink-faint">Adım {step.number}</span>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-ink tracking-tight">
                  {step.title}
                </DialogTitle>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="p-6">
          <DialogDescription className="text-ink-muted text-sm leading-relaxed mb-5">
            {step.description}
          </DialogDescription>

          {/* Details grid */}
          <div className="space-y-3 mb-6">
            {step.details.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between py-2 border-b border-paper-lines/50 last:border-0"
              >
                <span className="text-xs text-ink-faint">{d.label}</span>
                <span className="text-sm font-medium text-ink">{d.value}</span>
              </div>
            ))}
          </div>

          <Link href="/kayit" onClick={() => setOpen(false)}>
            <Button className="w-full bg-ink hover:bg-ink-light text-white rounded-lg font-medium">
              Hemen Deneyin
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
