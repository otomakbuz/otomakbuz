import { OcrAdapter, OcrResult, OcrLineItem } from "./types";
import type { DocumentType } from "@/types";

// Gerçek Türk firma verileri — faturalarda kullanılır
const MOCK_COMPANIES = [
  {
    name: "Migros Ticaret A.Ş.",
    tax_id: "6220084527",
    tax_office: "Büyük Mükellefler",
    address: "Atatürk Mah. Turgut Özal Bulvarı No:7, Ataşehir / İstanbul",
  },
  {
    name: "Opet Petrolcülük A.Ş.",
    tax_id: "6330005874",
    tax_office: "Büyük Mükellefler",
    address: "Kısıklı Cad. No:4, Altunizade, Üsküdar / İstanbul",
  },
  {
    name: "Trendyol Grup Bilişim A.Ş.",
    tax_id: "8590492516",
    tax_office: "Boğaziçi Kurumlar",
    address: "Küçükbakkalköy Mah. Kayışdağı Cad. No:1, Ataşehir / İstanbul",
  },
  {
    name: "BİM Birleşik Mağazalar A.Ş.",
    tax_id: "1790017875",
    tax_office: "Büyük Mükellefler",
    address: "Ebubekir Cad. No:73, Sancaktepe / İstanbul",
  },
  {
    name: "Shell & Turcas Petrol A.Ş.",
    tax_id: "7750044448",
    tax_office: "Boğaziçi Kurumlar",
    address: "Karamancılar İş Merkezi, Bayar Cad., Kozyatağı / İstanbul",
  },
  {
    name: "Hepsiburada D.Y. Pazarlama A.Ş.",
    tax_id: "2150471458",
    tax_office: "Boğaziçi Kurumlar",
    address: "Kuştepe Mah. Mecidiyeköy Yolu Cad. No:12, Şişli / İstanbul",
  },
];

// Serbest meslek erbabı mock verisi
const MOCK_FREELANCERS = [
  {
    name: "Av. Mehmet Yılmaz",
    tax_id: "12345678901",
    tax_office: "Beşiktaş",
    address: "Abbasağa Mah. Yıldız Posta Cad. No:15/3, Beşiktaş / İstanbul",
  },
  {
    name: "SMMM Ayşe Kaya",
    tax_id: "23456789012",
    tax_office: "Kadıköy",
    address: "Caferağa Mah. Moda Cad. No:42/5, Kadıköy / İstanbul",
  },
  {
    name: "Dr. Ali Demir",
    tax_id: "34567890123",
    tax_office: "Şişli",
    address: "Merkez Mah. Halaskargazi Cad. No:88/12, Şişli / İstanbul",
  },
];

// Alıcı (müşteri) firmaları — normalde workspace sahibinin bilgileri olur
const MOCK_BUYERS = [
  {
    name: "Otomakbuz Teknoloji A.Ş.",
    tax_id: "9876543210",
    tax_office: "Mecidiyeköy",
    address: "Gayrettepe Mah. Barbaros Bulvarı No:145, Beşiktaş / İstanbul",
  },
];

const MOCK_PAYMENT_METHODS = ["nakit", "kredi_karti", "banka_karti", "havale"];

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

