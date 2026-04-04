"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, FileText, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const navItems = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/yukle", label: "Yukle", icon: Upload },
  { href: "/belgeler", label: "Belgeler", icon: FileText },
  { href: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-white">
      <div className="p-6"><Logo /></div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}>
              <item.icon className="h-5 w-5" />{item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
