-- 1. Fix role mutable search_path for firebase_uid
ALTER FUNCTION public.firebase_uid() SET search_path = public;

-- 2. Fix role mutable search_path for handle_updated_at
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- 3. Fix exposed SECURITY DEFINER function rls_auto_enable (if it exists)
-- Revoke execute from public roles (anon and authenticated shouldn't call this directly)
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
