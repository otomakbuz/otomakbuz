import type { Document } from "@/types";
import { getDocumentTypeLabel, getStatusLabel } from "@/lib/utils";

export async function downloadExcel(documents: Document[], filename: string = "belgeler.xlsx") {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();

  // ── Belgeler sayfası ──────────────────────────────────────────────────────
  const ws = wb.addWorksheet("Belgeler");

  const columns = [
    { header: "Tarih", key: "Tarih" },
    { header: "Belge Türü", key: "BelgeTuru" },
    { header: "Belge No", key: "BelgeNo" },
    { header: "Düzenleyen", key: "Duzenleyen" },
    { header: "Düzenleyen VKN/TCKN", key: "DuzenleyenVKN" },
    { header: "Düzenleyen Vergi Dairesi", key: "DuzenleyenVD" },
    { header: "Alıcı", key: "Alici" },
    { header: "Alıcı VKN/TCKN", key: "AliciVKN" },
    { header: "Alıcı Vergi Dairesi", key: "AliciVD" },
    { header: "Yön", key: "Yon" },
    { header: "Kategori", key: "Kategori" },
    { header: "Ara Toplam", key: "AraToplam" },
    { header: "KDV", key: "KDV" },
    { header: "KDV Oranı", key: "KDVOrani" },
    { header: "Stopaj", key: "Stopaj" },
    { header: "Toplam Tutar", key: "ToplamTutar" },
    { header: "Para Birimi", key: "ParaBirimi" },
    { header: "Ödeme Yöntemi", key: "OdemeYontemi" },
    { header: "İrsaliye No", key: "IrsaliyeNo" },
    { header: "Durum", key: "Durum" },
    { header: "Güven Skoru", key: "GuvenSkoru" },
  ];

  ws.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.header.length + 4,
  }));

  // Başlık satırını kalın yap
  ws.getRow(1).font = { bold: true };

  for (const doc of documents) {
    const row = ws.addRow({
      Tarih: doc.issue_date || "",
      BelgeTuru: getDocumentTypeLabel(doc.document_type),
      BelgeNo: doc.document_number || "",
      Duzenleyen: doc.supplier_name || "",
      DuzenleyenVKN: doc.supplier_tax_id || "",
      DuzenleyenVD: doc.supplier_tax_office || "",
      Alici: doc.buyer_name || "",
      AliciVKN: doc.buyer_tax_id || "",
      AliciVD: doc.buyer_tax_office || "",
      Yon: doc.direction === "income" ? "Gelir" : "Gider",
      Kategori: doc.category?.name || "",
      AraToplam: doc.subtotal_amount || "",
      KDV: doc.vat_amount || "",
      KDVOrani: doc.vat_rate ? `%${doc.vat_rate}` : "",
      Stopaj: doc.withholding_amount || "",
      ToplamTutar: doc.total_amount || "",
      ParaBirimi: doc.currency,
      OdemeYontemi: doc.payment_method || "",
      IrsaliyeNo: doc.waybill_number || "",
      Durum: getStatusLabel(doc.status),
      GuvenSkoru: doc.confidence_score ? `%${doc.confidence_score}` : "",
    });

    // Sütun genişliğini içeriğe göre güncelle
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const col = ws.getColumn(colNumber);
      const cellLen = String(cell.value ?? "").length + 2;
      if (typeof col.width === "number" && cellLen > col.width) {
        col.width = cellLen;
      }
    });
  }

  // ── Özet sayfası ─────────────────────────────────────────────────────────
  const wsSum = wb.addWorksheet("Ozet");
  wsSum.columns = [
    { header: "", key: "label", width: 20 },
    { header: "Tutar", key: "tutar", width: 18 },
  ];
  wsSum.getRow(1).font = { bold: true };

  const incomeTotal = documents
    .filter((d) => d.direction === "income")
    .reduce((s, d) => s + (d.total_amount || 0), 0);
  const expenseTotal = documents
    .filter((d) => d.direction === "expense")
    .reduce((s, d) => s + (d.total_amount || 0), 0);

  wsSum.addRow({ label: "Toplam Gelir", tutar: incomeTotal });
  wsSum.addRow({ label: "Toplam Gider", tutar: expenseTotal });
  wsSum.addRow({ label: "Net", tutar: incomeTotal - expenseTotal });
  wsSum.addRow({ label: "Belge Sayısı", tutar: documents.length });

  // ── İndir ────────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
