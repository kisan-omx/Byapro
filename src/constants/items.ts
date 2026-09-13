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
export interface UnitOption {
  name: string;
  shortName: string;
}

export const UNIT_CONFIG_OPTIONS: UnitOption[] = [
  { name: 'KILOMETER', shortName: 'Kmt' },
  { name: 'UNIT', shortName: 'Umit' },
  { name: 'BOTTLE', shortName: 'Btl' },
  { name: 'HOUR', shortName: 'Hur' },
  { name: 'PIECES', shortName: 'Pcs' },
  { name: 'ROLL', shortName: 'Rol' },
  { name: 'NUMBERS', shortName: 'Nos' },
  { name: 'TABLESPOON', shortName: 'Tbs' },
  { name: 'MILLILITRE', shortName: 'Ml' },
  { name: 'SET', shortName: 'Set' },
  { name: 'SQUARE FEET', shortName: 'Sqf' },
  { name: 'LITRE', shortName: 'Ltr' },
  { name: 'DOZENS', shortName: 'Dzn' },
  { name: 'PACKS', shortName: 'Pac' },
  { name: 'TON', shortName: 'Ton' },
  { name: 'METRE', shortName: 'Mtr' },
  { name: 'CARTON', shortName: 'Ctn' },
  { name: 'CUBIC METRE', shortName: 'Mtq' },
  { name: 'KILOGRAM', shortName: 'Kg' },
  { name: 'QUINTAL', shortName: 'Qtl' },
  { name: 'PAIRS', shortName: 'Prs' },
  { name: 'SERVICE', shortName: 'Ser' },
  { name: 'BUNDLE', shortName: 'Bdl' },
  { name: 'BOX', shortName: 'Box' },
  { name: 'SQUARE METERS', shortName: 'Sqm' },
  { name: 'BAGS', shortName: 'Bag' },
  { name: 'CANS', shortName: 'Can' },
  { name: 'GRAMMES', shortName: 'Gm' },
  { name: 'DAY', shortName: 'Day' },
];

export const UNIT_OPTIONS: string[] = UNIT_CONFIG_OPTIONS.map((u) => u.name);

/** Helper to get short name for any unit string (e.g. "CANS" -> "Can") */
export function getUnitShortName(unitName?: string | null): string {
  if (!unitName) return '';
  const trimmed = unitName.trim().toUpperCase();
  const match = UNIT_CONFIG_OPTIONS.find((u) => u.name.toUpperCase() === trimmed);
  if (match) return match.shortName;
  return unitName;
}

/** Dynamically register a new custom unit with its short name */
export function registerCustomUnit(fullName: string, shortName: string): void {
  const full = fullName.trim().toUpperCase();
  const short = shortName.trim() || full;
  if (full) {
    const existing = UNIT_CONFIG_OPTIONS.find((u) => u.name.toUpperCase() === full);
    if (!existing) {
      UNIT_CONFIG_OPTIONS.push({ name: full, shortName: short });
      if (!UNIT_OPTIONS.includes(full)) {
        UNIT_OPTIONS.push(full);
      }
    } else {
      existing.shortName = short;
    }
  }
}

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
    SELECT_UNIT_TITLE: 'Select Measuring Unit',
    PRIMARY_UNIT: 'Primary Unit',
    SECONDARY_UNIT: 'Secondary Unit',
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
