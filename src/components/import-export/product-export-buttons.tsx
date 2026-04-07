"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportProductsData } from "@/lib/actions/import-export";

function downloadBlob(content: string | ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProductExportButtons() {
  const [loading, setLoading] = useState<"csv" | "excel" | null>(null);

  const handleCsv = async () => {
    setLoading("csv");
    try {
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
      const csv = "\uFEFF" + [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
      ].join("\n");
      downloadBlob(csv, "urunler.csv", "text/csv;charset=utf-8;");
      toast.success("CSV indirildi");
    } catch {
      toast.error("Dışa aktarma sırasında hata oluştu");
    } finally {
      setLoading(null);
    }
  };

  const handleExcel = async () => {
    setLoading("excel");
    try {
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
      toast.success("Excel indirildi");
    } catch {
      toast.error("Dışa aktarma sırasında hata oluştu");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={handleCsv} disabled={loading !== null}
        className="border-paper-lines hover:border-receipt-gold hover:text-receipt-brown transition-colors text-xs">
        {loading === "csv" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => void handleExcel()} disabled={loading !== null}
        className="border-paper-lines hover:border-receipt-gold hover:text-receipt-brown transition-colors text-xs">
        {loading === "excel" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />}
        Excel
      </Button>
    </div>
  );
}
