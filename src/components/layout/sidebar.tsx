"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, FileText, BarChart3, Settings, HelpCircle, Building2, Scale, Bell, FileCheck, BookOpen, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/yukle", label: "Belge Yükle", icon: Upload },
  { href: "/belgeler", label: "Belgeler", icon: FileText },
  { href: "/rehber", label: "Rehber", icon: Building2 },
  { href: "/cari", label: "Cari Hesap", icon: Scale },
  { href: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/e-fatura", label: "E-Fatura", icon: FileCheck },
  { href: "/muhasebe", label: "Muhasebe", icon: BookOpen },
  { href: "/stok", label: "Stok", icon: Package },
];

const bottomNav = [
  { href: "/hatirlaticilar", label: "Hatırlatıcılar", icon: Bell },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col md:w-[240px] receipt-sidebar receipt-perforation flex-shrink-0">
      {/* Logo */}
      <div className="px-5 h-[60px] flex items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center shadow-sm">
            <Image src="/otomakbuz logo.png" alt="Otomakbuz" width={20} height={20} className="rounded-sm" style={{ width: 20, height: 20 }} />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white">
            Otomakbuz
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-0.5">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/25 text-white shadow-sm backdrop-blur-sm"
                    : "text-white/70 hover:bg-white/12 hover:text-white"
                )}>
                <item.icon className="h-[17px] w-[17px]" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="my-4 mx-3 border-t border-white/15" />

        <div className="space-y-0.5">
          {bottomNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/25 text-white shadow-sm backdrop-blur-sm"
                    : "text-white/70 hover:bg-white/12 hover:text-white"
                )}>
                <item.icon className="h-[17px] w-[17px]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Help card */}
      <div className="px-3 mb-3">
        <div className="rounded bg-white/12 backdrop-blur-sm p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-white/80" />
            <span className="text-xs font-semibold text-white/90">Yardım</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mb-3">
            Sorularınız mı var? Destek ekibimize ulaşın.
          </p>
          <a href="mailto:destek@otomakbuz.com" className="inline-flex items-center gap-1 text-[11px] font-medium text-white/80 hover:text-white transition-colors">
            Bize Yazın &rarr;
          </a>
        </div>
      </div>

      {/* Version */}
      <div className="px-5 py-3 border-t border-white/15">
        <span className="text-[10px] text-white/35">v1.0.0</span>
      </div>
    </aside>
  );
}
