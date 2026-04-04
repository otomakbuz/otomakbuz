export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "needs_review"
  | "verified"
  | "archived"
  | "failed";

export type DocumentType =
  | "fatura"
  | "fis"
  | "makbuz"
  | "pos_slip"
  | "gider_fisi"
  | null;

export type PaymentMethod =
  | "nakit"
  | "kredi_karti"
  | "banka_karti"
  | "havale"
  | "diger"
  | null;

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  default_currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Tag {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
}

export interface Document {
  id: string;
  workspace_id: string;
  user_id: string;
  original_file_url: string;
  preview_file_url: string | null;
  file_type: string;
  document_type: DocumentType;
  supplier_name: string | null;
  supplier_tax_id: string | null;
  document_number: string | null;
  issue_date: string | null;
  issue_time: string | null;
  subtotal_amount: number | null;
  vat_amount: number | null;
  vat_rate: number | null;
  total_amount: number | null;
  currency: string;
  payment_method: PaymentMethod;
  category_id: string | null;
  notes: string | null;
  status: DocumentStatus;
  confidence_score: number | null;
  field_scores: Record<string, number> | null;
  raw_ocr_text: string | null;
  parsed_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  tags?: Tag[];
}

export interface DocumentTag {
  id: string;
  document_id: string;
  tag_id: string;
}

export interface AuditLog {
  id: string;
  document_id: string;
  user_id: string;
  action_type: "created" | "updated" | "verified" | "deleted" | "reprocessed";
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface DocumentFilters {
  search?: string;
  category_id?: string;
  document_type?: DocumentType;
  status?: DocumentStatus;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  tag_id?: string;
}

export interface DashboardStats {
  documents_this_month: number;
  total_expense_this_month: number;
  pending_review_count: number;
  category_distribution: { name: string; color: string; total: number }[];
  recent_documents: Document[];
}
