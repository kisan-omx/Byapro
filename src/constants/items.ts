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

// ─────────────────────────────────────────────────
// Add Item Page Constants
// ─────────────────────────────────────────────────
export const ADD_ITEM_CONSTANTS = {
  HEADER_TITLE: 'Add Item',

  ITEM_TYPES: [
    { id: 'product', label: 'Product' },
    { id: 'service', label: 'Services' },
  ] as const,

  FORM_LABELS: {
    ITEM_NAME: 'Item Name',
    SELECT_UNIT: 'Select Unit',
    SELLING_PRICE: 'Selling Price',
    PURCHASE_PRICE: 'Purchase Price',
    OPENING_STOCK: 'Opening Stock',
    LOW_STOCK_ALERT: 'Low Stock Alert',
    SKU: 'SKU / Barcode',
  },

  PLACEHOLDERS: {
    ITEM_NAME: '',
    SELLING_PRICE: '0',
    PURCHASE_PRICE: '0',
    OPENING_STOCK: '0',
    LOW_STOCK_ALERT: 'e.g. 5',
    SKU: 'e.g. SKU-001',
  },

  BUTTONS: {
    CANCEL: 'Cancel',
    SAVE: 'Save',
  },

  VALIDATION: {
    NAME_REQUIRED: 'Item name is required.',
    SELLING_PRICE_REQUIRED: 'Selling price is required.',
    SELLING_PRICE_INVALID: 'Enter a valid selling price.',
    PURCHASE_PRICE_INVALID: 'Enter a valid purchase price.',
    STOCK_INVALID: 'Enter a valid opening stock quantity.',
    LOW_STOCK_INVALID: 'Enter a valid low stock alert value.',
  },
} as const;

export type ItemType = (typeof ADD_ITEM_CONSTANTS.ITEM_TYPES)[number]['id'];
