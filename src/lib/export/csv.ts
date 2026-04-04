import type { Document } from "@/types";
import { getDocumentTypeLabel, getStatusLabel } from "@/lib/utils";

export function generateCsv(documents: Document[]): string {
  const headers = [
    "Tarih", "Belge Türü", "Belge No",
    "Düzenleyen", "Düzenleyen VKN/TCKN", "Düzenleyen Vergi Dairesi",
    "Alıcı", "Alıcı VKN/TCKN", "Alıcı Vergi Dairesi",
    "Yön", "Kategori",
    "Ara Toplam", "KDV", "KDV Oranı", "Stopaj", "Toplam Tutar",
    "Para Birimi", "Ödeme Yöntemi", "İrsaliye No",
    "Durum", "Güven Skoru",
  ];

  const rows = documents.map((doc) => [
    doc.issue_date || "",
    getDocumentTypeLabel(doc.document_type), doc.document_number || "",
    doc.supplier_name || "", doc.supplier_tax_id || "", doc.supplier_tax_office || "",
    doc.buyer_name || "", doc.buyer_tax_id || "", doc.buyer_tax_office || "",
    doc.direction === "income" ? "Gelir" : "Gider",
    doc.category?.name || "",
    doc.subtotal_amount?.toString() || "",
    doc.vat_amount?.toString() || "",
    doc.vat_rate ? `%${doc.vat_rate}` : "",
    doc.withholding_amount?.toString() || "",
    doc.total_amount?.toString() || "",
    doc.currency,
    doc.payment_method || "",
    doc.waybill_number || "",
    getStatusLabel(doc.status),
    doc.confidence_score ? `%${doc.confidence_score}` : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return "\uFEFF" + csvContent;
}

// Parasüt uyumlu CSV
export function generateParasutCsv(documents: Document[]): string {
  const headers = [
    "Tarih", "Fatura No", "Firma", "Vergi No",
    "Ara Toplam", "KDV Oranı", "KDV Tutar", "Toplam",
    "Para Birimi", "Tür", "Kategori", "Açıklama",
  ];

  const rows = documents.map((doc) => [
    doc.issue_date || "",
    doc.document_number || "",
    doc.supplier_name || "",
    doc.supplier_tax_id || "",
    doc.subtotal_amount?.toString() || "",
    doc.vat_rate?.toString() || "",
    doc.vat_amount?.toString() || "",
    doc.total_amount?.toString() || "",
    doc.currency,
    doc.direction === "income" ? "satis_faturasi" : "alis_faturasi",
    doc.category?.name || "",
    doc.notes || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return "\uFEFF" + csvContent;
}

export function downloadCsv(documents: Document[], filename: string = "belgeler.csv") {
  const csv = generateCsv(documents);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadParasutCsv(documents: Document[], filename: string = "parasut-import.csv") {
  const csv = generateParasutCsv(documents);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
