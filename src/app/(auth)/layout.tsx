import Image from "next/image";
import Link from "next/link";
import { FileText, Scan, BarChart3, Shield } from "lucide-react";

const features = [
  { icon: FileText, title: "Belge Yükle", desc: "Makbuz, fiş ve faturalarınızı yükleyin" },
  { icon: Scan, title: "Otomatik Okuma", desc: "OCR ile anında dijitalleştirin" },
  { icon: BarChart3, title: "Raporlama", desc: "Gelir-gider takibi ve analizler" },
  { icon: Shield, title: "Güvenli Arşiv", desc: "Tüm belgeleriniz güvenle saklanır" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — clean form area */}
      <div className="flex-1 flex flex-col bg-paper">
        {/* Top logo */}
        <div className="p-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image src="/logo-icon.png" alt="Otomakbuz" width={36} height={36} />
            <span className="font-bold text-lg tracking-tight">
              <span className="text-brand">Oto</span>
              <span className="text-receipt-brown">makbuz</span>
            </span>
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        {/* Bottom copyright */}
        <div className="p-8 pt-0">
          <p className="text-xs text-ink-faint">&copy; 2026 Otomakbuz</p>
        </div>
      </div>

      {/* Right panel — receipt-themed showcase */}
      <div className="hidden lg:flex lg:w-[50%] receipt-sidebar relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-white/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-white/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative flex flex-col justify-center p-12 lg:p-16 w-full">
          {/* Main heading */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Belgelerinizi<br />
              <span className="text-receipt-gold">Kolayca Yönetin!</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-md">
              Makbuz, fiş ve faturalarınızı yükleyin, otomatik taransın,
              gelir-gider takibinizi kolayca yapın.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <div key={i} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded p-4">
                <div className="w-9 h-9 rounded bg-white/15 flex items-center justify-center mb-3">
                  <feat.icon className="h-4.5 w-4.5 text-receipt-gold" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{feat.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom stat */}
          <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-white">1000+</p>
              <p className="text-white/50 text-xs">İşlenen Belge</p>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div>
              <p className="text-2xl font-bold text-white">%99</p>
              <p className="text-white/50 text-xs">OCR Doğruluk</p>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div>
              <p className="text-2xl font-bold text-white">7/24</p>
              <p className="text-white/50 text-xs">Erişim</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
