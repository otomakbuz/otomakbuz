-- Invoice sequence numbering per workspace per year
CREATE TABLE IF NOT EXISTS invoice_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  prefix TEXT NOT NULL DEFAULT 'OTM',
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  UNIQUE(workspace_id, prefix, year)
);

ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_sequences_select" ON invoice_sequences
  FOR SELECT USING (workspace_id = get_user_workspace_id());

CREATE POLICY "invoice_sequences_insert" ON invoice_sequences
  FOR INSERT WITH CHECK (workspace_id = get_user_workspace_id());

CREATE POLICY "invoice_sequences_update" ON invoice_sequences
  FOR UPDATE USING (workspace_id = get_user_workspace_id());

-- Function to get next invoice number (atomic upsert)
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_prefix TEXT DEFAULT 'OTM')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workspace_id UUID;
  v_year INTEGER;
  v_next INTEGER;
BEGIN
  v_workspace_id := get_user_workspace_id();
  v_year := EXTRACT(YEAR FROM CURRENT_DATE);

  INSERT INTO invoice_sequences (workspace_id, prefix, year, last_number)
  VALUES (v_workspace_id, p_prefix, v_year, 1)
  ON CONFLICT (workspace_id, prefix, year)
  DO UPDATE SET last_number = invoice_sequences.last_number + 1
  RETURNING last_number INTO v_next;

  RETURN p_prefix || v_year || LPAD(v_next::TEXT, 6, '0');
END;
$$;
