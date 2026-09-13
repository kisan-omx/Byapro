import { supabase } from "../lib/supabase";
import { ItemCategory } from "../types/itemCategory";

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function mapRow(row: any): ItemCategory {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

// ─────────────────────────────────────────────────
// getItemCategories — fetch all categories for a business
// Reuses expense_categories table (same schema, same RLS)
// ─────────────────────────────────────────────────
export async function getItemCategories(
  businessId: string,
): Promise<ItemCategory[]> {
  const { data, error } = await supabase
    .from("expense_categories")
    .select("id, business_id, name, created_at")
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

// ─────────────────────────────────────────────────
// createItemCategory — insert a new category
// ─────────────────────────────────────────────────
export async function createItemCategory(
  businessId: string,
  name: string,
): Promise<ItemCategory> {
  const { data, error } = await supabase
    .from("expense_categories")
    .insert({ business_id: businessId, name: name.trim() })
    .select("id, business_id, name, created_at")
    .single();

  if (error) throw error;
  return mapRow(data);
}
