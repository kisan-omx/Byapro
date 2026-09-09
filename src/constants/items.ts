import { StockFilterType, StockStatus } from '../types/item';

// ─────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────
export const ITEMS_PAGE_SIZE = 20;

// ─────────────────────────────────────────────────
// Stock Filter Options
// ─────────────────────────────────────────────────
export interface StockFilterOption {
  id: StockFilterType;
  label: string;
}

export const STOCK_FILTER_OPTIONS: StockFilterOption[] = [
  { id: 'all', label: 'All Stock' },
  { id: 'in_stock', label: 'In Stock' },
  { id: 'low_stock', label: 'Low Stock' },
  { id: 'out_of_stock', label: 'Out of Stock' },
];

// ─────────────────────────────────────────────────
// Common Unit Options (for Add Item modal)
// ─────────────────────────────────────────────────
export const UNIT_OPTIONS: string[] = [
  'PCS',
  'KG',
  'GM',
  'LTR',
  'ML',
  'BTL',
  'BOX',
  'PKT',
  'BAG',
  'MTR',
  'FT',
  'DOZEN',
];

// ─────────────────────────────────────────────────
// Stock Status Visual Config
// ─────────────────────────────────────────────────
export interface StockStatusConfig {
  label: string;
  textClass: string;
  badgeClass: string;
  badgeTextClass: string;
}

export const STOCK_STATUS_CONFIG: Record<StockStatus, StockStatusConfig> = {
  in_stock: {
    label: 'In Stock',
    textClass: 'text-success font-semibold',
    badgeClass: 'bg-secondary-light border-secondary-light',
    badgeTextClass: 'text-secondary',
  },
  low_stock: {
    label: 'Low Stock',
    textClass: 'text-warning font-semibold',
    badgeClass: 'bg-amber-50 border-amber-200',
    badgeTextClass: 'text-warning',
  },
  out_of_stock: {
    label: 'Out of Stock',
    textClass: 'text-error font-semibold',
    badgeClass: 'bg-error-light border-error-light',
    badgeTextClass: 'text-error',
  },
};
