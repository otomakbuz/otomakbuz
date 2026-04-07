import type { BankStatementRow } from "@/types";

/**
 * Türk bankalarından gelen CSV/TSV ekstre dosyalarını parse eder.
 * Desteklenen formatlar: İş Bankası, Garanti, Yapı Kredi, Akbank, Ziraat, genel format.
 */

// ─── Helpers ───

/** Türkçe sayı formatını (1.234,56) standart float'a çevirir */
function parseTurkishNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.trim().replace(/\s/g, "");
  // Remove thousand separators (dots) and replace decimal comma with dot
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

/** Türkçe tarih formatlarını YYYY-MM-DD'ye çevirir */
function parseTurkishDate(raw: string): string {
  const trimmed = raw.trim();

  // DD.MM.YYYY or DD/MM/YYYY
  const match = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // YYYY-MM-DD (already ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // DD-MM-YYYY
  const match2 = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match2) {
    const [, d, m, y] = match2;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return trimmed; // fallback
}

/** CSV satırını delimiter'a göre böler (tırnak içi delimiter'ları yok sayar) */
function splitCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      fields.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim().replace(/^"|"$/g, ""));
  return fields;
}

/** Hangi delimiter kullanıldığını otomatik algıla */
function detectDelimiter(lines: string[]): string {
  const sample = lines.slice(0, 5).join("\n");
  const tabCount = (sample.match(/\t/g) || []).length;
  const semicolonCount = (sample.match(/;/g) || []).length;
  const commaCount = (sample.match(/,/g) || []).length;

  if (tabCount > semicolonCount && tabCount > commaCount) return "\t";
  if (semicolonCount > commaCount) return ";";
  return ",";
}

// ─── Column mapping ───

interface ColumnMap {
  date: number;
  valueDate?: number;
  description: number;
  amount: number; // single amount column (+ / -)
  debit?: number; // ayrı borç kolonu
  credit?: number; // ayrı alacak kolonu
  balance?: number;
  reference?: number;
}

/** Header satırından kolon eşleştirmesi yap */
function detectColumns(headers: string[]): ColumnMap | null {
  const lower = headers.map((h) => h.toLowerCase().replace(/[ıİ]/g, "i").replace(/[şŞ]/g, "s").replace(/[çÇ]/g, "c").replace(/[öÖ]/g, "o").replace(/[üÜ]/g, "u").replace(/[ğĞ]/g, "g"));

  let date = -1, valueDate = -1, description = -1, amount = -1, debit = -1, credit = -1, balance = -1, reference = -1;

  for (let i = 0; i < lower.length; i++) {
    const h = lower[i];
    // Tarih
    if (date === -1 && (h.includes("tarih") || h.includes("date") || h === "islem tarihi" || h === "islem_tarihi")) date = i;
    // Valör / value date
    if (valueDate === -1 && (h.includes("valor") || h.includes("valur") || h.includes("value date") || h.includes("valör"))) valueDate = i;
    // Açıklama
    if (description === -1 && (h.includes("aciklama") || h.includes("description") || h.includes("islem aciklamasi") || h.includes("acklama"))) description = i;
    // Tutar (tek kolon)
    if (amount === -1 && (h === "tutar" || h === "amount" || h === "islem tutari" || h === "miktar")) amount = i;
    // Borç
    if (debit === -1 && (h.includes("borc") || h === "debit" || h.includes("cikan") || h.includes("gider"))) debit = i;
    // Alacak
    if (credit === -1 && (h.includes("alacak") || h === "credit" || h.includes("giren") || h.includes("gelir"))) credit = i;
    // Bakiye
    if (balance === -1 && (h.includes("bakiye") || h.includes("balance") || h.includes("kalan"))) balance = i;
    // Referans
    if (reference === -1 && (h.includes("referans") || h.includes("ref") || h.includes("dekont") || h.includes("islem no"))) reference = i;
  }

  // Eğer açıklama bulunamadıysa, tarih'ten sonraki ilk metin kolonu dene
  if (date === -1) return null;
  if (description === -1) {
    // Tarih'ten sonraki ilk text kolon
    for (let i = 0; i < headers.length; i++) {
      if (i !== date && i !== amount && i !== debit && i !== credit && i !== balance && i !== reference && i !== valueDate) {
        description = i;
        break;
      }
    }
  }
  if (description === -1) return null;
  if (amount === -1 && debit === -1 && credit === -1) return null;

  const map: ColumnMap = { date, description, amount };
  if (valueDate !== -1) map.valueDate = valueDate;
  if (debit !== -1) map.debit = debit;
  if (credit !== -1) map.credit = credit;
  if (balance !== -1) map.balance = balance;
  if (reference !== -1) map.reference = reference;

  return map;
}

// ─── Main parser ───

export function parseBankStatement(csvContent: string): BankStatementRow[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines);

  // İlk birkaç satırı tara; header olmayan satırları atla (bazı bankalar meta satır ekler)
  let headerIdx = -1;
  let columns: ColumnMap | null = null;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const fields = splitCsvLine(lines[i], delimiter);
    const attempt = detectColumns(fields);
    if (attempt) {
      headerIdx = i;
      columns = attempt;
      break;
    }
  }

  if (headerIdx === -1 || !columns) {
    // Fallback: ilk satırı header say, sıralı kolon varsay
    headerIdx = 0;
    const fields = splitCsvLine(lines[0], delimiter);
    if (fields.length >= 3) {
      columns = { date: 0, description: 1, amount: 2, balance: fields.length >= 4 ? 3 : undefined };
    } else {
      return [];
    }
  }

  const rows: BankStatementRow[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i], delimiter);
    if (fields.length < 3) continue;

    const dateRaw = fields[columns.date];
    if (!dateRaw || !/\d/.test(dateRaw)) continue; // tarih içermeyen satırları atla

    const transactionDate = parseTurkishDate(dateRaw);
    const description = fields[columns.description] || "";

    let amount = 0;
    if (columns.debit !== undefined && columns.credit !== undefined) {
      const debitVal = parseTurkishNumber(fields[columns.debit] || "");
      const creditVal = parseTurkishNumber(fields[columns.credit] || "");
      amount = creditVal > 0 ? creditVal : -debitVal;
    } else {
      amount = parseTurkishNumber(fields[columns.amount] || "");
    }

    if (amount === 0 && !description) continue;

    const row: BankStatementRow = {
      transaction_date: transactionDate,
      description,
      amount,
    };

    if (columns.valueDate !== undefined && fields[columns.valueDate]) {
      row.value_date = parseTurkishDate(fields[columns.valueDate]);
    }
    if (columns.balance !== undefined && fields[columns.balance]) {
      row.balance_after = parseTurkishNumber(fields[columns.balance]);
    }
    if (columns.reference !== undefined && fields[columns.reference]) {
      row.reference_no = fields[columns.reference];
    }

    rows.push(row);
  }

  return rows;
}
