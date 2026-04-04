"use client";

import { useState, useMemo } from "react";
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
import type { Document, Category, DocumentDirection, DocumentType, DocumentLineItem } from "@/types";
import { cn } from "@/lib/utils";
import {
  Save,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Building2,
  User,
  Receipt,
  Coins,
  ListTree,
} from "lucide-react";
import {
  DOCUMENT_TYPES,
  getFieldRequirement,
  type FieldRequirement,
} from "@/lib/document-types";

interface ReviewFormProps {
  document: Document;
  categories: Category[];
  onSaved?: () => void;
}

export function ReviewForm({ document: doc, categories, onSaved }: ReviewFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState<DocumentDirection>(doc.direction || "expense");
  const [docType, setDocType] = useState<DocumentType>(doc.document_type || "fatura");
  const fieldScores = (doc.field_scores || {}) as Record<string, number>;

  // Belge türüne göre alan zorunlulukları
  const req = useMemo(() => {
    return (field: Parameters<typeof getFieldRequirement>[1]): FieldRequirement =>
      getFieldRequirement(docType, field);
  }, [docType]);

  const show = (field: Parameters<typeof getFieldRequirement>[1]) => req(field) !== "hidden";
  const isRequired = (field: Parameters<typeof getFieldRequirement>[1]) => req(field) === "required";

  const lineItems = (doc.line_items as DocumentLineItem[] | null) || null;

  function FieldRow({
    label,
    field,
    required,
    children,
  }: {
    label: string;
    field: string;
    required?: boolean;
    children: React.ReactNode;
  }) {
    const score = fieldScores[field];
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded border",
          score !== undefined ? getConfidenceColor(score) : "border-paper-lines"
        )}
      >
        <div className="flex-1 min-w-0 space-y-0.5">
          <Label className="text-[10px] leading-tight text-ink-muted flex items-center gap-1">
            {label}
            {required && <span className="text-red-600">*</span>}
          </Label>
          {children}
        </div>
        {score !== undefined && <ConfidenceBadge score={score} />}
      </div>
    );
  }

  function SectionHeader({ icon: Icon, title }: { icon: typeof Building2; title: string }) {
    return (
      <div className="flex items-center gap-1.5 pt-1.5 pb-0">
        <Icon className="h-3 w-3 text-receipt-brown" />
        <h4 className="text-[10px] font-semibold text-ink uppercase tracking-wide">{title}</h4>
      </div>
    );
  }

  async function handleSave(formData: FormData) {
    setSaving(true);
    try {
      const parseNum = (v: FormDataEntryValue | null) => {
        const s = (v as string) || "";
        const n = parseFloat(s);
        return Number.isFinite(n) ? n : null;
      };

      await updateDocument(doc.id, {
        document_type: (formData.get("document_type") as string) || null,
        // Düzenleyen
        supplier_name: (formData.get("supplier_name") as string) || null,
        supplier_tax_id: (formData.get("supplier_tax_id") as string) || null,
        supplier_tax_office: (formData.get("supplier_tax_office") as string) || null,
        supplier_address: (formData.get("supplier_address") as string) || null,
        // Alıcı
        buyer_name: (formData.get("buyer_name") as string) || null,
        buyer_tax_id: (formData.get("buyer_tax_id") as string) || null,
        buyer_tax_office: (formData.get("buyer_tax_office") as string) || null,
        buyer_address: (formData.get("buyer_address") as string) || null,
        // Belge meta
        document_number: (formData.get("document_number") as string) || null,
        issue_date: (formData.get("issue_date") as string) || null,
        issue_time: (formData.get("issue_time") as string) || null,
        waybill_number: (formData.get("waybill_number") as string) || null,
        // Tutarlar
        subtotal_amount: parseNum(formData.get("subtotal_amount")),
        vat_amount: parseNum(formData.get("vat_amount")),
        vat_rate: parseNum(formData.get("vat_rate")),
        withholding_amount: parseNum(formData.get("withholding_amount")),
        total_amount: parseNum(formData.get("total_amount")),
        // Diğer
        payment_method: (formData.get("payment_method") as string) || null,
        category_id: (formData.get("category_id") as string) || null,
        notes: (formData.get("notes") as string) || null,
        direction: (formData.get("direction") as DocumentDirection) || "expense",
      } as Partial<Document>);
      toast.success("Belge kaydedildi");
      router.refresh();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  async function handleVerify() {
    setSaving(true);
    try {
      await verifyDocument(doc.id);
      toast.success("Belge doğrulandı");
      router.refresh();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Doğrulama hatası");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={handleSave} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-receipt-brown" />
          <h3 className="font-semibold text-ink text-xs">Belge Bilgileri</h3>
        </div>
        <ConfidenceBadge score={doc.confidence_score} showLabel />
      </div>

      {/* Gelir / Gider Toggle */}
      <div className="flex rounded border border-paper-lines overflow-hidden">
        <button
          type="button"
          onClick={() => setDirection("expense")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium transition-all",
            direction === "expense"
              ? "bg-red-50 text-red-700 border-r border-red-200/60"
              : "text-ink-muted hover:bg-receipt-gold/5 border-r border-paper-lines"
          )}
        >
          <ArrowUpRight className="h-3 w-3" />
          Gider
        </button>
        <button
          type="button"
          onClick={() => setDirection("income")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium transition-all",
            direction === "income"
              ? "bg-emerald-50 text-emerald-700"
              : "text-ink-muted hover:bg-receipt-gold/5"
          )}
        >
          <ArrowDownLeft className="h-3 w-3" />
          Gelir
        </button>
      </div>
      <input type="hidden" name="direction" value={direction} />

      {/* Belge Türü — en üstte, diğer alanları tetikler */}
      <FieldRow label="Belge Türü" field="document_type" required>
        <Select
          name="document_type"
          defaultValue={doc.document_type || "fatura"}
          onValueChange={(v) => setDocType(v as DocumentType)}
        >
          <SelectTrigger className="h-7 text-xs border-paper-lines bg-paper">
            <SelectValue placeholder="Seçiniz..." />
          </SelectTrigger>
          <SelectContent>
            {Object.values(DOCUMENT_TYPES).map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <div className="flex items-center gap-2">
                  <span>{t.label}</span>
                  {!t.isMvp && (
                    <span className="text-[10px] text-ink-faint">(yakında)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      {/* ── Düzenleyen (Satıcı) ── */}
      <SectionHeader icon={Building2} title="Düzenleyen" />

      {show("supplier_name") && (
        <FieldRow label="Firma / Ad Unvan" field="supplier_name" required={isRequired("supplier_name")}>
          <Input
            name="supplier_name"
            defaultValue={doc.supplier_name || ""}
            className="h-7 text-xs border-paper-lines bg-paper"
          />
        </FieldRow>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {show("supplier_tax_id") && (
          <FieldRow label="VKN / TCKN" field="supplier_tax_id" required={isRequired("supplier_tax_id")}>
            <Input
              name="supplier_tax_id"
              defaultValue={doc.supplier_tax_id || ""}
              className="h-7 text-xs border-paper-lines bg-paper"
            />
          </FieldRow>
        )}
        {show("supplier_tax_office") && (
          <FieldRow
            label="Vergi Dairesi"
            field="supplier_tax_office"
            required={isRequired("supplier_tax_office")}
          >
            <Input
              name="supplier_tax_office"
              defaultValue={doc.supplier_tax_office || ""}
              className="h-7 text-xs border-paper-lines bg-paper"
            />
          </FieldRow>
        )}
      </div>

      {show("supplier_address") && (
        <FieldRow label="Adres" field="supplier_address" required={isRequired("supplier_address")}>
          <Input
            name="supplier_address"
            defaultValue={doc.supplier_address || ""}
            className="h-7 text-xs border-paper-lines bg-paper"
          />
        </FieldRow>
      )}

      {/* ── Alıcı ── (sadece ilgili belge türlerinde) */}
      {(show("buyer_name") || show("buyer_tax_id") || show("buyer_address")) && (
        <>
          <SectionHeader icon={User} title="Alıcı" />

          {show("buyer_name") && (
            <FieldRow label="Ad / Unvan" field="buyer_name" required={isRequired("buyer_name")}>
              <Input
                name="buyer_name"
                defaultValue={doc.buyer_name || ""}
                className="h-7 text-xs border-paper-lines bg-paper"
              />
            </FieldRow>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {show("buyer_tax_id") && (
              <FieldRow label="VKN / TCKN" field="buyer_tax_id" required={isRequired("buyer_tax_id")}>
                <Input
                  name="buyer_tax_id"
                  defaultValue={doc.buyer_tax_id || ""}
                  className="h-7 text-xs border-paper-lines bg-paper"
                />
              </FieldRow>
            )}
            {show("buyer_tax_office") && (
              <FieldRow
                label="Vergi Dairesi"
                field="buyer_tax_office"
                required={isRequired("buyer_tax_office")}
              >
                <Input
                  name="buyer_tax_office"
                  defaultValue={doc.buyer_tax_office || ""}
                  className="h-7 text-xs border-paper-lines bg-paper"
                />
              </FieldRow>
            )}
          </div>

          {show("buyer_address") && (
            <FieldRow label="Adres" field="buyer_address" required={isRequired("buyer_address")}>
              <Input
                name="buyer_address"
                defaultValue={doc.buyer_address || ""}
                className="h-7 text-xs border-paper-lines bg-paper"
              />
            </FieldRow>
          )}
        </>
      )}

      {/* ── Belge Meta ── */}
      <SectionHeader icon={Receipt} title="Belge Meta" />

      <div className="grid grid-cols-2 gap-1.5">
        {show("document_number") && (
          <FieldRow label="Belge No" field="document_number" required={isRequired("document_number")}>
            <Input
              name="document_number"
              defaultValue={doc.document_number || ""}
              className="h-7 text-xs border-paper-lines bg-paper"
            />
          </FieldRow>
        )}
        {show("issue_date") && (
          <FieldRow label="Tarih" field="issue_date" required={isRequired("issue_date")}>
            <Input
              name="issue_date"
              type="date"
              defaultValue={doc.issue_date || ""}
              className="h-7 text-xs border-paper-lines bg-paper"
            />
          </FieldRow>
        )}
      </div>

      {(show("issue_time") || show("waybill_number")) && (
        <div className="grid grid-cols-2 gap-1.5">
          {show("issue_time") && (
            <FieldRow label="Saat" field="issue_time" required={isRequired("issue_time")}>
              <Input
                name="issue_time"
                type="time"
                defaultValue={doc.issue_time || ""}
                className="h-7 text-xs border-paper-lines bg-paper"
              />
            </FieldRow>
          )}
          {show("waybill_number") && (
            <FieldRow
              label="İrsaliye No"
              field="waybill_number"
              required={isRequired("waybill_number")}
            >
              <Input
                name="waybill_number"
                defaultValue={doc.waybill_number || ""}
                className="h-7 text-xs border-paper-lines bg-paper"
              />
            </FieldRow>
          )}
        </div>
      )}

      {/* ── Tutarlar ── */}
      {(show("subtotal_amount") || show("total_amount")) && (
        <SectionHeader icon={Coins} title="Tutarlar" />
      )}

      {(show("subtotal_amount") || show("total_amount")) && (
        <div className="grid grid-cols-2 gap-1.5">
          {show("subtotal_amount") && (
            <FieldRow
              label={docType === "serbest_meslek_makbuzu" ? "Brüt Tutar" : "Ara Toplam"}
              field="subtotal_amount"
              required={isRequired("subtotal_amount")}
            >
              <Input
                name="subtotal_amount"
                type="number"
                step="0.01"
                defaultValue={doc.subtotal_amount?.toString() || ""}
                className="h-7 text-xs border-paper-lines bg-paper"
              />
            </FieldRow>
          )}
          {show("total_amount") && (
            <FieldRow
              label={
                docType === "serbest_meslek_makbuzu" || docType === "gider_pusulasi"
                  ? "Net Ödenen"
                  : "Genel Toplam"
              }
              field="total_amount"
              required={isRequired("total_amount")}
            >
              <Input
                name="total_amount"
                type="number"
                step="0.01"
                defaultValue={doc.total_amount?.toString() || ""}
                className="h-7 text-xs border-paper-lines bg-paper"
              />
            </FieldRow>
          )}
        </div>
      )}

      {(show("vat_amount") || show("vat_rate")) && (
        <div className="grid grid-cols-2 gap-1.5">
          {show("vat_amount") && (
            <FieldRow label="KDV Tutarı" field="vat_amount" required={isRequired("vat_amount")}>
              <Input
                name="vat_amount"
                type="number"
                step="0.01"
                defaultValue={doc.vat_amount?.toString() || ""}
                className="h-7 text-xs border-paper-lines bg-paper"
              />
            </FieldRow>
          )}
          {show("vat_rate") && (
            <FieldRow label="KDV Oranı (%)" field="vat_rate" required={isRequired("vat_rate")}>
              <Input
                name="vat_rate"
                type="number"
                step="0.01"
                defaultValue={doc.vat_rate?.toString() || ""}
                className="h-7 text-xs border-paper-lines bg-paper"
              />
            </FieldRow>
          )}
        </div>
      )}

      {show("withholding_amount") && (
        <FieldRow
          label="Stopaj Tutarı"
          field="withholding_amount"
          required={isRequired("withholding_amount")}
        >
          <Input
            name="withholding_amount"
            type="number"
            step="0.01"
            defaultValue={doc.withholding_amount?.toString() || ""}
            className="h-7 text-xs border-paper-lines bg-paper"
          />
        </FieldRow>
      )}

      {/* ── Kalemler (read-only görünüm — faturalarda OCR'dan gelir) ── */}
      {show("line_items") && lineItems && lineItems.length > 0 && (
        <>
          <SectionHeader icon={ListTree} title="Kalemler" />
          <div className="rounded border border-paper-lines bg-paper overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-surface border-b border-paper-lines">
                <tr>
                  <th className="text-left px-2 py-1.5 font-semibold text-ink-muted">Ürün/Hizmet</th>
                  <th className="text-right px-2 py-1.5 font-semibold text-ink-muted w-12">Adet</th>
                  <th className="text-right px-2 py-1.5 font-semibold text-ink-muted w-20">B. Fiyat</th>
                  <th className="text-right px-2 py-1.5 font-semibold text-ink-muted w-20">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-paper-lines/50 last:border-0">
                    <td className="px-2 py-1.5 text-ink">{item.name}</td>
                    <td className="px-2 py-1.5 text-right text-ink-muted">{item.quantity}</td>
                    <td className="px-2 py-1.5 text-right text-ink-muted">
                      {item.unit_price.toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5 text-right text-ink font-medium">
                      {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Ödeme yöntemi + Kategori — yan yana */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <div className="space-y-0.5">
          <Label className="text-[10px] text-ink-muted">Ödeme Yöntemi</Label>
          <Select name="payment_method" defaultValue={doc.payment_method || ""}>
            <SelectTrigger className="h-7 text-xs border-paper-lines bg-paper">
              <SelectValue placeholder="Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nakit">Nakit</SelectItem>
              <SelectItem value="kredi_karti">Kredi Kartı</SelectItem>
              <SelectItem value="banka_karti">Banka Kartı</SelectItem>
              <SelectItem value="havale">Havale</SelectItem>
              <SelectItem value="diger">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-ink-muted">Kategori</Label>
          <Select name="category_id" defaultValue={doc.category_id || ""}>
            <SelectTrigger className="h-7 text-xs border-paper-lines bg-paper">
              <SelectValue placeholder="Seçiniz..." />
            </SelectTrigger>
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
      </div>

      <div className="space-y-0.5">
        <Label className="text-[10px] text-ink-muted">Not</Label>
        <Textarea
          name="notes"
          defaultValue={doc.notes || ""}
          rows={2}
          className="text-xs border-paper-lines bg-paper min-h-0 py-1.5"
          placeholder="İsteğe bağlı not ekleyin..."
        />
      </div>

      {/* Sticky bottom buttons */}
      <div className="flex gap-2 pt-2 border-t border-paper-lines">
        <Button
          type="submit"
          className="flex-1 bg-receipt-brown text-white hover:bg-receipt-brown-dark"
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleVerify}
          disabled={saving}
          className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Doğrula
        </Button>
      </div>
    </form>
  );
}
