-- Ürün/Stok kartları
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  unit text DEFAULT 'adet',
  current_quantity numeric(12,2) DEFAULT 0,
  reorder_level numeric(12,2) DEFAULT 0,
  unit_cost numeric(12,2) DEFAULT 0,
  unit_price numeric(12,2) DEFAULT 0,
  category text,
  supplier_id uuid REFERENCES contacts,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, code)
);

-- Stok hareketleri
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase','sale','adjustment','return')),
  quantity numeric(12,2) NOT NULL,
  unit_cost numeric(12,2),
  reference_note text,
  document_id uuid REFERENCES documents,
  movement_date date NOT NULL DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_workspace ON products(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sm_product ON stock_movements(product_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_sm_workspace ON stock_movements(workspace_id, movement_date);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_workspace ON products
  FOR ALL USING (workspace_id = get_user_workspace_id());

CREATE POLICY sm_workspace ON stock_movements
  FOR ALL USING (workspace_id = get_user_workspace_id());

-- Stok değeri RPC
CREATE OR REPLACE FUNCTION get_inventory_summary()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    FROM (
      SELECT p.id, p.code, p.name, p.unit, p.current_quantity,
        p.unit_cost, p.unit_price, p.reorder_level, p.category,
        (p.current_quantity * p.unit_cost)::numeric(12,2) as stock_value,
        p.current_quantity <= p.reorder_level as below_reorder
      FROM products p
      WHERE p.workspace_id = get_user_workspace_id() AND p.is_active = true
      ORDER BY p.name
    ) t
  );
END;
$$;
