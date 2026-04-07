"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCompanyInfo, updateCompanyInfo } from "@/lib/actions/e-fatura";
import { toast } from "sonner";
import { Save, Building2 } from "lucide-react";
import type { CompanyInfo } from "@/types";

export function EFaturaTab() {
  const [info, setInfo] = useState<(CompanyInfo & { name: string }) | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCompanyInfo()
      .then(setInfo)
      .catch(() => toast.error("Firma bilgileri yüklenemedi"));
  }, []);

  function handleSave(formData: FormData) {
    startTransition(async () => {
      try {
        await updateCompanyInfo({
          company_tax_id: formData.get("tax_id") as string || null,
          company_tax_office: formData.get("tax_office") as string || null,
          company_address: formData.get("address") as string || null,
          company_phone: formData.get("phone") as string || null,
          company_email: formData.get("email") as string || null,
        });
        toast.success("Firma bilgileri kaydedildi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  if (!info) {
    return (
      <div className="receipt-card rounded p-6">
        <p className="text-sm text-ink-faint">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="receipt-card rounded">
        <div className="px-5 py-4 border-b border-paper-lines">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-receipt-brown" />
            <h3 className="font-semibold text-ink text-sm">Firma E-Fatura Bilgileri</h3>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            UBL-TR e-fatura XML&apos;inde kullanılacak firma bilgileri.
          </p>
        </div>
        <form action={handleSave} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_id" className="text-ink font-medium text-sm">VKN / TCKN *</Label>
              <Input
                id="tax_id" name="tax_id"
                defaultValue={info.company_tax_id || ""}
                placeholder="1234567890"
                className="h-10 border-paper-lines bg-paper font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_office" className="text-ink font-medium text-sm">Vergi Dairesi</Label>
              <Input
                id="tax_office" name="tax_office"
                defaultValue={info.company_tax_office || ""}
                placeholder="Ümraniye"
                className="h-10 border-paper-lines bg-paper"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-ink font-medium text-sm">Adres</Label>
            <Input
              id="address" name="address"
              defaultValue={info.company_address || ""}
              placeholder="Tam adres"
              className="h-10 border-paper-lines bg-paper"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-ink font-medium text-sm">Telefon</Label>
              <Input
                id="phone" name="phone"
                defaultValue={info.company_phone || ""}
                placeholder="+90 212 123 45 67"
                className="h-10 border-paper-lines bg-paper"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-ink font-medium text-sm">E-posta</Label>
              <Input
                id="email" name="email"
                defaultValue={info.company_email || ""}
                placeholder="muhasebe@firma.com"
                className="h-10 border-paper-lines bg-paper"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded bg-amber-50 border border-amber-200/60">
            <span className="text-amber-600 text-xs">i</span>
            <p className="text-xs text-amber-800">
              Bu bilgiler e-fatura XML&apos;inde &quot;Düzenleyen&quot; olarak kullanılır.
              Doğru VKN girdiğinizden emin olun.
            </p>
          </div>

          <Button
            type="submit" size="sm" disabled={isPending}
            className="bg-receipt-brown hover:bg-receipt-brown-dark text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      </div>
    </div>
  );
}
