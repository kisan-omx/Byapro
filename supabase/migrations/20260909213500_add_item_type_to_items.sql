-- ================================================================
-- Migration: add_item_type_to_items
-- Adds item_type ('product' | 'service') to items table
-- ================================================================

ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'product' 
CHECK (item_type IN ('product', 'service'));

-- Index for filtering by item_type
CREATE INDEX IF NOT EXISTS idx_items_business_item_type 
ON public.items (business_id, item_type);
