import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    title: "Ürün",
    links: [
      { label: "Belgeler", href: "/belgeler" },
      { label: "Raporlar", href: "/raporlar" },
      { label: "Rehber", href: "/rehber" },
      { label: "Cari Hesap", href: "/cari" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { label: "Hakkımızda", href: "#" },
      { label: "Blog", href: "#" },
      { label: "İletişim", href: "#" },
    ],
  },
  {
    title: "Kaynaklar",
    links: [
      { label: "Yardım Merkezi", href: "#" },
      { label: "API Dokümantasyonu", href: "#" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Kullanım Koşulları", href: "#" },
      { label: "Gizlilik Politikası", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#2C1810] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Top: Logo + Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-10 mb-16">
          {/* Logo */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/otomakbuz logo.png" alt="Otomakbuz" width={28} height={28} className="rounded brightness-110" style={{ width: 28, height: 28 }} />
              <span className="font-bold text-base tracking-tight">
                <span className="text-receipt-gold">Oto</span>
                <span className="text-white">makbuz</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-[200px]">
              Belge yönetiminde yeni standart.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; 2026 Otomakbuz. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
