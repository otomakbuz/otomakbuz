export interface OcrFieldScore {
  supplier_name: number;
  supplier_tax_id: number;
  document_type: number;
  document_number: number;
  issue_date: number;
  issue_time: number;
  subtotal_amount: number;
  vat_amount: number;
  vat_rate: number;
  total_amount: number;
  currency: number;
  payment_method: number;
}

export interface OcrResult {
  supplier_name: string | null;
  supplier_tax_id: string | null;
  document_type: string | null;
  document_number: string | null;
  issue_date: string | null;
  issue_time: string | null;
  subtotal_amount: number | null;
  vat_amount: number | null;
  vat_rate: number | null;
  total_amount: number | null;
  currency: string;
  payment_method: string | null;
  raw_ocr_text: string;
  confidence_score: number;
  field_scores: Partial<OcrFieldScore>;
}

export interface OcrAdapter {
  processDocument(fileUrl: string, fileType: string): Promise<OcrResult>;
}
