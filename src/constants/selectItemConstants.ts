// ─────────────────────────────────────────────────
// Select Item Screen Constants
// Used when tapping "Add Items (Optional)" in the
// transaction form (Sale / Purchase / Returns).
// ─────────────────────────────────────────────────

export const SELECT_ITEM_CONSTANTS = {
  // Header
  HEADER_SEARCH_PLACEHOLDER: "Search & Select Item",

  // Filter bar
  CATEGORY_CHIP_LABEL: "Category",
  ADD_NEW_ITEM_LABEL: "+ Add New Item",

  // Item card
  STOCK_LABEL: "Stock:",
  PRICE_PREFIX: "Rs.",

  // Empty states
  EMPTY_TITLE: "No Items Found",
  EMPTY_SUBTITLE: "Try a different search or add a new item.",
  EMPTY_SEARCH_TITLE: "No Results",
  EMPTY_SEARCH_SUBTITLE: "No items match your search. Try different keywords.",

  // Loading
  LOADING_MORE_LABEL: "Loading more items...",

  // Error
  ERROR_TITLE: "Failed to Load Items",
  ERROR_RETRY: "Retry",
} as const;
