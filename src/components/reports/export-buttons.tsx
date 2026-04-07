"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { downloadCsv, downloadParasutCsv } from "@/lib/export/csv";
import { downloadExcel } from "@/lib/export/excel";
import type { Document } from "@/types";

export function ExportButtons({ documents }: { documents: Document[] }) {
  const disabled = documents.length === 0;

  return (
    <div className="flex gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={() => downloadCsv(documents)} disabled={disabled}
        className="border-paper-lines hover:border-receipt-gold hover:text-receipt-brown transition-colors text-xs">
        <Download className="h-3.5 w-3.5 mr-1.5" />CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => void downloadExcel(documents)} disabled={disabled}
        className="border-paper-lines hover:border-receipt-gold hover:text-receipt-brown transition-colors text-xs">
        <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />Excel
      </Button>
      <Button variant="outline" size="sm" onClick={() => downloadParasutCsv(documents)} disabled={disabled}
        className="border-paper-lines hover:border-receipt-gold hover:text-receipt-brown transition-colors text-xs">
        <FileText className="h-3.5 w-3.5 mr-1.5" />Parasut
      </Button>
    </div>
  );
}
