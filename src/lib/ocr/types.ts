export interface OcrFieldScore {
  // Düzenleyen
  supplier_name: number;
  supplier_tax_id: number;
  supplier_tax_office: number;
  supplier_address: number;
  // Alıcı
  buyer_name: number;
  buyer_tax_id: number;
  buyer_tax_office: number;
  buyer_address: number;
  // Belge meta
  document_type: number;
  document_number: number;
  issue_date: number;
  issue_time: number;
  waybill_number: number;
  // Tutarlar
  subtotal_amount: number;
  vat_amount: number;
  vat_rate: number;
  withholding_amount: number;
  total_amount: number;
  currency: number;
  payment_method: number;
  line_items: number;
}

export interface OcrLineItem {
  name: string;
  quantity: number;
  unit_price: number;
  vat_rate: number | null;
  total: number;
}

export interface OcrResult {
  // Düzenleyen (satıcı)
  supplier_name: string | null;
  supplier_tax_id: string | null;
  supplier_tax_office: string | null;
  supplier_address: string | null;
  // Alıcı (müşteri)
  buyer_name: string | null;
  buyer_tax_id: string | null;
  buyer_tax_office: string | null;
  buyer_address: string | null;
  // Belge meta
  document_type: string | null;
  document_number: string | null;
  issue_date: string | null;
  issue_time: string | null;
  waybill_number: string | null;
  // Tutarlar
  subtotal_amount: number | null;
  vat_amount: number | null;
  vat_rate: number | null;
  withholding_amount: number | null;
  total_amount: number | null;
  currency: string;
  payment_method: string | null;
  // Kalemler
  line_items: OcrLineItem[] | null;
  // Meta
  raw_ocr_text: string;
  confidence_score: number;
  field_scores: Partial<OcrFieldScore>;
}

/**
 * OCR sonucu — her zaman bir dizi döner.
 *
 * Tek belge içeren görsellerde dizi tek elemanlıdır. Bir fotoğrafta
 * birden fazla fiş/fatura varsa (ör. masadaki 5 fiş tek karede),
 * her biri ayrı eleman olur. Sıralama görsel soldan-sağa/yukarıdan-
 * aşağıya doğru yapılır.
 */
export interface OcrAdapter {
  processDocument(fileUrl: string, fileType: string): Promise<OcrResult[]>;
}
