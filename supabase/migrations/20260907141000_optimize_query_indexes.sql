-- ================================================================
-- Migration: optimize_query_indexes
-- Description: Adds composite B-Tree and GIN trigram indexes based on
--              real application query patterns across Byapro services.
-- Rules: Multi-tenant isolated (business_id), non-breaking, idempotent.
-- ================================================================

-- ---------------------------------------------------------------
-- 1. BUSINESSES: Owner lookup fallback (quickEntryService.ts)
-- Query: WHERE owner_id = ? ORDER BY created_at DESC LIMIT 1
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_businesses_owner_created
    ON public.businesses (owner_id, created_at DESC);

-- ---------------------------------------------------------------
-- 2. USERS: Foreign key / RLS tenant lookup
-- Query: WHERE business_id = ?
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_business_id
    ON public.users (business_id)
    WHERE business_id IS NOT NULL;

-- ---------------------------------------------------------------
-- 3. PARTIES: Pagination & phone lookup (partyService.ts)
-- Query 1: WHERE business_id = ? ORDER BY created_at DESC, id DESC
-- Query 2: WHERE business_id = ? AND phone = ?
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_parties_business_created
    ON public.parties (business_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_parties_business_phone
    ON public.parties (business_id, phone)
    WHERE phone IS NOT NULL;

-- ---------------------------------------------------------------
-- 4. ITEMS: Listing & sorting by name or creation date
-- Query 1: WHERE business_id = ? ORDER BY name ASC
-- Query 2: WHERE business_id = ? ORDER BY created_at DESC, id DESC
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_items_business_name
    ON public.items (business_id, name);

CREATE INDEX IF NOT EXISTS idx_items_business_created
    ON public.items (business_id, created_at DESC, id DESC);

-- ---------------------------------------------------------------
-- 5. MULTI-TENANT PARTY LEDGER & FINANCIAL HISTORY
-- Queries: WHERE business_id = ? AND party_id = ? ORDER BY created_at DESC
-- Composite index matches the filtering and ordering pattern, allowing
-- PostgreSQL to efficiently retrieve rows in the required order and
-- potentially avoid an explicit sort.
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sales_business_party_created
    ON public.sales (business_id, party_id, created_at DESC)
    WHERE party_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchases_business_party_created
    ON public.purchases (business_id, party_id, created_at DESC)
    WHERE party_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_in_business_party_created
    ON public.payment_in (business_id, party_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_out_business_party_created
    ON public.payment_out (business_id, party_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sale_returns_business_party_created
    ON public.sale_returns (business_id, party_id, created_at DESC)
    WHERE party_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_returns_business_party_created
    ON public.purchase_returns (business_id, party_id, created_at DESC)
    WHERE party_id IS NOT NULL;

-- ---------------------------------------------------------------
-- 6. SUBSTRING PATTERN MATCHING (ILIKE '%term%')
-- Enables pg_trgm extension in extensions schema and GIN trigram
-- indexes for fast pattern searches on parties (name, phone) and items (name).
-- ---------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE INDEX IF NOT EXISTS idx_parties_name_trgm
    ON public.parties USING gin (name extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_parties_phone_trgm
    ON public.parties USING gin (phone extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_items_name_trgm
    ON public.items USING gin (name extensions.gin_trgm_ops);
