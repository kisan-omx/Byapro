-- ================================================================
-- Migration: add_email_address_balance_to_parties
-- Adds email, address, and balance columns to parties table if missing
-- ================================================================

ALTER TABLE public.parties ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.parties ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.parties ADD COLUMN IF NOT EXISTS balance NUMERIC(12,2) DEFAULT 0;
