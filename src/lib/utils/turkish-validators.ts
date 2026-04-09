/**
 * Türkiye'ye özel doğrulama fonksiyonları.
 * VKN, TCKN, KDV oranı, IBAN kontrolü.
 */

/** VKN (Vergi Kimlik Numarası) doğrulama — 10 haneli */
export function isValidVkn(vkn: string): boolean {
  const cleaned = vkn.replace(/\s/g, "");
  if (!/^\d{10}$/.test(cleaned)) return false;

  const digits = cleaned.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (digits[i] + (9 - i)) % 10;
    const val = (tmp * Math.pow(2, 9 - i)) % 9;
    sum += val === 0 && tmp !== 0 ? 9 : val;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[9];
}

/** TCKN (TC Kimlik Numarası) doğrulama — 11 haneli */
export function isValidTckn(tckn: string): boolean {
  const cleaned = tckn.replace(/\s/g, "");
  if (!/^\d{11}$/.test(cleaned)) return false;
  if (cleaned[0] === "0") return false;

  const digits = cleaned.split("").map(Number);

  // 10. hane kontrolü
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const check10 = (oddSum * 7 - evenSum) % 10;
  if (check10 !== digits[9]) return false;

  // 11. hane kontrolü
  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sumFirst10 % 10 !== digits[10]) return false;

  return true;
}

/** VKN veya TCKN otomatik algıla ve doğrula */
export function validateTaxId(taxId: string): { valid: boolean; type: "vkn" | "tckn" | "unknown"; message: string } {
  const cleaned = taxId.replace(/\s/g, "");

  if (cleaned.length === 10) {
    const valid = isValidVkn(cleaned);
    return { valid, type: "vkn", message: valid ? "Geçerli VKN" : "Geçersiz VKN" };
  }

  if (cleaned.length === 11) {
    const valid = isValidTckn(cleaned);
    return { valid, type: "tckn", message: valid ? "Geçerli TCKN" : "Geçersiz TCKN" };
  }

  return { valid: false, type: "unknown", message: "VKN (10 hane) veya TCKN (11 hane) olmalıdır" };
}

/** Geçerli Türk KDV oranları */
const VALID_VAT_RATES = [0, 1, 10, 20];

/** KDV oranı kontrolü */
export function isValidVatRate(rate: number): boolean {
  return VALID_VAT_RATES.includes(rate);
}

/** KDV oranı düzelt — yaygın OCR hatalarını yakala */
export function normalizeVatRate(rate: number | null): number | null {
  if (rate === null) return null;
  // Yaygın hatalar: %18 → %20 (2024 güncellemesi), %8 → %10
  if (rate === 18) return 20;
  if (rate === 8) return 10;
  if (VALID_VAT_RATES.includes(rate)) return rate;
  // En yakın geçerli orana yuvarla
  return VALID_VAT_RATES.reduce((prev, curr) =>
    Math.abs(curr - rate) < Math.abs(prev - rate) ? curr : prev
  );
}

/** Türk IBAN doğrulama — TR + 24 hane */
export function isValidTurkishIban(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  if (!/^TR\d{24}$/.test(cleaned)) return false;
  // Basit mod-97 kontrolü
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numStr = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let remainder = 0;
  for (const ch of numStr) {
    remainder = (remainder * 10 + parseInt(ch)) % 97;
  }
  return remainder === 1;
}

/** Belge türü tahmini — OCR metninden Türkçe anahtar kelimelere bakarak */
export function guessDocumentType(rawText: string): string | null {
  const text = rawText.toLowerCase();

  if (text.includes("e-fatura") || text.includes("efatura")) return "e_fatura";
  if (text.includes("e-arşiv") || text.includes("e-arsiv") || text.includes("earşiv")) return "e_arsiv";
  if (text.includes("serbest meslek makbuzu") || text.includes("smm")) return "serbest_meslek_makbuzu";
  if (text.includes("gider pusulası") || text.includes("gider pusulasi")) return "gider_pusulasi";
  if (text.includes("fatura no") || text.includes("fatura tarihi") || text.includes("irsaliye")) return "fatura";
  if (text.includes("fiş no") || text.includes("fis no") || text.includes("z raporu") || text.includes("ödeme kaydedici")) return "fis";

  return null;
}
