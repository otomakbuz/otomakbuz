import { OcrAdapter, OcrResult } from "./types";

const MOCK_SUPPLIERS = [
  { name: "Migros Ticaret A.S.", tax_id: "1234567890" },
  { name: "Opet Petrolculuk A.S.", tax_id: "9876543210" },
  { name: "Trendyol Express", tax_id: "5678901234" },
  { name: "Hilton Istanbul Bosphorus", tax_id: "3456789012" },
  { name: "Hepsiburada", tax_id: "7890123456" },
  { name: "Yemeksepeti", tax_id: "2345678901" },
  { name: "BIM Birlesik Magazalar", tax_id: "4567890123" },
  { name: "Shell Turkiye", tax_id: "6789012345" },
  { name: "Starbucks Coffee Turkey", tax_id: "8901234567" },
  { name: "Aras Kargo", tax_id: "0123456789" },
];

const MOCK_DOCUMENT_TYPES = ["fatura", "fis", "makbuz", "pos_slip", "gider_fisi"];
const MOCK_PAYMENT_METHODS = ["nakit", "kredi_karti", "banka_karti"];

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomScore(): number {
  return Math.round(Math.random() * 40 + 60);
}

function randomDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
}

function randomTime(): string {
  const hours = String(Math.floor(Math.random() * 14) + 8).padStart(2, "0");
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export class MockOcrAdapter implements OcrAdapter {
  async processDocument(_fileUrl: string, _fileType: string): Promise<OcrResult> {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 300));

    const supplier = MOCK_SUPPLIERS[Math.floor(Math.random() * MOCK_SUPPLIERS.length)];
    const docType = MOCK_DOCUMENT_TYPES[Math.floor(Math.random() * MOCK_DOCUMENT_TYPES.length)];
    const payment = MOCK_PAYMENT_METHODS[Math.floor(Math.random() * MOCK_PAYMENT_METHODS.length)];
    const subtotal = randomBetween(10, 2000);
    const vatRate = [1, 8, 10, 18, 20][Math.floor(Math.random() * 5)];
    const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    const docNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;

    const fieldScores = {
      supplier_name: randomScore(),
      supplier_tax_id: randomScore(),
      document_type: randomScore(),
      document_number: randomScore(),
      issue_date: randomScore(),
      issue_time: randomScore(),
      subtotal_amount: randomScore(),
      vat_amount: randomScore(),
      vat_rate: randomScore(),
      total_amount: randomScore(),
      currency: 99,
      payment_method: randomScore(),
    };

    const overallScore = Math.round(
      Object.values(fieldScores).reduce((a, b) => a + b, 0) / Object.values(fieldScores).length
    );

    const rawText = [
      supplier.name,
      `Vergi No: ${supplier.tax_id}`,
      `Tarih: ${randomDate()}`,
      `Belge No: ${docNumber}`,
      `Ara Toplam: ${subtotal.toFixed(2)} TL`,
      `KDV (%${vatRate}): ${vatAmount.toFixed(2)} TL`,
      `TOPLAM: ${total.toFixed(2)} TL`,
      `Odeme: ${payment}`,
    ].join("\n");

    return {
      supplier_name: supplier.name,
      supplier_tax_id: supplier.tax_id,
      document_type: docType,
      document_number: docNumber,
      issue_date: randomDate(),
      issue_time: randomTime(),
      subtotal_amount: subtotal,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      total_amount: total,
      currency: "TRY",
      payment_method: payment,
      raw_ocr_text: rawText,
      confidence_score: overallScore,
      field_scores: fieldScores,
    };
  }
}
