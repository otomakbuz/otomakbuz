import type { ImportError, ContactType } from "@/types";
import { parseCsv } from "./csv-parser";

export interface ContactImportRow {
  company_name: string;
  tax_id: string | null;
  tax_office: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  type: ContactType;
}

const COLUMN_MAP: Record<string, keyof ContactImportRow> = {
  "Ad": "company_name",
  "Firma Adı": "company_name",
  "Firma": "company_name",
  "Vergi No": "tax_id",
  "VKN": "tax_id",
  "Vergi Dairesi": "tax_office",
  "Telefon": "phone",
  "Email": "email",
  "E-posta": "email",
  "Adres": "address",
  "Şehir": "city",
  "Sehir": "city",
  "Tür": "type",
  "Tur": "type",
  "Tip": "type",
};

function mapContactType(value: string): ContactType {
  const v = value.trim().toLowerCase();
  if (v === "müşteri" || v === "musteri" || v === "customer") return "customer";
  if (v === "her ikisi" || v === "both" || v === "ikisi") return "both";
  return "supplier";
}

export function parseContactCsv(text: string): {
  valid: ContactImportRow[];
  errors: ImportError[];
} {
  const { rows } = parseCsv(text);
  const valid: ContactImportRow[] = [];
  const errors: ImportError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const entry: ContactImportRow = {
      company_name: "",
      tax_id: null,
      tax_office: null,
      phone: null,
      email: null,
      address: null,
      city: null,
      type: "supplier",
    };

    for (const header of Object.keys(row)) {
      const field = COLUMN_MAP[header];
      if (!field) continue;
      const value = row[header];
      if (!value) continue;

      if (field === "type") {
        entry.type = mapContactType(value);
      } else {
        (entry as unknown as Record<string, string | null>)[field] = value;
      }
    }

    if (!entry.company_name) {
      errors.push({ row: rowNum, field: "Ad", message: "Firma adı zorunludur" });
      continue;
    }

    valid.push(entry);
  }

  return { valid, errors };
}

/** Check for duplicates by tax_id or company_name against existing contacts */
export function findDuplicates(
  rows: ContactImportRow[],
  existing: { company_name: string; tax_id: string | null }[]
): { unique: ContactImportRow[]; duplicates: ContactImportRow[] } {
  const existingNames = new Set(existing.map((c) => c.company_name.toLowerCase()));
  const existingTaxIds = new Set(
    existing.filter((c) => c.tax_id).map((c) => c.tax_id!.trim())
  );

  const unique: ContactImportRow[] = [];
  const duplicates: ContactImportRow[] = [];

  for (const row of rows) {
    const isDuplicate =
      (row.tax_id && existingTaxIds.has(row.tax_id.trim())) ||
      existingNames.has(row.company_name.toLowerCase());

    if (isDuplicate) {
      duplicates.push(row);
    } else {
      unique.push(row);
    }
  }

  return { unique, duplicates };
}

export const CONTACT_TEMPLATE_HEADERS = [
  "Ad", "Vergi No", "Vergi Dairesi", "Telefon", "Email", "Adres", "Şehir", "Tür",
];
