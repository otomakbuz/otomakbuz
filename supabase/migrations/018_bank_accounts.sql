-- 018_bank_accounts.sql
-- Banka hesapları ve banka hareketleri (mutabakat) tabloları

-- ─── bank_accounts ───
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  iban TEXT,
  currency TEXT DEFAULT 'TRY',
  current_balance NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_accounts_select" ON bank_accounts
  FOR SELECT USING (workspace_id = get_user_workspace_id());

CREATE POLICY "bank_accounts_insert" ON bank_accounts
  FOR INSERT WITH CHECK (workspace_id = get_user_workspace_id());

CREATE POLICY "bank_accounts_update" ON bank_accounts
  FOR UPDATE USING (workspace_id = get_user_workspace_id());

CREATE POLICY "bank_accounts_delete" ON bank_accounts
  FOR DELETE USING (workspace_id = get_user_workspace_id());

-- ─── bank_transactions ───
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  value_date DATE,
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL, -- positive = income, negative = expense
  balance_after NUMERIC(15,2),
  reference_no TEXT,
  matched_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  match_confidence NUMERIC(5,2), -- 0-100
  match_status TEXT DEFAULT 'unmatched' CHECK (match_status IN ('unmatched','matched','manual','ignored')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_transactions_select" ON bank_transactions
  FOR SELECT USING (workspace_id = get_user_workspace_id());

CREATE POLICY "bank_transactions_insert" ON bank_transactions
  FOR INSERT WITH CHECK (workspace_id = get_user_workspace_id());

CREATE POLICY "bank_transactions_update" ON bank_transactions
  FOR UPDATE USING (workspace_id = get_user_workspace_id());

CREATE POLICY "bank_transactions_delete" ON bank_transactions
  FOR DELETE USING (workspace_id = get_user_workspace_id());

-- ─── Indexes ───
CREATE INDEX idx_bank_transactions_account ON bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX idx_bank_transactions_status ON bank_transactions(match_status);
CREATE INDEX idx_bank_transactions_document ON bank_transactions(matched_document_id);
CREATE INDEX idx_bank_accounts_workspace ON bank_accounts(workspace_id);
