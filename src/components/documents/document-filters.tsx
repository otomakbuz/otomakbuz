"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Category } from "@/types";

export function DocumentFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`/belgeler?${params.toString()}`);
  }

  function clearFilters() { router.push("/belgeler"); }
  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <Input placeholder="Firma, belge no veya içerik ara..." defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateFilter("search", e.target.value)} className="pl-9 h-10" />
      </div>
      <Select defaultValue={searchParams.get("status") ?? "all"} onValueChange={(v) => updateFilter("status", v)}>
        <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Durum" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Durumlar</SelectItem>
          <SelectItem value="needs_review">İnceleme Bekliyor</SelectItem>
          <SelectItem value="verified">Doğrulandı</SelectItem>
          <SelectItem value="archived">Arşivlendi</SelectItem>
          <SelectItem value="failed">Başarısız</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("category_id") ?? "all"} onValueChange={(v) => updateFilter("category_id", v)}>
        <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Kategori" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Kategoriler</SelectItem>
          {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("direction") ?? "all"} onValueChange={(v) => updateFilter("direction", v)}>
        <SelectTrigger className="w-[130px] h-10"><SelectValue placeholder="Yön" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Yönler</SelectItem>
          <SelectItem value="income">Gelir</SelectItem>
          <SelectItem value="expense">Gider</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("document_type") ?? "all"} onValueChange={(v) => updateFilter("document_type", v)}>
        <SelectTrigger className="w-[180px] h-10"><SelectValue placeholder="Belge Türü" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Türler</SelectItem>
          <SelectItem value="fatura">Fatura</SelectItem>
          <SelectItem value="perakende_fis">Perakende Fişi</SelectItem>
          <SelectItem value="serbest_meslek_makbuzu">Serbest Meslek Makbuzu</SelectItem>
          <SelectItem value="gider_pusulasi">Gider Pusulası</SelectItem>
          <SelectItem value="mustahsil_makbuzu">Müstahsil Makbuzu</SelectItem>
          <SelectItem value="irsaliye">Sevk İrsaliyesi</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-ink-muted hover:text-ink">
          <X className="h-4 w-4 mr-1" />Temizle
        </Button>
      )}
    </div>
  );
}
