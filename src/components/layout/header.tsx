"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, Upload, FileText, BarChart3, Settings, LogOut, ChevronRight, HelpCircle, User, Building2, Scale, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/layout/notification-bell";

const navItems = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/yukle", label: "Belge Yükle", icon: Upload },
  { href: "/belgeler", label: "Belgeler", icon: FileText },
  { href: "/rehber", label: "Rehber", icon: Building2 },
  { href: "/cari", label: "Cari Hesap", icon: Scale },
  { href: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/hatirlaticilar", label: "Hatırlatıcılar", icon: Bell },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/panel": "Panel",
  "/yukle": "Belge Yükle",
  "/belgeler": "Belgeler",
  "/rehber": "Rehber",
  "/cari": "Cari Hesap",
  "/raporlar": "Raporlar",
  "/hatirlaticilar": "Hatırlatıcılar",
  "/ayarlar": "Ayarlar",
};

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentPage = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(path + "/")
  );

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-paper-lines">
      <div className="flex h-[60px] items-center justify-between px-4 md:px-8">
        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 receipt-sidebar border-none">
            <div className="px-5 py-5">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                <div className="w-9 h-9 rounded bg-white/15 flex items-center justify-center">
                  <Image src="/otomakbuz logo.png" alt="Otomakbuz" width={24} height={24} className="rounded" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">
                  Otomakbuz
                </span>
              </Link>
            </div>
            <nav className="px-3 py-2 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded text-[14px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}>
                    <item.icon className="h-[18px] w-[18px]" />{item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Mobile logo */}
        <div className="md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/otomakbuz logo.png" alt="Otomakbuz" width={28} height={28} className="rounded" />
            <span className="font-bold text-base tracking-tight">
              <span className="text-brand">Oto</span>
              <span className="text-receipt-brown">makbuz</span>
            </span>
          </Link>
        </div>

        {/* Desktop breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-ink-muted">Anasayfa</span>
          {currentPage && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
              <span className="text-ink font-semibold">{currentPage[1]}</span>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <NotificationBell />
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="text-ink-muted hover:text-ink hover:bg-slate-100 gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </Button>
          </form>
          <div className="w-8 h-8 rounded-full bg-receipt-gold/15 flex items-center justify-center ml-1">
            <User className="h-4 w-4 text-receipt-brown" />
          </div>
        </div>
      </div>
    </header>
  );
}
