export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "needs_review"
  | "verified"
  | "archived"
  | "failed";

export type EInvoiceStatus = "draft" | "sent" | "delivered" | "rejected";

export interface CompanyInfo {
  company_tax_id: string | null;
  company_tax_office: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
}

// ─── Muhasebe ───

export type AccountType = "asset" | "liability" | "equity" | "expense" | "income";

export interface Account {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  account_type: AccountType;
  parent_code: string | null;
  is_active: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  workspace_id: string;
  entry_number: number;
  entry_date: string;
  description: string | null;
  is_posted: boolean;
  created_by: string;
  created_at: string;
}

export interface JournalLine {
  id: string;
  journal_entry_id: string;
  account_code: string;
  debit_amount: number;
  credit_amount: number;
  description: string | null;
  document_id: string | null;
}

export interface TrialBalanceRow {
  code: string;
  name: string;
  account_type: AccountType;
  total_debit: number;
  total_credit: number;
  balance: number;
}

// ─── Stok Yönetimi ───

export type MovementType = "purchase" | "sale" | "adjustment" | "return";

export interface Product {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  unit: string;
  current_quantity: number;
  reorder_level: number;
  unit_cost: number;
  unit_price: number;
  category: string | null;
  supplier_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  workspace_id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost: number | null;
  reference_note: string | null;
  document_id: string | null;
  movement_date: string;
  created_at: string;
  product?: Product;
}

export interface InventorySummaryRow {
  id: string;
  code: string;
  name: string;
  unit: string;
  current_quantity: number;
  unit_cost: number;
  unit_price: number;
  reorder_level: number;
  category: string | null;
  stock_value: number;
  below_reorder: boolean;
}

/**
 * Türk vergi mevzuatına göre belge türleri (VUK 229-234).
 * MVP: fatura, perakende_fis, serbest_meslek_makbuzu, gider_pusulasi
 * Faz 2: mustahsil_makbuzu, irsaliye
 */
export type DocumentType =
  | "fatura" // Fatura / e-Fatura / e-Arşiv Fatura (VUK 229-232)
  | "perakende_fis" // Perakende satış fişi / ÖKC fişi / POS fişi (VUK 233)
  | "serbest_meslek_makbuzu" // Serbest Meslek Makbuzu / e-SMM (VUK 236-237)
  | "gider_pusulasi" // Gider Pusulası / e-Gider Pusulası (VUK 234)
  | "mustahsil_makbuzu" // Müstahsil Makbuzu / e-Müstahsil (VUK 235)
  | "irsaliye" // Sevk irsaliyesi / e-İrsaliye (VUK 230)
  | null;

export interface DocumentLineItem {
  name: string;
  quantity: number;
  unit_price: number;
  vat_rate: number | null;
  total: number;
}

export type PaymentMethod =
  | "nakit"
  | "kredi_karti"
  | "banka_karti"
  | "havale"
  | "diger"
  | null;

export type DocumentDirection = "income" | "expense";

export type ContactType = "supplier" | "customer" | "both";

export interface Contact {
  id: string;
  workspace_id: string;
  type: ContactType;
  company_name: string;
  tax_id: string | null;
  tax_office: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  persons?: ContactPerson[];
  stats?: ContactStats;
}

