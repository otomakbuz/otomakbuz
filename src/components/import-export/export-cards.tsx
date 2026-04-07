"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Users, Package, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  exportDocumentsData,
  exportContactsData,
  exportProductsData,
} from "@/lib/actions/import-export";

function generateCsvFromData(
  headers: string[],
  rows: string[][]
): string {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  return "\uFEFF" + csvContent;
}

function downloadBlob(content: string | ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onCsv: () => Promise<void>;
  onExcel: () => Promise<void>;
}

function ExportCard({ title, description, icon, onCsv, onExcel }: ExportCardProps) {
  const [loading, setLoading] = useState<"csv" | "excel" | null>(null);

  const handleAction = async (type: "csv" | "excel", action: () => Promise<void>) => {
    setLoading(type);
    try {
      await action();
      toast.success(`${title} dışa aktarıldı`);
    } catch {
      toast.error("Dışa aktarma sırasında hata oluştu");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="receipt-card rounded p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-ink text-sm">{title}</h3>
          <p className="text-ink-muted text-xs">{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction("csv", onCsv)}
          disabled={loading !== null}
          className="border-paper-lines hover:border-receipt-gold hover:text-receipt-brown transition-colors text-xs flex-1"
        >
          {loading === "csv" ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5 mr-1.5" />
          )}
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction("excel", onExcel)}
          disabled={loading !== null}
          className="border-paper-lines hover:border-receipt-gold hover:text-receipt-brown transition-colors text-xs flex-1"
        >
          {loading === "excel" ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
          )}
          Excel
        </Button>
      </div>
    </div>
  );
}

