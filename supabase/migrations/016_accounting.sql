-- Hesap planı
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('asset','liability','equity','expense','income')),
  parent_code text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, code)
);

-- Yevmiye defteri
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
  entry_number serial,
  entry_date date NOT NULL,
  description text,
  is_posted boolean DEFAULT false,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries ON DELETE CASCADE,
  account_code text NOT NULL,
  debit_amount numeric(12,2) DEFAULT 0,
  credit_amount numeric(12,2) DEFAULT 0,
  description text,
  document_id uuid REFERENCES documents
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_workspace ON accounts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_je_workspace ON journal_entries(workspace_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_jl_entry ON journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jl_account ON journal_lines(account_code);

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY accounts_workspace ON accounts
  FOR ALL USING (workspace_id = get_user_workspace_id());

CREATE POLICY je_workspace ON journal_entries
  FOR ALL USING (workspace_id = get_user_workspace_id());

CREATE POLICY jl_workspace ON journal_lines
  FOR ALL USING (
    journal_entry_id IN (
      SELECT id FROM journal_entries WHERE workspace_id = get_user_workspace_id()
    )
  );

-- Mizan RPC
CREATE OR REPLACE FUNCTION get_trial_balance(p_date date DEFAULT current_date)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    FROM (
      SELECT a.code, a.name, a.account_type,
        COALESCE(SUM(jl.debit_amount), 0)::numeric(12,2) as total_debit,
        COALESCE(SUM(jl.credit_amount), 0)::numeric(12,2) as total_credit,
        (COALESCE(SUM(jl.debit_amount), 0) - COALESCE(SUM(jl.credit_amount), 0))::numeric(12,2) as balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON jl.account_code = a.code
        AND jl.journal_entry_id IN (
          SELECT id FROM journal_entries
          WHERE workspace_id = get_user_workspace_id()
            AND entry_date <= p_date AND is_posted = true
        )
      WHERE a.workspace_id = get_user_workspace_id() AND a.is_active = true
      GROUP BY a.code, a.name, a.account_type
      HAVING COALESCE(SUM(jl.debit_amount), 0) > 0 OR COALESCE(SUM(jl.credit_amount), 0) > 0
      ORDER BY a.code
    ) t
  );
END;
$$;
