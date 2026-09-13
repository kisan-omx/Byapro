-- Migration: Add updated_at to items and clean up storage on item delete

-- 1. Add updated_at to items (useful for cache busting images)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. Trigger to auto-update updated_at on items
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS trigger_items_updated_at ON public.items;
CREATE TRIGGER trigger_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


