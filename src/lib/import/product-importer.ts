import type { ImportError } from "@/types";
import { parseCsv } from "./csv-parser";

export interface ProductImportRow {
  code: string;
  name: string;
  unit: string;
  current_quantity: number;
  unit_cost: number;
  unit_price: number;
  category: string | null;
  reorder_level: number;
}

const COLUMN_MAP: Record<string, keyof ProductImportRow> = {
  "Kod": "code",
  "Ürün Kodu": "code",
  "Ad": "name",
  "Ürün Adı": "name",
  "Birim": "unit",
  "Miktar": "current_quantity",
  "Stok Miktarı": "current_quantity",
  "Alış Fiyatı": "unit_cost",
  "Maliyet": "unit_cost",
  "Satış Fiyatı": "unit_price",
  "Fiyat": "unit_price",
  "Kategori": "category",
  "Min Stok": "reorder_level",
  "Minimum Stok": "reorder_level",
};

function parseNumber(value: string): number {
  if (!value || value.trim() === "") return 0;
  const cleaned = value.replace(/\./g, "").replace(",", ".").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseProductCsv(text: string): {
  valid: ProductImportRow[];
  errors: ImportError[];
} {
  const { rows } = parseCsv(text);
  const valid: ProductImportRow[] = [];
  const errors: ImportError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const entry: ProductImportRow = {
      code: "",
      name: "",
      unit: "Adet",
      current_quantity: 0,
      unit_cost: 0,
      unit_price: 0,
      category: null,
      reorder_level: 0,
    };

    for (const header of Object.keys(row)) {
      const field = COLUMN_MAP[header];
      if (!field) continue;
      const value = row[header];
      if (!value) continue;

      switch (field) {
        case "code":
          entry.code = value;
          break;
        case "name":
          entry.name = value;
          break;
        case "unit":
          entry.unit = value;
          break;
        case "category":
          entry.category = value;
          break;
        case "current_quantity":
          entry.current_quantity = parseNumber(value);
          break;
        case "unit_cost":
          entry.unit_cost = parseNumber(value);
          break;
        case "unit_price":
          entry.unit_price = parseNumber(value);
          break;
        case "reorder_level":
          entry.reorder_level = parseNumber(value);
          break;
      }
    }

    if (!entry.code) {
      errors.push({ row: rowNum, field: "Kod", message: "Ürün kodu zorunludur" });
      continue;
    }
    if (!entry.name) {
      errors.push({ row: rowNum, field: "Ad", message: "Ürün adı zorunludur" });
      continue;
    }

    valid.push(entry);
  }

  return { valid, errors };
}

/** Check for duplicates by code against existing products */
export function findProductDuplicates(
  rows: ProductImportRow[],
  existing: { code: string }[]
): { unique: ProductImportRow[]; duplicates: ProductImportRow[] } {
  const existingCodes = new Set(existing.map((p) => p.code.toLowerCase()));

  const unique: ProductImportRow[] = [];
  const duplicates: ProductImportRow[] = [];

  for (const row of rows) {
    if (existingCodes.has(row.code.toLowerCase())) {
      duplicates.push(row);
    } else {
      unique.push(row);
    }
  }

  return { unique, duplicates };
}

export const PRODUCT_TEMPLATE_HEADERS = [
  "Kod", "Ad", "Birim", "Miktar", "Alış Fiyatı", "Satış Fiyatı", "Kategori", "Min Stok",
];
