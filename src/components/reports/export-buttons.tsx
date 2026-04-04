"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/export/csv";
import { downloadExcel } from "@/lib/export/excel";
import type { Document } from "@/types";

export function ExportButtons({ documents }: { documents: Document[] }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => downloadCsv(documents)} disabled={documents.length === 0}>
        <Download className="h-4 w-4 mr-2" />CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => downloadExcel(documents)} disabled={documents.length === 0}>
        <Download className="h-4 w-4 mr-2" />Excel
      </Button>
    </div>
  );
}
