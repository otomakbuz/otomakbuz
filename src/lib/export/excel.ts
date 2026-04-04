import * as XLSX from "xlsx";
import type { Document } from "@/types";
import { getDocumentTypeLabel, getStatusLabel } from "@/lib/utils";

export function downloadExcel(documents: Document[], filename: string = "belgeler.xlsx") {
  const data = documents.map((doc) => ({
    Tarih: doc.issue_date || "",
    Firma: doc.supplier_name || "",
    "Belge Turu": getDocumentTypeLabel(doc.document_type),
    "Belge No": doc.document_number || "",
    Kategori: doc.category?.name || "",
    "Ara Toplam": doc.subtotal_amount || "",
    KDV: doc.vat_amount || "",
    "KDV Orani": doc.vat_rate ? `%${doc.vat_rate}` : "",
    "Toplam Tutar": doc.total_amount || "",
    "Para Birimi": doc.currency,
    "Odeme Yontemi": doc.payment_method || "",
    Durum: getStatusLabel(doc.status),
    "Guven Skoru": doc.confidence_score ? `%${doc.confidence_score}` : "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Belgeler");

  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key as keyof typeof row]).length)),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, filename);
}
