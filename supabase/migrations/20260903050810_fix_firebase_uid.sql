CREATE OR REPLACE FUNCTION public.firebase_uid()
RETURNS text AS $$
DECLARE
  claims jsonb;
BEGIN
  -- Fallback 1: Check the direct setting
  IF current_setting('request.jwt.claim.sub', true) IS NOT NULL AND current_setting('request.jwt.claim.sub', true) <> '' THEN
    RETURN current_setting('request.jwt.claim.sub', true);
  END IF;

  -- Fallback 2: Parse the claims object
  IF current_setting('request.jwt.claims', true) IS NOT NULL AND current_setting('request.jwt.claims', true) <> '' THEN
    claims := current_setting('request.jwt.claims', true)::jsonb;
    IF claims ? 'sub' THEN
      RETURN claims ->> 'sub';
    END IF;
    IF claims ? 'user_id' THEN
      RETURN claims ->> 'user_id';
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
