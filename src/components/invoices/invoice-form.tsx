"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Eye,
  Download,
  FileCode,
  Calendar,
  Repeat,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactSelector } from "./contact-selector";
import { LineItemsEditor, newLineItem, calcLineItem } from "./line-items-editor";
import { InvoicePreview } from "./invoice-preview";
import { createOutgoingInvoice, convertCurrencyToTry } from "@/lib/actions/outgoing-invoices";
import { generateEFaturaXml } from "@/lib/actions/e-fatura";
import type { InvoiceLineItem, CompanyInfo } from "@/types";

interface ContactOption {
  id: string;
  company_name: string;
  tax_id: string | null;
  type: string;
}

interface InvoiceFormProps {
  contacts: ContactOption[];
  company: CompanyInfo & { name: string };
}

const CURRENCIES = [
  { value: "TRY", label: "TRY" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

const PAYMENT_METHODS = [
  { value: "", label: "Seçiniz" },
  { value: "nakit", label: "Nakit" },
  { value: "havale", label: "Havale/EFT" },
  { value: "kredi_karti", label: "Kredi Kartı" },
  { value: "banka_karti", label: "Banka Kartı" },
  { value: "diger", label: "Diğer" },
];

export function InvoiceForm({ contacts, company }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Form state
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [currency, setCurrency] = useState("TRY");

  // Buyer
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [buyerName, setBuyerName] = useState("");
  const [buyerTaxId, setBuyerTaxId] = useState("");
  const [buyerTaxOffice, setBuyerTaxOffice] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    calcLineItem(newLineItem()),
  ]);

  // Extra
  const [withholdingAmount, setWithholdingAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [tryEquivalent, setTryEquivalent] = useState<{ tryAmount: number; rate: number } | null>(null);

  const subtotal = lineItems.reduce((sum, li) => sum + li.line_total, 0);
  const vatAmount = lineItems.reduce((sum, li) => sum + li.vat_amount, 0);
  const total = subtotal + vatAmount - withholdingAmount;

  // TCMB kur çekme — döviz seçildiğinde TL karşılığını göster
  useEffect(() => {
    if (currency === "TRY" || total <= 0) {
      setTryEquivalent(null);
      return;
    }
    convertCurrencyToTry(total, currency).then((result) => {
      setTryEquivalent(result);
    }).catch(() => setTryEquivalent(null));
  }, [currency, total]);

  const handleContactSelect = useCallback(
    (contact: ContactOption | null) => {
      if (contact) {
        setSelectedContactId(contact.id);
        setBuyerName(contact.company_name);
        setBuyerTaxId(contact.tax_id || "");
        // Tax office and address are not in the search result, so keep manual
      } else {
        setSelectedContactId(null);
        setBuyerName("");
        setBuyerTaxId("");
        setBuyerTaxOffice("");
        setBuyerAddress("");
        setBuyerPhone("");
        setBuyerEmail("");
      }
    },
    []
  );

  const buildFormData = useCallback(
    (status: "draft" | "verified") => {
      const fd = new FormData();
      fd.set("status", status);
      fd.set("issue_date", issueDate);
      fd.set("due_date", dueDate);
      fd.set("payment_method", paymentMethod);
      fd.set("currency", currency);
      fd.set("contact_id", selectedContactId || "");
      fd.set("buyer_name", buyerName);
      fd.set("buyer_tax_id", buyerTaxId);
      fd.set("buyer_tax_office", buyerTaxOffice);
      fd.set("buyer_address", buyerAddress);
      fd.set("withholding_amount", String(withholdingAmount));
      fd.set("notes", notes);
      fd.set("payment_terms", paymentTerms);
      fd.set("line_items", JSON.stringify(lineItems));
      fd.set("is_recurring", isRecurring ? "true" : "false");
      fd.set("recurring_interval", recurringInterval);
      return fd;
    },
    [
      issueDate,
      dueDate,
      paymentMethod,
      currency,
      selectedContactId,
      buyerName,
      buyerTaxId,
      buyerTaxOffice,
      buyerAddress,
      withholdingAmount,
      notes,
      paymentTerms,
      lineItems,
      isRecurring,
      recurringInterval,
    ]
  );

  const handleSave = async (status: "draft" | "verified") => {
    if (!buyerName.trim()) {
      toast.error("Alıcı adı zorunludur");
      return;
    }
    if (lineItems.every((li) => !li.description.trim())) {
      toast.error("En az bir kalem açıklaması giriniz");
      return;
    }

    setLoading(true);
    try {
      const fd = buildFormData(status);
      const doc = await createOutgoingInvoice(fd);
      toast.success(
        status === "draft"
          ? "Fatura taslak olarak kaydedildi"
          : "Fatura oluşturuldu"
      );
      router.push(`/faturalarim`);
    } catch (err) {
      toast.error(
        `Fatura kaydedilemedi: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!buyerName.trim()) {
      toast.error("PDF için alıcı adı giriniz");
      return;
    }

    setLoading(true);
    try {
      // Save first, then generate PDF
      const fd = buildFormData("verified");
      const doc = await createOutgoingInvoice(fd);

      // Import PDF generator dynamically
      const { generateInvoicePdf } = await import(
        "@/lib/invoices/pdf-generator"
      );
      const blob = await generateInvoicePdf(doc, company);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fatura_${doc.document_number || "yeni"}_${issueDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Fatura oluşturuldu ve PDF indirildi");
      router.push("/faturalarim");
    } catch (err) {
      toast.error(
        `PDF oluşturulamadı: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateXml = async () => {
    if (!buyerName.trim()) {
      toast.error("E-Fatura için alıcı adı giriniz");
      return;
    }

    setLoading(true);
    try {
      const fd = buildFormData("verified");
      const doc = await createOutgoingInvoice(fd);

      const { xml, filename } = await generateEFaturaXml(doc.id);
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("E-Fatura XML oluşturuldu ve indirildi");
      router.push("/faturalarim");
    } catch (err) {
      toast.error(
        `E-Fatura oluşturulamadı: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Date section */}
      <div className="receipt-card rounded p-5">
        <h2 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-receipt-gold" />
          Fatura Bilgileri
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-ink-muted">Fatura Tarihi</Label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-ink-muted">Vade Tarihi</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-ink-muted">Ödeme Yöntemi</Label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-9 text-sm mt-1 w-full rounded-lg border border-input bg-transparent px-2.5"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.value} value={pm.value}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs text-ink-muted">Para Birimi</Label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-9 text-sm mt-1 w-full rounded-lg border border-input bg-transparent px-2.5"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Buyer section */}
      <div className="receipt-card rounded p-5">
        <h2 className="text-sm font-bold text-ink mb-4">Alıcı Bilgileri</h2>
        <div className="mb-4">
          <Label className="text-xs text-ink-muted mb-1 block">
            Mevcut Cariden Seç
          </Label>
          <ContactSelector
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelect={handleContactSelect}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-ink-muted">
              Firma/Kişi Adı <span className="text-red-500">*</span>
            </Label>
            <Input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Alıcı adı"
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-ink-muted">VKN/TCKN</Label>
            <Input
              value={buyerTaxId}
              onChange={(e) => setBuyerTaxId(e.target.value)}
              placeholder="Vergi kimlik no"
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-ink-muted">Vergi Dairesi</Label>
            <Input
              value={buyerTaxOffice}
              onChange={(e) => setBuyerTaxOffice(e.target.value)}
              placeholder="Vergi dairesi"
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-ink-muted">Telefon</Label>
            <Input
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="Telefon"
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-ink-muted">E-posta</Label>
            <Input
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="E-posta"
              className="h-9 text-sm mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs text-ink-muted">Adres</Label>
            <Input
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              placeholder="Adres"
              className="h-9 text-sm mt-1"
            />
          </div>
        </div>
      </div>

      {/* Line items section */}
      <div className="receipt-card rounded p-5">
        <h2 className="text-sm font-bold text-ink mb-4">Kalemler</h2>
        <LineItemsEditor
          items={lineItems}
          onChange={setLineItems}
          currency={currency}
        />

        {/* Withholding */}
        <div className="mt-4 flex items-center gap-3 justify-end">
          <Label className="text-xs text-ink-muted whitespace-nowrap">
            Stopaj:
          </Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={withholdingAmount || ""}
            onChange={(e) =>
              setWithholdingAmount(parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            className="h-8 text-sm w-32"
          />
        </div>

        {withholdingAmount > 0 && (
          <div className="flex justify-end mt-2 text-sm">
            <div className="flex items-center gap-8">
              <span className="text-ink font-bold">
                Stopaj Sonrası Toplam:
              </span>
              <span className="text-ink font-bold text-base w-28 text-right">
                {total.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {currency}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TCMB Kur Göstergesi */}
      {tryEquivalent && currency !== "TRY" && (
        <div className="receipt-card rounded px-5 py-3 bg-blue-50/50 border-blue-200/50 flex items-center justify-between">
          <div className="text-sm text-blue-800">
            <span className="font-medium">TCMB Kuru:</span>{" "}
            1 {currency} = {tryEquivalent.rate.toFixed(4)} TL
          </div>
          <div className="text-sm font-bold text-blue-900">
            TL Karşılığı: {tryEquivalent.tryAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
          </div>
        </div>
      )}

      {/* Notes section */}
      <div className="receipt-card rounded p-5">
        <h2 className="text-sm font-bold text-ink mb-4">Notlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-ink-muted">Vade Koşulları</Label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="Ör: 30 gün vadeli"
              className="h-9 text-sm mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs text-ink-muted">Açıklama / Notlar</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fatura ile ilgili ek notlar..."
              className="mt-1 text-sm min-h-[60px]"
            />
          </div>
        </div>
      </div>

      {/* Tekrarlayan Fatura */}
      <div className="receipt-card rounded p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <Repeat className="h-4 w-4 text-receipt-gold" />
            Tekrarlayan Fatura
          </h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-paper-lines rounded-full peer peer-checked:bg-receipt-brown transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>
        {isRecurring && (
          <div className="mt-4 flex items-center gap-3">
            <Label className="text-xs text-ink-muted whitespace-nowrap">Tekrar periyodu:</Label>
            <select
              value={recurringInterval}
              onChange={(e) => setRecurringInterval(e.target.value as "monthly" | "quarterly" | "yearly")}
              className="h-9 text-sm rounded-lg border border-input bg-transparent px-2.5"
            >
              <option value="monthly">Her ay</option>
              <option value="quarterly">Her 3 ay</option>
              <option value="yearly">Her yıl</option>
            </select>
            <p className="text-xs text-ink-faint">
              Bu fatura kaydedildikten sonra otomatik olarak tekrarlanacak.
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSave("draft")}
          disabled={loading}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Taslak Kaydet
        </Button>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger
            render={
              <Button type="button" variant="outline" className="gap-2" />
            }
          >
            <Eye className="h-4 w-4" />
            Önizle
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Fatura Önizleme</DialogTitle>
            </DialogHeader>
            <InvoicePreview
              companyName={company.name}
              companyTaxId={company.company_tax_id}
              companyTaxOffice={company.company_tax_office}
              companyAddress={company.company_address}
              companyPhone={company.company_phone}
              companyEmail={company.company_email}
              documentNumber="(Otomatik)"
              issueDate={issueDate}
              dueDate={dueDate}
              buyerName={buyerName}
              buyerTaxId={buyerTaxId}
              buyerTaxOffice={buyerTaxOffice}
              buyerAddress={buyerAddress}
              buyerPhone={buyerPhone}
              buyerEmail={buyerEmail}
              lineItems={lineItems}
              subtotal={subtotal}
              vatAmount={vatAmount}
              withholdingAmount={withholdingAmount}
              total={total}
              currency={currency}
              notes={notes}
              paymentTerms={paymentTerms}
            />
          </DialogContent>
        </Dialog>

        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={loading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          PDF İndir
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateXml}
          disabled={loading}
          className="gap-2"
        >
          <FileCode className="h-4 w-4" />
          E-Fatura Oluştur
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          onClick={() => handleSave("verified")}
          disabled={loading}
          className="gap-2 bg-receipt-brown hover:bg-receipt-brown-dark text-white"
        >
          <Save className="h-4 w-4" />
          Kaydet ve Onayla
        </Button>
      </div>
    </div>
  );
}
