"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createContact, updateContact } from "@/lib/actions/contacts";
import type { Contact } from "@/types";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContactFormProps {
  contact?: Contact;
  mode: "create" | "edit";
}

export function ContactForm({ contact, mode }: ContactFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "create") {
        const result = await createContact(formData);
        toast.success("Firma eklendi");
        router.push(`/rehber/${result.id}`);
      } else if (contact) {
        await updateContact(contact.id, formData);
        toast.success("Firma güncellendi");
        router.push(`/rehber/${contact.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="receipt-card rounded p-6">
        <h3 className="font-semibold text-ink mb-4">Temel Bilgiler</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="company_name">Firma Adı *</Label>
            <Input
              id="company_name"
              name="company_name"
              defaultValue={contact?.company_name}
              placeholder="Örnek: Migros Ticaret A.Ş."
              required
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="type">Tür</Label>
            <Select name="type" defaultValue={contact?.type || "supplier"}>
              <SelectTrigger className="mt-1 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supplier">Tedarikçi</SelectItem>
                <SelectItem value="customer">Müşteri</SelectItem>
                <SelectItem value="both">Tedarikçi/Müşteri</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">Şehir</Label>
            <Input
              id="city"
              name="city"
              defaultValue={contact?.city || ""}
              placeholder="İstanbul"
              className="mt-1 h-11"
            />
          </div>
        </div>
      </div>

      {/* Vergi Bilgileri */}
      <div className="receipt-card rounded p-6">
        <h3 className="font-semibold text-ink mb-4">Vergi Bilgileri</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tax_id">Vergi Kimlik No (VKN)</Label>
            <Input
              id="tax_id"
              name="tax_id"
              defaultValue={contact?.tax_id || ""}
              placeholder="1234567890"
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="tax_office">Vergi Dairesi</Label>
            <Input
              id="tax_office"
              name="tax_office"
              defaultValue={contact?.tax_office || ""}
              placeholder="Kadikoy"
              className="mt-1 h-11"
            />
          </div>
        </div>
      </div>

      {/* İletişim */}
      <div className="receipt-card rounded p-6">
        <h3 className="font-semibold text-ink mb-4">İletişim</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={contact?.phone || ""}
              placeholder="0212 555 00 00"
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={contact?.email || ""}
              placeholder="info@firma.com"
              className="mt-1 h-11"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Adres</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={contact?.address || ""}
              placeholder="Firma adresi"
              rows={2}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Notlar */}
      <div className="receipt-card rounded p-6">
        <h3 className="font-semibold text-ink mb-4">Notlar</h3>
        <Textarea
          name="notes"
          defaultValue={contact?.notes || ""}
          placeholder="Firma hakkında notlar..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
        <Button type="submit" disabled={loading} className="bg-brand hover:bg-brand-dark">
          {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          {mode === "create" ? "Firma Ekle" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
