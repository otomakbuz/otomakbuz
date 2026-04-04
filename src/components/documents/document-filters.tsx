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

  function updateFilter(key: string, value: string) {
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Firma, belge no veya icerik ara..." defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateFilter("search", e.target.value)} className="pl-9" />
      </div>
      <Select defaultValue={searchParams.get("status") || "all"} onValueChange={(v) => updateFilter("status", v)}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Durum" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum Durumlar</SelectItem>
          <SelectItem value="needs_review">Inceleme Bekliyor</SelectItem>
          <SelectItem value="verified">Dogrulandi</SelectItem>
          <SelectItem value="archived">Arsivlendi</SelectItem>
          <SelectItem value="failed">Basarisiz</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("category_id") || "all"} onValueChange={(v) => updateFilter("category_id", v)}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategori" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum Kategoriler</SelectItem>
          {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("document_type") || "all"} onValueChange={(v) => updateFilter("document_type", v)}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Belge Turu" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum Turler</SelectItem>
          <SelectItem value="fatura">Fatura</SelectItem>
          <SelectItem value="fis">Fis</SelectItem>
          <SelectItem value="makbuz">Makbuz</SelectItem>
          <SelectItem value="pos_slip">POS Slip</SelectItem>
          <SelectItem value="gider_fisi">Gider Fisi</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-1" />Temizle</Button>
      )}
    </div>
  );
}
