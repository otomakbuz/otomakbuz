"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, CheckCircle2, XCircle, Loader2, FileUp } from "lucide-react";
import { toast } from "sonner";
import { getImportTemplate } from "@/lib/actions/import-export";
import type { ImportResult } from "@/types";

interface ImportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  templateType: "documents" | "contacts" | "products";
  onImport: (formData: FormData) => Promise<ImportResult>;
  previewHeaders?: string[];
}

export function ImportCard({
  title,
  description,
  icon,
  templateType,
  onImport,
  previewHeaders,
}: ImportCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setFile(f);
      setResult(null);

      try {
        const text = await f.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length === 0) return;

        // Simple preview parse (first 5 rows)
        const delimiter = lines[0].includes(";") ? ";" : lines[0].includes("\t") ? "\t" : ",";
        const hdr = lines[0].split(delimiter).map((h) => h.replace(/^"|"$/g, "").trim());
        setHeaders(hdr);

        const rows: string[][] = [];
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const vals = lines[i].split(delimiter).map((v) => v.replace(/^"|"$/g, "").trim());
          rows.push(vals);
        }
        setPreview(rows);
      } catch {
        toast.error("Dosya okunamadı");
      }
    },
    []
  );

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await onImport(formData);
      setResult(res);

      if (res.imported > 0) {
        toast.success(`${res.imported} kayıt eklendi`);
      }
      if (res.skipped > 0) {
        toast.info(`${res.skipped} kayıt atlandı`);
      }
      if (res.errors.length > 0) {
        toast.error(`${res.errors.length} hata oluştu`);
      }
    } catch (err) {
      toast.error(String(err));
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const csv = await getImportTemplate(templateType);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${templateType}-sablon.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Şablon indirildi");
    } catch {
      toast.error("Şablon indirilemedi");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) {
        // Simulate file input change
        const dt = new DataTransfer();
        dt.items.add(f);
        if (inputRef.current) {
          inputRef.current.files = dt.files;
          inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    },
    []
  );

  return (
    <div className="receipt-card rounded p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-ink text-sm">{title}</h3>
          <p className="text-ink-muted text-xs">{description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadTemplate}
          className="text-xs text-ink-muted hover:text-receipt-brown"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Şablon
        </Button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-paper-lines rounded p-4 text-center hover:border-receipt-gold transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-sm text-ink">
            <FileUp className="h-4 w-4 text-receipt-brown" />
            {file.name}
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="h-6 w-6 mx-auto text-ink-muted" />
            <p className="text-xs text-ink-muted">
              CSV veya Excel dosyası sürükleyin veya seçin
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-paper-lines">
                {headers.map((h, i) => {
                  const isExpected =
                    !previewHeaders || previewHeaders.some(
                      (ph) => ph.toLowerCase() === h.toLowerCase()
                    );
                  return (
                    <th key={i} className="py-1.5 px-2 text-left font-medium text-ink-muted">
                      <span className="flex items-center gap-1">
                        {h}
                        {isExpected ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-paper-lines/50">
                  {row.map((cell, j) => (
                    <td key={j} className="py-1 px-2 text-ink truncate max-w-[120px]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-ink-faint mt-1">
            {preview.length} satır onizleme gosteriliyor
          </p>
        </div>
      )}

      {/* Import button */}
      {file && (
        <Button
          onClick={handleImport}
          disabled={importing}
          className="w-full bg-receipt-brown hover:bg-receipt-brown/90 text-white text-sm"
        >
          {importing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {importing ? "İçe aktarılıyor..." : "İçe Aktar"}
        </Button>
      )}

      {/* Result */}
      {result && (
        <div className="rounded bg-receipt-gold/8 p-3 text-xs space-y-1">
          <p className="text-ink font-medium">Sonuç:</p>
          <p className="text-ink">
            {result.imported} kayıt eklendi, {result.skipped} atlandı
            {result.errors.length > 0 && `, ${result.errors.length} hata`}
          </p>
          {result.errors.length > 0 && (
            <details className="mt-1">
              <summary className="text-ink-muted cursor-pointer">Hataları göster</summary>
              <ul className="mt-1 space-y-0.5 text-red-600">
                {result.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {result.errors.length > 10 && (
                  <li className="text-ink-muted">
                    ...ve {result.errors.length - 10} hata daha
                  </li>
                )}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
