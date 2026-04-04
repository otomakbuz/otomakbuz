import * as XLSX from "xlsx";
import type { Document } from "@/types";
import { getDocumentTypeLabel, getStatusLabel } from "@/lib/utils";

export function downloadExcel(documents: Document[], filename: string = "belgeler.xlsx") {
  const data = documents.map((doc) => ({
    Tarih: doc.issue_date || "",
    "Belge Türü": getDocumentTypeLabel(doc.document_type),
    "Belge No": doc.document_number || "",
    Düzenleyen: doc.supplier_name || "",
    "Düzenleyen VKN/TCKN": doc.supplier_tax_id || "",
    "Düzenleyen Vergi Dairesi": doc.supplier_tax_office || "",
    Alıcı: doc.buyer_name || "",
    "Alıcı VKN/TCKN": doc.buyer_tax_id || "",
    "Alıcı Vergi Dairesi": doc.buyer_tax_office || "",
    Yön: doc.direction === "income" ? "Gelir" : "Gider",
    Kategori: doc.category?.name || "",
    "Ara Toplam": doc.subtotal_amount || "",
    KDV: doc.vat_amount || "",
    "KDV Oranı": doc.vat_rate ? `%${doc.vat_rate}` : "",
    Stopaj: doc.withholding_amount || "",
    "Toplam Tutar": doc.total_amount || "",
    "Para Birimi": doc.currency,
    "Ödeme Yöntemi": doc.payment_method || "",
    "İrsaliye No": doc.waybill_number || "",
    Durum: getStatusLabel(doc.status),
    "Güven Skoru": doc.confidence_score ? `%${doc.confidence_score}` : "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Belgeler");

  // Gelir/Gider Özet sheet
  const incomeTotal = documents.filter(d => d.direction === "income").reduce((s, d) => s + (d.total_amount || 0), 0);
  const expenseTotal = documents.filter(d => d.direction === "expense").reduce((s, d) => s + (d.total_amount || 0), 0);
  const summaryData = [
    { "": "Toplam Gelir", Tutar: incomeTotal },
    { "": "Toplam Gider", Tutar: expenseTotal },
    { "": "Net", Tutar: incomeTotal - expenseTotal },
    { "": "Belge Sayısı", Tutar: documents.length },
  ];
  const wsSum = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSum, "Ozet");

  // Column widths
  if (data.length > 0) {
    const colWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key as keyof typeof row]).length)),
    }));
    ws["!cols"] = colWidths;
  }

  XLSX.writeFile(wb, filename);
}
