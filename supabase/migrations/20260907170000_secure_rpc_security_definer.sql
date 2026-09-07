-- ================================================================
-- Migration: secure_rpc_security_definer
-- Description: Fixes Supabase Security Advisor warnings by switching RPC
--              functions to SECURITY INVOKER (enforcing RLS), revoking
--              execution privileges from anon/PUBLIC roles, and setting search_path.
-- ================================================================

-- ---------------------------------------------------------------
-- 1. SWITCH FUNCTIONS TO SECURITY INVOKER (ENFORCES RLS)
-- ---------------------------------------------------------------
ALTER FUNCTION public.record_sale_transaction(UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) SECURITY INVOKER;
ALTER FUNCTION public.record_purchase_transaction(UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) SECURITY INVOKER;
ALTER FUNCTION public.record_sale_return_transaction(UUID, UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) SECURITY INVOKER;
ALTER FUNCTION public.record_purchase_return_transaction(UUID, UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) SECURITY INVOKER;
ALTER FUNCTION public.record_payment_in_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) SECURITY INVOKER;
ALTER FUNCTION public.record_payment_out_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) SECURITY INVOKER;
ALTER FUNCTION public.record_expense_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) SECURITY INVOKER;

-- ---------------------------------------------------------------
-- 2. REVOKE EXECUTE FROM PUBLIC AND ANON ROLES
-- ---------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.record_sale_transaction(UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_purchase_transaction(UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_sale_return_transaction(UUID, UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_purchase_return_transaction(UUID, UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_payment_in_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_payment_out_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_expense_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;

-- ---------------------------------------------------------------
-- 3. GRANT EXECUTE ONLY TO AUTHENTICATED AND SERVICE_ROLE
-- ---------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.record_sale_transaction(UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_purchase_transaction(UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_sale_return_transaction(UUID, UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_purchase_return_transaction(UUID, UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_payment_in_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_payment_out_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_expense_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) TO authenticated, service_role;

-- ---------------------------------------------------------------
-- 4. ENFORCE SAFE SEARCH_PATH
-- ---------------------------------------------------------------
ALTER FUNCTION public.record_sale_transaction(UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_purchase_transaction(UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_sale_return_transaction(UUID, UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_purchase_return_transaction(UUID, UUID, UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_payment_in_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_payment_out_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_expense_transaction(UUID, UUID, NUMERIC, TEXT, TEXT) SET search_path = pg_catalog, public;
