-- E-Fatura / E-Arşiv alanları
-- documents tablosuna e-fatura durumu ve UUID
ALTER TABLE documents ADD COLUMN IF NOT EXISTS e_invoice_status text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS e_invoice_uuid text;

-- workspace'e firma e-fatura bilgileri
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS company_phone text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS company_email text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS company_tax_id text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS company_tax_office text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS company_address text;
