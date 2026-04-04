import type { Document } from "@/types";
import { getDocumentTypeLabel, getStatusLabel } from "@/lib/utils";

export function generateCsv(documents: Document[]): string {
  const headers = [
    "Tarih", "Firma", "Belge Turu", "Belge No", "Kategori",
    "Ara Toplam", "KDV", "KDV Orani", "Toplam Tutar",
    "Para Birimi", "Odeme Yontemi", "Durum", "Guven Skoru",
  ];

  const rows = documents.map((doc) => [
    doc.issue_date || "", doc.supplier_name || "",
    getDocumentTypeLabel(doc.document_type), doc.document_number || "",
    doc.category?.name || "", doc.subtotal_amount?.toString() || "",
    doc.vat_amount?.toString() || "", doc.vat_rate ? `%${doc.vat_rate}` : "",
    doc.total_amount?.toString() || "", doc.currency,
    doc.payment_method || "", getStatusLabel(doc.status),
    doc.confidence_score ? `%${doc.confidence_score}` : "",
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
