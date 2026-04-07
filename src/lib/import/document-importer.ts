import type { ImportError } from "@/types";
import { parseCsv } from "./csv-parser";

export interface DocumentImportRow {
  date: string | null;
  supplier: string | null;
  document_number: string | null;
  subtotal: number | null;
  vat: number | null;
  total: number | null;
  document_type: string | null;
  direction: "income" | "expense";
  notes: string | null;
  category: string | null;
}

/** Turkish header -> internal field mapping */
const COLUMN_MAP: Record<string, keyof DocumentImportRow> = {
  "Tarih": "date",
  "Tedarikçi": "supplier",
  "Tedarikci": "supplier",
  "Belge No": "document_number",
  "Tutar": "subtotal",
  "KDV": "vat",
  "Toplam": "total",
  "Tür": "document_type",
  "Tur": "document_type",
  "Yön": "direction",
  "Yon": "direction",
  "Açıklama": "notes",
  "Aciklama": "notes",
  "Kategori": "category",
};

function mapDirection(value: string): "income" | "expense" {
  const v = value.trim().toLowerCase();
  if (v === "gelir" || v === "income") return "income";
  return "expense";
}

function parseNumber(value: string): number | null {
  if (!value || value.trim() === "") return null;
  // Handle Turkish number format: 1.234,56 -> 1234.56
  const cleaned = value.replace(/\./g, "").replace(",", ".").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function parseDocumentCsv(text: string): {
  valid: DocumentImportRow[];
  errors: ImportError[];
} {
  const { headers, rows } = parseCsv(text);
  const valid: DocumentImportRow[] = [];
  const errors: ImportError[] = [];

  // Map headers
  const headerMap: Record<number, keyof DocumentImportRow> = {};
  headers.forEach((h, i) => {
    const mapped = COLUMN_MAP[h];
    if (mapped) headerMap[i] = mapped;
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header row

    const entry: DocumentImportRow = {
      date: null,
      supplier: null,
      document_number: null,
      subtotal: null,
      vat: null,
      total: null,
      document_type: null,
      direction: "expense",
      notes: null,
      category: null,
    };

    // Map values using header mapping
    for (const header of Object.keys(row)) {
      const field = COLUMN_MAP[header];
      if (!field) continue;
      const value = row[header];
      if (!value) continue;

      switch (field) {
        case "date":
          entry.date = value;
          break;
        case "supplier":
          entry.supplier = value;
          break;
        case "document_number":
          entry.document_number = value;
          break;
        case "subtotal":
          entry.subtotal = parseNumber(value);
          break;
        case "vat":
          entry.vat = parseNumber(value);
          break;
        case "total":
          entry.total = parseNumber(value);
          break;
        case "document_type":
          entry.document_type = value;
          break;
        case "direction":
          entry.direction = mapDirection(value);
          break;
        case "notes":
          entry.notes = value;
          break;
        case "category":
          entry.category = value;
          break;
      }
    }

    // Validate required fields
    if (!entry.date) {
      errors.push({ row: rowNum, field: "Tarih", message: "Tarih alanı zorunludur" });
      continue;
    }
    if (entry.subtotal === null && entry.total === null) {
      errors.push({ row: rowNum, field: "Tutar/Toplam", message: "Tutar veya toplam alanı zorunludur" });
      continue;
    }

    // Auto-calculate total if missing
    if (entry.total === null) {
      entry.total = (entry.subtotal || 0) + (entry.vat || 0);
    }

    valid.push(entry);
  }

  return { valid, errors };
}

/** CSV template headers for document import */
export const DOCUMENT_TEMPLATE_HEADERS = [
  "Tarih", "Tedarikçi", "Belge No", "Tutar", "KDV", "Toplam",
  "Tür", "Yön", "Açıklama", "Kategori",
];
