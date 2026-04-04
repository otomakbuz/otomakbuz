"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function ContactFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/rehber?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <Input
            placeholder="Firma, VKN veya e-posta ara..."
            defaultValue={searchParams.get("search") || ""}
            onChange={(e) => updateFilter("search", e.target.value || null)}
            className="pl-9 h-10"
          />
        </div>
        <Select defaultValue={searchParams.get("type") || "all"} onValueChange={(v) => updateFilter("type", v)}>
          <SelectTrigger className="w-[150px] h-10">
            <SelectValue placeholder="Tür" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Türler</SelectItem>
            <SelectItem value="supplier">Tedarikçi</SelectItem>
            <SelectItem value="customer">Müşteri</SelectItem>
            <SelectItem value="both">Tedarikçi/Müşteri</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue={searchParams.get("is_active") || "all"} onValueChange={(v) => updateFilter("is_active", v)}>
          <SelectTrigger className="w-[130px] h-10">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Pasif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
