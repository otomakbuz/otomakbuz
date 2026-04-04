"use client";

import { useState } from "react";
import { ArrowRight, Check, Scan, BarChart3, Bell, Users, type LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeatureDetail {
  icon: LucideIcon;
  title: string;
  headline: string;
  description: string;
  bullets: string[];
  stats: { label: string; value: string }[];
}

const featureDetails: Record<string, FeatureDetail> = {
  "01": {
    icon: Scan,
    title: "Akıllı Tarama",
    headline: "Belgelerinizi saniyeler içinde dijitalleştirin.",
    description:
      "Gelişmiş OCR teknolojimiz makbuz, fiş ve faturalarınızı yükler yüklemez tarar. Yapay zeka destekli alan tespiti ile her belge türünü tanır.",
    bullets: [
      "Firma adı, tarih, tutar ve KDV otomatik çıkarılır",
      "Her alan için güvenilirlik skoru",
      "Toplu belge yükleme desteği",
      "Sürükle-bırak veya fotoğraf çekme",
      "PDF, JPG, PNG format desteği",
      "Bulanık ve düşük kaliteli görüntü iyileştirme",
    ],
    stats: [
      { label: "Doğruluk Oranı", value: "%99" },
      { label: "Ort. İşlem Süresi", value: "2 sn" },
      { label: "Desteklenen Format", value: "10+" },
    ],
  },
  "02": {
    icon: BarChart3,
    title: "Gelir-Gider Takibi",
    headline: "Finansal durumunuzu tek bakışta görün.",
    description:
      "Tüm gelen ve giden faturalarınızı tek panelden takip edin. Anlık grafikler ve detaylı raporlarla verilerinizi anlamlı hale getirin.",
    bullets: [
      "Gelir ve gider ayrı ayrı takip",
      "Aylık trend grafikleri",
      "Kategori bazlı harcama dağılımı",
      "Tedarikçi sıralaması",
      "Excel ve CSV dışa aktarım",
      "Muhasebeciye hazır raporlar",
    ],
    stats: [
      { label: "Rapor Türü", value: "5+" },
      { label: "Dışa Aktarım", value: "CSV/Excel" },
      { label: "Anlık Güncelleme", value: "Evet" },
    ],
  },
  "03": {
    icon: Bell,
    title: "Akıllı Hatırlatıcılar",
    headline: "Hiçbir ödeme tarihini kaçırmayın.",
    description:
      "Tekrarlayan fatura kalıplarını otomatik algılayın ve ödeme hatırlatıcıları oluşturun. Gecikme riskini sıfıra indirin.",
    bullets: [
      "Otomatik tekrarlayan harcama tespiti",
      "Ödeme tarihi hatırlatıcıları",
      "Takvim görünümünde takip",
      "Özelleştirilebilir bildirimler",
      "Haftalık ve aylık özetler",
      "Gecikmeli ödeme uyarıları",
    ],
    stats: [
      { label: "Tespit Oranı", value: "%95" },
      { label: "Bildirim Kanalı", value: "Uygulama" },
      { label: "Ort. Tasarruf", value: "12 saat/ay" },
    ],
  },
  "04": {
    icon: Users,
    title: "Çoklu Kullanıcı",
    headline: "Ekibinizle birlikte çalışın.",
    description:
      "Çalışma alanları oluşturun, ekip üyelerinize roller atayın. Tüm değişiklikler denetim kaydıyla izlenir.",
    bullets: [
      "Yönetici, editör ve görüntüleyici rolleri",
      "E-posta ile takım üyesi davet etme",
      "Çalışma alanı bazlı erişim kontrolü",
      "Tam denetim günlüğü",
      "Rol bazlı yetkilendirme",
      "Güvenli veri paylaşımı",
    ],
    stats: [
      { label: "Rol Sayısı", value: "3" },
      { label: "Davet", value: "E-posta" },
      { label: "Denetim Kaydı", value: "Tam" },
    ],
  },
};

export function FeatureDialog({
  featureNumber,
  children,
}: {
  featureNumber: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const detail = featureDetails[featureNumber];
  if (!detail) return <>{children}</>;

  const Icon = detail.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-brand transition-colors group"
      >
        {children}
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
      </button>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header with icon */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-receipt-gold/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-receipt-brown" />
            </div>
            <div>
              <span className="text-xs font-mono text-ink-faint">[{featureNumber}]</span>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-ink tracking-tight">
                  {detail.title}
                </DialogTitle>
              </DialogHeader>
            </div>
          </div>
          <DialogDescription className="text-ink-muted text-sm leading-relaxed">
            {detail.description}
          </DialogDescription>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 border-y border-paper-lines">
          {detail.stats.map((stat) => (
            <div key={stat.label} className="p-4 text-center">
              <p className="text-lg font-bold text-ink">{stat.value}</p>
              <p className="text-[10px] text-ink-faint uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bullet list */}
        <div className="p-6 pt-4">
          <p className="text-xs font-semibold text-ink uppercase tracking-wide mb-3">
            Neler dahil?
          </p>
          <ul className="space-y-2.5 mb-5">
            {detail.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-ink-muted">
                <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                {b}
              </li>
            ))}
          </ul>

          <Link href="/kayit" onClick={() => setOpen(false)}>
            <Button className="w-full bg-ink hover:bg-ink-light text-white rounded-lg font-medium">
              Ücretsiz Deneyin
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
