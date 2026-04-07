"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportContactsData } from "@/lib/actions/import-export";

function downloadBlob(content: string | ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ContactExportButtons() {
  const [loading, setLoading] = useState<"csv" | "excel" | null>(null);

  const handleCsv = async () => {
    setLoading("csv");
    try {
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
      const csv = "\uFEFF" + [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
      ].join("\n");
      downloadBlob(csv, "cariler.csv", "text/csv;charset=utf-8;");
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
