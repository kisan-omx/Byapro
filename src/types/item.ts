// ─────────────────────────────────────────────────
// Item & Inventory Types
// ─────────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type StockFilterType = 'all' | StockStatus;

export type SyncStatus = 'saving' | 'synced' | 'failed';

/** Mirrors the `items` table in Supabase */
export interface Item {
  id: string;
  businessId: string;
  name: string;
  sku?: string | null;
  sellingPrice: number;
  purchasePrice?: number | null;
  stockQuantity: number;
  lowStockAlert?: number | null;
  unit?: string | null;
  secondaryUnit?: string | null;
  conversionRate?: number | null;
  categoryId?: string | null;
  asOfDate?: string | null;
  atPrice?: number | null;
  itemLocation?: string | null;
  itemType?: 'product' | 'service';
  createdAt: string;
  // Derived UI helpers
  stockStatus: StockStatus;
  avatarLetter: string;
  syncStatus?: SyncStatus;
  syncError?: string;
}

/** Payload for creating a new item */
export interface AddItemFormData {
  name: string;
  sellingPrice: string;
  purchasePrice?: string;
  unit?: string;
  secondaryUnit?: string;
  conversionRate?: string;
  stockQuantity?: string;
  lowStockAlert?: string;
  sku?: string;
}

/** Filters used in useItems hook */
export type TypeFilterType = 'all' | string; // unit value e.g. 'BTL', 'KG', 'PCS'

export interface ItemsFilter {
  searchQuery: string;
  stockFilter: StockFilterType;
  typeFilter: TypeFilterType;
}
