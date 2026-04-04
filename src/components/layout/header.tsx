"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, Upload, FileText, BarChart3, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const navItems = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/yukle", label: "Yukle", icon: Upload },
  { href: "/belgeler", label: "Belgeler", icon: FileText },
  { href: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6"><Logo /></div>
            <nav className="px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}>
                    <item.icon className="h-5 w-5" />{item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="md:hidden"><Logo size={24} /></div>
        <div className="flex items-center gap-2 ml-auto">
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="text-slate-600">
              <LogOut className="h-4 w-4 mr-2" />Cikis
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
