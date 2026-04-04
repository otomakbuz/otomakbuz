"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfidenceBadge } from "@/components/documents/confidence-badge";
import { updateDocument, verifyDocument } from "@/lib/actions/documents";
import { getConfidenceColor } from "@/lib/utils";
import { toast } from "sonner";
import type { Document, Category } from "@/types";
import { cn } from "@/lib/utils";
import { Save, CheckCircle } from "lucide-react";

interface ReviewFormProps {
  document: Document;
  categories: Category[];
  onSaved?: () => void;
}

export function ReviewForm({ document: doc, categories, onSaved }: ReviewFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const fieldScores = (doc.field_scores || {}) as Record<string, number>;

  function FieldRow({ label, field, children }: { label: string; field: string; children: React.ReactNode }) {
    const score = fieldScores[field];
    return (
      <div className={cn("flex items-center gap-3 p-2.5 rounded-lg border",
        score !== undefined ? getConfidenceColor(score) : "border-slate-200"
      )}>
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-slate-500">{label}</Label>
          {children}
        </div>
        {score !== undefined && <ConfidenceBadge score={score} />}
      </div>
    );
  }

  async function handleSave(formData: FormData) {
    setSaving(true);
    try {
      await updateDocument(doc.id, {
        supplier_name: formData.get("supplier_name") as string,
        document_number: formData.get("document_number") as string,
        issue_date: formData.get("issue_date") as string,
        total_amount: parseFloat(formData.get("total_amount") as string) || null,
        vat_amount: parseFloat(formData.get("vat_amount") as string) || null,
        vat_rate: parseFloat(formData.get("vat_rate") as string) || null,
        subtotal_amount: parseFloat(formData.get("subtotal_amount") as string) || null,
        category_id: (formData.get("category_id") as string) || null,
        notes: (formData.get("notes") as string) || null,
        document_type: (formData.get("document_type") as string) || null,
        payment_method: (formData.get("payment_method") as string) || null,
      } as Partial<Document>);
      toast.success("Belge kaydedildi");
      router.refresh();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydetme hatasi");
    } finally { setSaving(false); }
  }

  async function handleVerify() {
    setSaving(true);
    try {
      await verifyDocument(doc.id);
      toast.success("Belge dogrulandi");
      router.refresh();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Dogrulama hatasi");
    } finally { setSaving(false); }
  }

  return (
    <form action={handleSave} className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-900">Belge Bilgileri</h3>
        <ConfidenceBadge score={doc.confidence_score} showLabel />
      </div>

      <FieldRow label="Firma Adi" field="supplier_name">
        <Input name="supplier_name" defaultValue={doc.supplier_name || ""} className="h-8 text-sm" />
      </FieldRow>

      <FieldRow label="Belge Turu" field="document_type">
        <Select name="document_type" defaultValue={doc.document_type || ""}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Sec..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fatura">Fatura</SelectItem>
            <SelectItem value="fis">Fis</SelectItem>
            <SelectItem value="makbuz">Makbuz</SelectItem>
            <SelectItem value="pos_slip">POS Slip</SelectItem>
            <SelectItem value="gider_fisi">Gider Fisi</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow label="Tarih" field="issue_date">
        <Input name="issue_date" type="date" defaultValue={doc.issue_date || ""} className="h-8 text-sm" />
      </FieldRow>

      <FieldRow label="Belge No" field="document_number">
        <Input name="document_number" defaultValue={doc.document_number || ""} className="h-8 text-sm" />
      </FieldRow>

      <FieldRow label="Ara Toplam" field="subtotal_amount">
        <Input name="subtotal_amount" type="number" step="0.01" defaultValue={doc.subtotal_amount?.toString() || ""} className="h-8 text-sm" />
      </FieldRow>

      <FieldRow label="KDV Tutari" field="vat_amount">
        <Input name="vat_amount" type="number" step="0.01" defaultValue={doc.vat_amount?.toString() || ""} className="h-8 text-sm" />
      </FieldRow>

      <FieldRow label="KDV Orani (%)" field="vat_rate">
        <Input name="vat_rate" type="number" step="0.01" defaultValue={doc.vat_rate?.toString() || ""} className="h-8 text-sm" />
      </FieldRow>

      <FieldRow label="Toplam Tutar" field="total_amount">
        <Input name="total_amount" type="number" step="0.01" defaultValue={doc.total_amount?.toString() || ""} className="h-8 text-sm" />
      </FieldRow>

      <FieldRow label="Odeme Yontemi" field="payment_method">
        <Select name="payment_method" defaultValue={doc.payment_method || ""}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Sec..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="nakit">Nakit</SelectItem>
            <SelectItem value="kredi_karti">Kredi Karti</SelectItem>
            <SelectItem value="banka_karti">Banka Karti</SelectItem>
            <SelectItem value="havale">Havale</SelectItem>
            <SelectItem value="diger">Diger</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <div className="space-y-1">
        <Label className="text-xs text-slate-500">Kategori</Label>
        <Select name="category_id" defaultValue={doc.category_id || ""}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Kategori sec..." /></SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-slate-500">Not</Label>
        <Textarea name="notes" defaultValue={doc.notes || ""} rows={2} className="text-sm" placeholder="Opsiyonel not ekleyin..." />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />Kaydet
        </Button>
        <Button type="button" variant="outline" onClick={handleVerify} disabled={saving} className="flex-1">
          <CheckCircle className="h-4 w-4 mr-2" />Dogrula
        </Button>
      </div>
    </form>
  );
}
