"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { Product, StockMovement, InventorySummaryRow, MovementType } from "@/types";

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return (data || []) as Product[];
}

export async function createProduct(product: {
  code: string; name: string; unit?: string;
  unit_cost?: number; unit_price?: number; category?: string;
  reorder_level?: number;
}) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const { data, error } = await supabase
    .from("products")
    .insert({ workspace_id: workspace.id, ...product })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

export async function getStockMovements(productId?: string): Promise<StockMovement[]> {
  const supabase = await createClient();
  let query = supabase
    .from("stock_movements")
    .select("*, product:products(code, name, unit)")
    .order("movement_date", { ascending: false })
    .limit(100);

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as StockMovement[];
}

export async function createStockMovement(movement: {
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost?: number;
  reference_note?: string;
  movement_date?: string;
}) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  // Hareket ekle
  const { data, error } = await supabase
    .from("stock_movements")
    .insert({
      workspace_id: workspace.id,
      ...movement,
      movement_date: movement.movement_date || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Stok miktarını güncelle
  const qty = movement.movement_type === "sale"
    ? -Math.abs(movement.quantity)
    : movement.movement_type === "return"
      ? -Math.abs(movement.quantity)
      : Math.abs(movement.quantity);

  await supabase.rpc("update_product_quantity", {
    p_product_id: movement.product_id,
    p_quantity_change: qty,
  }).then(async (res) => {
    if (res.error) {
      // RPC yoksa fallback: doğrudan güncelle
      const { data: product } = await supabase
        .from("products")
        .select("current_quantity")
        .eq("id", movement.product_id)
        .single();
      if (product) {
        await supabase
          .from("products")
          .update({
            current_quantity: Number(product.current_quantity) + qty,
            updated_at: new Date().toISOString(),
          })
          .eq("id", movement.product_id);
      }
    }
  });

  return data as StockMovement;
}

export async function getInventorySummary(): Promise<InventorySummaryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_inventory_summary");
  if (error) throw new Error(error.message);
  return (data || []) as InventorySummaryRow[];
}