function randomDocNumber(prefix = ""): string {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${prefix}${letter}${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Rastgele kalem listesi üretir. Fatura ve müstahsil için kullanılır.
 */
function generateLineItems(count: number, vatRate: number): { items: OcrLineItem[]; subtotal: number } {
  const productNames = [
    "Ofis malzemesi",
    "Danışmanlık hizmeti",
    "Yazılım lisansı",
    "Bilgisayar ekipmanı",
    "Kırtasiye",
    "Temizlik malzemesi",
    "İkram ve gıda",
    "Nakliye hizmeti",
    "Baskı hizmeti",
    "Yedek parça",
  ];
  const items: OcrLineItem[] = [];
  let subtotal = 0;
  for (let i = 0; i < count; i++) {
    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = randomBetween(50, 500);
    const total = Math.round(quantity * unitPrice * 100) / 100;
    items.push({
      name: pick(productNames),
      quantity,
      unit_price: unitPrice,
      vat_rate: vatRate,
      total,
    });
    subtotal += total;
  }
  return { items, subtotal: Math.round(subtotal * 100) / 100 };
}

// Belge türüne göre mock OCR üretimi
function generateForType(docType: NonNullable<DocumentType>): OcrResult {
  const vatRate = pick([1, 8, 10, 18, 20] as const);

  switch (docType) {
    case "fatura": {
      const supplier = pick(MOCK_COMPANIES);
      const buyer = pick(MOCK_BUYERS);
      const { items, subtotal } = generateLineItems(Math.floor(Math.random() * 4) + 1, vatRate);
      const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
      const total = Math.round((subtotal + vatAmount) * 100) / 100;
      const docNumber = randomDocNumber("FTR");
      const date = randomDate();

      return {
        supplier_name: supplier.name,
        supplier_tax_id: supplier.tax_id,
        supplier_tax_office: supplier.tax_office,
        supplier_address: supplier.address,
        buyer_name: buyer.name,
        buyer_tax_id: buyer.tax_id,
        buyer_tax_office: buyer.tax_office,
        buyer_address: buyer.address,
        document_type: "fatura",
        document_number: docNumber,
        issue_date: date,
        issue_time: null,
        waybill_number: Math.random() > 0.7 ? randomDocNumber("IRS") : null,
        subtotal_amount: subtotal,
        vat_amount: vatAmount,
        vat_rate: vatRate,
        withholding_amount: null,
        total_amount: total,
        currency: "TRY",
        payment_method: pick(MOCK_PAYMENT_METHODS),
        line_items: items,
        raw_ocr_text: [
          `FATURA`,
          `${supplier.name}`,
          `VKN: ${supplier.tax_id} — ${supplier.tax_office}`,
          supplier.address,
          ``,
          `Sayın: ${buyer.name}`,
          `VKN: ${buyer.tax_id}`,
          ``,
          `Fatura No: ${docNumber}`,
          `Tarih: ${date}`,
          ``,
          ...items.map((i) => `${i.name} x${i.quantity} @ ${i.unit_price.toFixed(2)} = ${i.total.toFixed(2)}`),
          ``,
          `Ara Toplam: ${subtotal.toFixed(2)} TL`,
          `KDV (%${vatRate}): ${vatAmount.toFixed(2)} TL`,
          `GENEL TOPLAM: ${total.toFixed(2)} TL`,
        ].join("\n"),
        confidence_score: 0,
        field_scores: {},
      };
    }

    case "perakende_fis": {
      const supplier = pick(MOCK_COMPANIES);
      const subtotal = randomBetween(10, 500);
      const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
      const total = Math.round((subtotal + vatAmount) * 100) / 100;
      const docNumber = randomDocNumber("FIS");
      const date = randomDate();
      const time = randomTime();

      return {
        supplier_name: supplier.name,
        supplier_tax_id: supplier.tax_id,
        supplier_tax_office: supplier.tax_office,
        supplier_address: supplier.address,
        buyer_name: null,
        buyer_tax_id: null,
        buyer_tax_office: null,
        buyer_address: null,
        document_type: "perakende_fis",
        document_number: docNumber,
        issue_date: date,
        issue_time: time,
        waybill_number: null,
        subtotal_amount: subtotal,
        vat_amount: vatAmount,
        vat_rate: vatRate,
        withholding_amount: null,
        total_amount: total,
        currency: "TRY",
        payment_method: pick(["nakit", "kredi_karti", "banka_karti"]),
        line_items: null,
        raw_ocr_text: [
          supplier.name,
          `VKN: ${supplier.tax_id}`,
          `${date} ${time}`,
          `Fis No: ${docNumber}`,
          `KDV%${vatRate}: ${vatAmount.toFixed(2)}`,
          `TOPLAM: ${total.toFixed(2)} TL`,
        ].join("\n"),
        confidence_score: 0,
        field_scores: {},
      };
    }

    case "serbest_meslek_makbuzu": {
      const freelancer = pick(MOCK_FREELANCERS);
      const buyer = pick(MOCK_BUYERS);
      const brut = randomBetween(500, 5000);
      // Stopaj oranı SMM'de genelde %20
      const stopajRate = 20;
      const stopajAmount = Math.round(brut * (stopajRate / 100) * 100) / 100;
      // KDV SMM'de %20
      const smmVatRate = 20;
      const vatAmount = Math.round(brut * (smmVatRate / 100) * 100) / 100;
      const netOdenen = Math.round((brut + vatAmount - stopajAmount) * 100) / 100;
      const docNumber = randomDocNumber("SMM");
      const date = randomDate();

      return {
        supplier_name: freelancer.name,
        supplier_tax_id: freelancer.tax_id,
        supplier_tax_office: freelancer.tax_office,
        supplier_address: freelancer.address,
        buyer_name: buyer.name,
        buyer_tax_id: buyer.tax_id,
        buyer_tax_office: null,
        buyer_address: buyer.address,
        document_type: "serbest_meslek_makbuzu",
        document_number: docNumber,
        issue_date: date,
        issue_time: null,
        waybill_number: null,
        subtotal_amount: brut,
        vat_amount: vatAmount,
        vat_rate: smmVatRate,
        withholding_amount: stopajAmount,
        total_amount: netOdenen,
        currency: "TRY",
        payment_method: pick(["havale", "kredi_karti"]),
        line_items: null,
        raw_ocr_text: [
          `SERBEST MESLEK MAKBUZU`,
          `${freelancer.name}`,
          `VKN: ${freelancer.tax_id} — ${freelancer.tax_office}`,
          freelancer.address,
          ``,
          `Sayın: ${buyer.name}`,
          `Adres: ${buyer.address}`,
          ``,
          `Makbuz No: ${docNumber}`,
          `Tarih: ${date}`,
          ``,
          `Brüt Tutar: ${brut.toFixed(2)} TL`,
          `KDV (%${smmVatRate}): ${vatAmount.toFixed(2)} TL`,
          `Stopaj (%${stopajRate}): ${stopajAmount.toFixed(2)} TL`,
          `NET ÖDENEN: ${netOdenen.toFixed(2)} TL`,
        ].join("\n"),
        confidence_score: 0,
        field_scores: {},
      };
    }

    case "gider_pusulasi": {
      const buyer = pick(MOCK_BUYERS); // işi yaptıran
      const seller = {
        name: pick(["Mustafa Kara", "Fatma Çelik", "Hasan Aydın", "Elif Şahin"]),
        tax_id: `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
        address: pick([
          "Merkez Mah. Atatürk Cad. No:15, Beyoğlu / İstanbul",
          "Yeni Mah. İnönü Sok. No:8, Üsküdar / İstanbul",
          "Cumhuriyet Mah. Barış Cad. No:22, Kadıköy / İstanbul",
        ]),
      };
      const brut = randomBetween(200, 3000);
      // Gider pusulasında stopaj genelde %10
      const stopajRate = 10;
      const stopajAmount = Math.round(brut * (stopajRate / 100) * 100) / 100;
      const net = Math.round((brut - stopajAmount) * 100) / 100;
      const docNumber = randomDocNumber("GP");
      const date = randomDate();

      return {
        supplier_name: seller.name,
        supplier_tax_id: seller.tax_id,
        supplier_tax_office: null,
        supplier_address: seller.address,
        buyer_name: buyer.name,
        buyer_tax_id: buyer.tax_id,
        buyer_tax_office: buyer.tax_office,
        buyer_address: buyer.address,
        document_type: "gider_pusulasi",
        document_number: docNumber,
        issue_date: date,
        issue_time: null,
        waybill_number: null,
        subtotal_amount: brut,
        vat_amount: null,
        vat_rate: null,
        withholding_amount: stopajAmount,
        total_amount: net,
        currency: "TRY",
        payment_method: pick(["nakit", "havale"]),
        line_items: null,
        raw_ocr_text: [
          `GİDER PUSULASI`,
          `Düzenleyen: ${buyer.name}`,
          `VKN: ${buyer.tax_id}`,
          ``,
          `Satan: ${seller.name}`,
          `TCKN: ${seller.tax_id}`,
          seller.address,
          ``,
          `Pusula No: ${docNumber}`,
          `Tarih: ${date}`,
          ``,
          `Brüt Tutar: ${brut.toFixed(2)} TL`,
          `Stopaj (%${stopajRate}): ${stopajAmount.toFixed(2)} TL`,
          `NET ÖDENEN: ${net.toFixed(2)} TL`,
        ].join("\n"),
        confidence_score: 0,
        field_scores: {},
      };
    }

    default: {
      // Fallback — fatura gibi davran
      return generateForType("fatura");
    }
  }
}

function computeFieldScores(result: OcrResult): OcrResult {
  const scores: Record<string, number> = {};
  for (const key of Object.keys(result)) {
    if (key === "raw_ocr_text" || key === "confidence_score" || key === "field_scores") continue;
    const value = (result as unknown as Record<string, unknown>)[key];
    if (value !== null && value !== undefined) {
      scores[key] = randomScore();
    }
  }
  const values = Object.values(scores);
  const overall = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return {
    ...result,
    field_scores: scores,
    confidence_score: overall,
  };
}

// MVP'de desteklenen belge türleri (ağırlıklı — fatura ve fiş daha sık)
const WEIGHTED_TYPES: NonNullable<DocumentType>[] = [
  "fatura",
  "fatura",
  "fatura",
  "perakende_fis",
  "perakende_fis",
  "perakende_fis",
  "perakende_fis",
  "serbest_meslek_makbuzu",
  "gider_pusulasi",
];

export class MockOcrAdapter implements OcrAdapter {
  async processDocument(_fileUrl: string, _fileType: string): Promise<OcrResult> {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 300));
    const docType = pick(WEIGHTED_TYPES);
    const result = generateForType(docType);
    return computeFieldScores(result);
  }
}