export function ExportCards() {
  // Document export
  const exportDocsCsv = async () => {
    const docs = await exportDocumentsData();
    const headers = ["Tarih", "Tedarikçi", "Belge No", "Tutar", "KDV", "Toplam", "Yön", "Kategori", "Durum"];
    const rows = docs.map((d: Record<string, unknown>) => [
      String(d.issue_date || ""),
      String(d.supplier_name || ""),
      String(d.document_number || ""),
      String(d.subtotal_amount || ""),
      String(d.vat_amount || ""),
      String(d.total_amount || ""),
      d.direction === "income" ? "Gelir" : "Gider",
      String((d.category as Record<string, unknown> | null)?.name || ""),
      String(d.status || ""),
    ]);
    downloadBlob(generateCsvFromData(headers, rows), "belgeler.csv", "text/csv;charset=utf-8;");
  };

  const exportDocsExcel = async () => {
    const docs = await exportDocumentsData();
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Belgeler");
    ws.columns = [
      { header: "Tarih", key: "date", width: 14 },
      { header: "Tedarikçi", key: "supplier", width: 25 },
      { header: "Belge No", key: "docNo", width: 16 },
      { header: "Tutar", key: "subtotal", width: 14 },
      { header: "KDV", key: "vat", width: 12 },
      { header: "Toplam", key: "total", width: 14 },
      { header: "Yön", key: "direction", width: 10 },
      { header: "Kategori", key: "category", width: 16 },
      { header: "Durum", key: "status", width: 12 },
    ];
    ws.getRow(1).font = { bold: true };
    for (const d of docs) {
      ws.addRow({
        date: (d as Record<string, unknown>).issue_date || "",
        supplier: (d as Record<string, unknown>).supplier_name || "",
        docNo: (d as Record<string, unknown>).document_number || "",
        subtotal: (d as Record<string, unknown>).subtotal_amount || "",
        vat: (d as Record<string, unknown>).vat_amount || "",
        total: (d as Record<string, unknown>).total_amount || "",
        direction: (d as Record<string, unknown>).direction === "income" ? "Gelir" : "Gider",
        category: ((d as Record<string, unknown>).category as Record<string, unknown> | null)?.name || "",
        status: (d as Record<string, unknown>).status || "",
      });
    }
    const buffer = await wb.xlsx.writeBuffer();
    downloadBlob(buffer, "belgeler.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  // Contact export
  const exportContactsCsv = async () => {
    const contacts = await exportContactsData();
    const headers = ["Ad", "Vergi No", "Vergi Dairesi", "Telefon", "Email", "Adres", "Şehir", "Tür"];
    const typeLabel = (t: string) => t === "customer" ? "Müşteri" : t === "both" ? "Her İkisi" : "Tedarikçi";
    const rows = contacts.map((c: Record<string, unknown>) => [
      String(c.company_name || ""),
      String(c.tax_id || ""),
      String(c.tax_office || ""),
      String(c.phone || ""),
      String(c.email || ""),
      String(c.address || ""),
      String(c.city || ""),
      typeLabel(String(c.type || "supplier")),
    ]);
    downloadBlob(generateCsvFromData(headers, rows), "cariler.csv", "text/csv;charset=utf-8;");
  };

  const exportContactsExcel = async () => {
    const contacts = await exportContactsData();
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Cariler");
    ws.columns = [
      { header: "Ad", key: "name", width: 25 },
      { header: "Vergi No", key: "taxId", width: 16 },
      { header: "Vergi Dairesi", key: "taxOffice", width: 18 },
      { header: "Telefon", key: "phone", width: 16 },
      { header: "Email", key: "email", width: 22 },
      { header: "Adres", key: "address", width: 30 },
      { header: "Şehir", key: "city", width: 14 },
      { header: "Tür", key: "type", width: 12 },
    ];
    ws.getRow(1).font = { bold: true };
    const typeLabel = (t: string) => t === "customer" ? "Müşteri" : t === "both" ? "Her İkisi" : "Tedarikçi";
    for (const c of contacts) {
      const r = c as Record<string, unknown>;
      ws.addRow({
        name: r.company_name || "",
        taxId: r.tax_id || "",
        taxOffice: r.tax_office || "",
        phone: r.phone || "",
        email: r.email || "",
        address: r.address || "",
        city: r.city || "",
        type: typeLabel(String(r.type || "supplier")),
      });
    }
    const buffer = await wb.xlsx.writeBuffer();
    downloadBlob(buffer, "cariler.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  // Product export
  const exportProductsCsv = async () => {
    const products = await exportProductsData();
    const headers = ["Kod", "Ad", "Birim", "Miktar", "Alış Fiyatı", "Satış Fiyatı", "Kategori", "Min Stok"];
    const rows = products.map((p: Record<string, unknown>) => [
      String(p.code || ""),
      String(p.name || ""),
      String(p.unit || ""),
      String(p.current_quantity || 0),
      String(p.unit_cost || 0),
      String(p.unit_price || 0),
      String(p.category || ""),
      String(p.reorder_level || 0),
    ]);
    downloadBlob(generateCsvFromData(headers, rows), "urunler.csv", "text/csv;charset=utf-8;");
  };

  const exportProductsExcel = async () => {
    const products = await exportProductsData();
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Ürünler");
    ws.columns = [
      { header: "Kod", key: "code", width: 14 },
      { header: "Ad", key: "name", width: 25 },
      { header: "Birim", key: "unit", width: 10 },
      { header: "Miktar", key: "qty", width: 10 },
      { header: "Alış Fiyatı", key: "cost", width: 14 },
      { header: "Satış Fiyatı", key: "price", width: 14 },
      { header: "Kategori", key: "category", width: 16 },
      { header: "Min Stok", key: "reorder", width: 10 },
    ];
    ws.getRow(1).font = { bold: true };
    for (const p of products) {
      const r = p as Record<string, unknown>;
      ws.addRow({
        code: r.code || "",
        name: r.name || "",
        unit: r.unit || "",
        qty: r.current_quantity || 0,
        cost: r.unit_cost || 0,
        price: r.unit_price || 0,
        category: r.category || "",
        reorder: r.reorder_level || 0,
      });
    }
    const buffer = await wb.xlsx.writeBuffer();
    downloadBlob(buffer, "urunler.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  // All data export
  const exportAllExcel = async () => {
    const [docs, contacts, products] = await Promise.all([
      exportDocumentsData(),
      exportContactsData(),
      exportProductsData(),
    ]);
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();

    // Belgeler sheet
    const ws1 = wb.addWorksheet("Belgeler");
    ws1.columns = [
      { header: "Tarih", key: "date", width: 14 },
      { header: "Tedarikçi", key: "supplier", width: 25 },
      { header: "Belge No", key: "docNo", width: 16 },
      { header: "Toplam", key: "total", width: 14 },
      { header: "Yön", key: "direction", width: 10 },
    ];
    ws1.getRow(1).font = { bold: true };
    for (const d of docs) {
      const r = d as Record<string, unknown>;
      ws1.addRow({
        date: r.issue_date || "",
        supplier: r.supplier_name || "",
        docNo: r.document_number || "",
        total: r.total_amount || "",
        direction: r.direction === "income" ? "Gelir" : "Gider",
      });
    }

    // Cariler sheet
    const ws2 = wb.addWorksheet("Cariler");
    ws2.columns = [
      { header: "Ad", key: "name", width: 25 },
      { header: "Vergi No", key: "taxId", width: 16 },
      { header: "Telefon", key: "phone", width: 16 },
      { header: "Email", key: "email", width: 22 },
      { header: "Şehir", key: "city", width: 14 },
    ];
    ws2.getRow(1).font = { bold: true };
    for (const c of contacts) {
      const r = c as Record<string, unknown>;
      ws2.addRow({ name: r.company_name || "", taxId: r.tax_id || "", phone: r.phone || "", email: r.email || "", city: r.city || "" });
    }

    // Ürünler sheet
    const ws3 = wb.addWorksheet("Ürünler");
    ws3.columns = [
      { header: "Kod", key: "code", width: 14 },
      { header: "Ad", key: "name", width: 25 },
      { header: "Miktar", key: "qty", width: 10 },
      { header: "Fiyat", key: "price", width: 14 },
    ];
    ws3.getRow(1).font = { bold: true };
    for (const p of products) {
      const r = p as Record<string, unknown>;
      ws3.addRow({ code: r.code || "", name: r.name || "", qty: r.current_quantity || 0, price: r.unit_price || 0 });
    }

    const buffer = await wb.xlsx.writeBuffer();
    downloadBlob(buffer, "tum-veriler.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-ink">Dışa Aktar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExportCard
          title="Belgeler"
          description="Tüm belgeleri dışa aktar"
          icon={<FileText className="h-5 w-5 text-receipt-brown" />}
          onCsv={exportDocsCsv}
          onExcel={exportDocsExcel}
        />
        <ExportCard
          title="Cariler"
          description="Tüm cari hesapları dışa aktar"
          icon={<Users className="h-5 w-5 text-receipt-brown" />}
          onCsv={exportContactsCsv}
          onExcel={exportContactsExcel}
        />
        <ExportCard
          title="Ürünler"
          description="Tüm ürünleri dışa aktar"
          icon={<Package className="h-5 w-5 text-receipt-brown" />}
          onCsv={exportProductsCsv}
          onExcel={exportProductsExcel}
        />
        <ExportCard
          title="Tümü"
          description="Tüm verileri tek dosyada indir"
          icon={<Database className="h-5 w-5 text-receipt-brown" />}
          onCsv={async () => {
            // For "all" CSV, just download docs CSV
            await exportDocsCsv();
          }}
          onExcel={exportAllExcel}
        />
      </div>
    </div>
  );
}
