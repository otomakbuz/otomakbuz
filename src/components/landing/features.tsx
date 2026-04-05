import { Scan, BarChart3, Bell, Users } from "lucide-react";
import { FeatureDialog } from "./feature-dialog";
import { FeatureVisual, type FeatureKey } from "./feature-visual";

const features: Array<{
  number: string;
  key: FeatureKey;
  icon: typeof Scan;
  title: string;
  headline: string;
  description: string;
  link: { label: string };
}> = [
  {
    number: "01",
    key: "scan",
    icon: Scan,
    title: "Akıllı Tarama",
    headline: "Belgelerinizi saniyeler içinde dijitalleştirin.",
    description:
      "Gelişmiş OCR teknolojimiz makbuz, fiş ve faturalarınızı yükler yüklemez tarar. Firma adı, tarih, tutar ve KDV bilgileri otomatik olarak çıkarılır. Her alan için güvenilirlik skoru ile sonuçları kontrol edin.",
    link: { label: "OCR hakkında daha fazla" },
  },
  {
    number: "02",
    key: "reports",
    icon: BarChart3,
    title: "Gelir-Gider Takibi",
    headline: "Finansal durumunuzu tek bakışta görün.",
    description:
      "Tüm gelen ve giden faturalarınızı tek panelden takip edin. Aylık trend grafikleri, kategori bazlı harcama dağılımı ve tedarikçi sıralamasıyla verilerinizi anlamlı hale getirin. Excel ve CSV dışa aktarım ile muhasebeciye hazır raporlar oluşturun.",
    link: { label: "Raporları keşfedin" },
  },
  {
    number: "03",
    key: "reminders",
    icon: Bell,
    title: "Akıllı Hatırlatıcılar",
    headline: "Hiçbir ödeme tarihini kaçırmayın.",
    description:
      "Tekrarlayan fatura kalıplarını otomatik algılayın ve ödeme hatırlatıcıları oluşturun. Yaklaşan ödemelerinizi takvim görünümünde takip edin. Gecikme riskini sıfıra indirin.",
    link: { label: "Hatırlatıcıları keşfedin" },
  },
  {
    number: "04",
    key: "team",
    icon: Users,
    title: "Çoklu Kullanıcı",
    headline: "Ekibinizle birlikte çalışın.",
    description:
      "Çalışma alanları oluşturun, ekip üyelerinize roller atayın. Yönetici, editör ve görüntüleyici yetkileriyle belgelerinize erişimi kontrol edin. Tüm değişiklikler denetim kaydıyla izlenir.",
    link: { label: "Takım özellikleri" },
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-faint font-medium mb-4">
            Özellikler
          </p>
          <h2 className="text-3xl sm:text-[40px] font-bold text-ink tracking-tight leading-tight">
            İhtiyacınız olan her şey,{" "}
            <br className="hidden sm:block" />
            tek panelde.
          </h2>
        </div>

        {/* Feature rows */}
        <div className="space-y-24">
          {features.map((feature, idx) => (
            <div
              key={feature.number}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              {/* Text */}
              <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-sm font-mono text-ink-faint font-medium">
                    [{feature.number}]
                  </span>
                  <span className="text-sm font-semibold text-ink uppercase tracking-wide">
                    {feature.title}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-[32px] font-bold text-ink tracking-tight leading-[1.15] mb-5">
                  {feature.headline}
                </h3>
                <p className="text-lg sm:text-xl text-ink-muted leading-relaxed mb-6">
                  {feature.description}
                </p>
                <FeatureDialog featureNumber={feature.number}>
                  {feature.link.label}
                </FeatureDialog>
              </div>

              {/* Visual */}
              <div className={idx % 2 === 1 ? "lg:order-1" : ""}>
                <FeatureVisual featureKey={feature.key} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
