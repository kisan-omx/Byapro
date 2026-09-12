import { supabase } from '../lib/supabase';
import { Item, StockFilterType, TypeFilterType } from '../types/item';
import { ITEMS_PAGE_SIZE } from '../constants/items';

// ─────────────────────────────────────────────────
// Re-export PAGE_SIZE for hook consumption
// ─────────────────────────────────────────────────
export const PAGE_SIZE = ITEMS_PAGE_SIZE;

// ─────────────────────────────────────────────────
// Params & Responses
// ─────────────────────────────────────────────────
export interface FetchItemsParams {
  businessId?: string | null;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  stockFilter?: StockFilterType;
  typeFilter?: TypeFilterType;
}

export interface FetchItemsResponse {
  items: Item[];
  hasMore: boolean;
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

/** Derive stock status from quantity and low-stock threshold */
function deriveStockStatus(qty: number, lowAlert?: number | null): Item['stockStatus'] {
  if (qty <= 0) return 'out_of_stock';
  if (lowAlert != null && qty <= lowAlert) return 'low_stock';
  return 'in_stock';
}

/** Generate a display avatar letter from a name */
function toAvatarLetter(name: string): string {
  return (name?.trim()?.[0] ?? '?').toUpperCase();
}

/** Map a raw Supabase row to the Item UI model */
function mapRowToItem(row: any): Item {
  const qty = Number(row.stock_quantity ?? 0);
  const lowAlert = row.low_stock_alert != null ? Number(row.low_stock_alert) : null;

  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    sku: row.sku ?? null,
    sellingPrice: Number(row.selling_price ?? 0),
    purchasePrice: row.purchase_price != null ? Number(row.purchase_price) : null,
    stockQuantity: qty,
    lowStockAlert: lowAlert,
    unit: row.unit ?? null,
    categoryId: row.category_id ?? null,
    asOfDate: row.as_of_date ?? null,
    atPrice: row.at_price != null ? Number(row.at_price) : null,
    itemLocation: row.item_location ?? null,
    itemType: row.item_type ?? 'product',
    createdAt: row.created_at,
    stockStatus: deriveStockStatus(qty, lowAlert),
    avatarLetter: toAvatarLetter(row.name),
  };
}

// ─────────────────────────────────────────────────
// getItems — paginated, server-side search & filter
// PAGE_SIZE = 20 | ORDER BY created_at DESC, id DESC
// ─────────────────────────────────────────────────
export async function getItems({
  businessId,
  searchQuery = '',
  page = 0,
  pageSize = PAGE_SIZE,
  stockFilter = 'all',
  typeFilter = 'all',
}: FetchItemsParams): Promise<FetchItemsResponse> {
  if (!businessId) return { items: [], hasMore: false };

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('items')
    .select('id, business_id, name, sku, selling_price, purchase_price, stock_quantity, low_stock_alert, unit, category_id, as_of_date, at_price, item_location, item_type, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);

  // Server-side search on name or sku
  const trimmed = searchQuery.trim();
  if (trimmed) {
    // Sanitise to prevent PostgREST syntax errors
    const sanitized = trimmed.replace(/[,()"\\]/g, '');
    if (sanitized) {
      query = query.or(`name.ilike.%${sanitized}%,sku.ilike.%${sanitized}%`);
    }
  }

  // Type/unit filter (server-side)
  if (typeFilter && typeFilter !== 'all') {
    query = query.eq('unit', typeFilter);
  }

  // Stock filter on server — use quantity thresholds
  if (stockFilter === 'out_of_stock') {
    query = query.lte('stock_quantity', 0);
  } else if (stockFilter === 'in_stock') {
    query = query.gt('stock_quantity', 0);
  }
  // 'low_stock' needs client-side filtering (requires comparing qty to low_stock_alert per row)

  const { data, error } = await query;
  if (error) throw error;

  let items: Item[] = (data ?? []).map(mapRowToItem);

  // Client-side low-stock refinement (can't do this server-side cleanly without an RPC)
  if (stockFilter === 'low_stock') {
    items = items.filter(
      (item) =>
        item.stockQuantity > 0 &&
        item.lowStockAlert != null &&
        item.stockQuantity <= item.lowStockAlert,
    );
  } else if (stockFilter === 'in_stock') {
    // Exclude items that are technically "low stock" from the in_stock view
    // Only show clearly in-stock items (above low alert threshold or no alert set)
    items = items.filter(
      (item) =>
        item.stockQuantity > 0 &&
        (item.lowStockAlert == null || item.stockQuantity > item.lowStockAlert),
    );
  }

  const hasMore = (data ?? []).length === pageSize;
  return { items, hasMore };
}

// ─────────────────────────────────────────────────
// createItem — insert new item
// ─────────────────────────────────────────────────
export interface CreateItemParams {
  id?: string;
  businessId: string;
  name: string;
  sellingPrice?: number;
  purchasePrice?: number;
  unit?: string;
  categoryId?: string;
  stockQuantity?: number;
  asOfDate?: string;
  atPrice?: number;
  lowStockAlert?: number;
  itemLocation?: string;
  sku?: string;
  itemType?: 'product' | 'service';
}

export async function createItem(params: CreateItemParams): Promise<Item> {
  const {
    id,
    businessId,
    name,
    sellingPrice = 0,
    purchasePrice,
    unit,
    categoryId,
    stockQuantity = 0,
    asOfDate,
    atPrice,
    lowStockAlert,
    itemLocation,
    sku,
    itemType = 'product',
  } = params;

  const payload: any = {
    business_id: businessId,
    name: name.trim(),
    selling_price: sellingPrice,
    stock_quantity: stockQuantity,
    item_type: itemType,
  };

  if (id) payload.id = id;
  if (purchasePrice != null) payload.purchase_price = purchasePrice;
  if (unit?.trim()) payload.unit = unit.trim().toUpperCase();
  if (categoryId?.trim()) payload.category_id = categoryId.trim();
  if (asOfDate?.trim()) payload.as_of_date = asOfDate.trim();
  if (atPrice != null) payload.at_price = atPrice;
  if (lowStockAlert != null) payload.low_stock_alert = lowStockAlert;
  if (itemLocation?.trim()) payload.item_location = itemLocation.trim();
  if (sku?.trim()) payload.sku = sku.trim();

  const { data, error } = await supabase
    .from('items')
    .upsert(payload, { onConflict: 'id' })
    .select('id, business_id, name, sku, selling_price, purchase_price, stock_quantity, low_stock_alert, unit, category_id, as_of_date, at_price, item_location, item_type, created_at')
    .single();

  if (error) throw error;
  return mapRowToItem(data);
}