export interface ContactPerson {
  id: string;
  contact_id: string;
  full_name: string;
  title: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface ContactStats {
  document_count: number;
  total_amount: number;
  last_document_date: string | null;
}

export interface ContactFilters {
  search?: string;
  type?: ContactType;
  is_active?: boolean;
  city?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export type OcrProvider = "mock" | "openai" | "openrouter" | "anthropic" | "google";

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  default_currency: string;
  ocr_provider: OcrProvider;
  ocr_api_key: string | null;
  ocr_model: string | null;
  created_at: string;
}

export interface OcrSettingsView {
  provider: OcrProvider;
  model: string | null;
  has_key: boolean;
  masked_key: string | null;
}

export type WorkspaceRole = "owner" | "editor" | "viewer";

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  invited_by: string | null;
  joined_at: string;
  // Joined
  email?: string;
  full_name?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
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
  // Düzenleyen (satıcı)
  supplier_name: string | null;
  supplier_tax_id: string | null;
  supplier_tax_office: string | null;
  supplier_address: string | null;
  // Alıcı (müşteri) — bazı belge türlerinde nullable
  buyer_name: string | null;
  buyer_tax_id: string | null;
  buyer_tax_office: string | null;
  buyer_address: string | null;
  // Belge meta
  document_number: string | null;
  issue_date: string | null;
  issue_time: string | null;
  waybill_number: string | null;
  // Tutarlar
  subtotal_amount: number | null;
  vat_amount: number | null;
  vat_rate: number | null;
  withholding_amount: number | null; // stopaj
  total_amount: number | null;
  currency: string;
  payment_method: PaymentMethod;
  // Kalemler
  line_items: DocumentLineItem[] | null;
  category_id: string | null;
  contact_id: string | null;
  direction: DocumentDirection;
  notes: string | null;
  status: DocumentStatus;
  confidence_score: number | null;
  field_scores: Record<string, number> | null;
  raw_ocr_text: string | null;
  parsed_json: Record<string, unknown> | null;
  // E-Fatura
  e_invoice_status: EInvoiceStatus | null;
  e_invoice_uuid: string | null;
  // Tekilleştirme — SHA-256 hex, workspace içinde unique
  file_hash: string | null;
  // Çoklu-fiş fotoğrafında 0-tabanlı sıra (tek belgede 0)
  sub_index: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  contact?: Contact | null;
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
  direction?: DocumentDirection;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  tag_id?: string;
}

export type LedgerEntryType = "debit" | "credit";

export interface LedgerEntry {
  id: string;
  workspace_id: string;
  contact_id: string;
  document_id: string | null;
  entry_type: LedgerEntryType;
  amount: number;
  currency: string;
  description: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  document?: Document;
}

export interface ContactBalance {
  contact_id: string;
  company_name: string;
  contact_type: string;
  total_debit: number;
  total_credit: number;
  balance: number;
  entry_count: number;
  last_entry_date: string | null;
}

export interface BalanceSummary {
  debit: number;
  credit: number;
  balance: number;
}

export type PatternFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

export interface RecurringPattern {
  id: string;
  workspace_id: string;
  contact_id: string;
  pattern_name: string;
  avg_amount: number;
  min_amount: number | null;
  max_amount: number | null;
  frequency: PatternFrequency;
  last_occurrence: string | null;
  next_expected: string | null;
  occurrence_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_name?: string;
}

export type ReminderType = "payment" | "upload" | "review" | "custom";
export type RecurrenceRule = "weekly" | "monthly" | "yearly";

export interface Reminder {
  id: string;
  workspace_id: string;
  user_id: string;
  document_id: string | null;
  contact_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  reminder_type: ReminderType;
  is_completed: boolean;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  contact_name?: string;
  document_name?: string;
}

export interface DashboardStats {
  documents_this_month: number;
  total_expense_this_month: number;
  total_income_this_month: number;
  net_this_month: number;
  pending_review_count: number;
  category_distribution: { name: string; color: string; total: number }[];
  recent_documents: Document[];
}

// Report types
export interface MonthlyTrend {
  month: string;
  label: string;
  expense: number;
  income: number;
  net: number;
}

export interface SupplierRanking {
  contact_id: string;
  company_name: string;
  document_count: number;
  total_amount: number;
  avg_amount: number;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  color: string;
  document_count: number;
  total_amount: number;
  percentage: number;
}

export interface CashflowProjection {
  month: string;
  label: string;
  projected_expense: number;
  actual_expense: number;
  actual_income: number;
}

export interface YearlySummary {
  year: number;
  expense: number;
  income: number;
  net: number;
  document_count: number;
}

// ─── Finansal Raporlar ───

export interface VatSummary {
  month: number;
  year: number;
  salesVat: number;
  purchaseVat: number;
  netPayable: number;
  documentCount: number;
  byRate: { rate: number; base: number; vat: number; count: number }[];
}

export interface IncomeStatementData {
  totalIncome: number;
  totalExpense: number;
  grossProfit: number;
  totalVat: number;
  netProfit: number;
  expenseBreakdown: { category: string; amount: number }[];
}

export interface BalanceSheetData {
  assets: { code: string; name: string; balance: number }[];
  liabilities: { code: string; name: string; balance: number }[];
  equity: { code: string; name: string; balance: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}
