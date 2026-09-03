-- Create businesses table first
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create users table with reference to businesses
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Firebase UID
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) per AGENTS.md Rule 11
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create helper function for Firebase JWT 'sub' claim
-- Supabase's default auth.uid() expects UUID, but Firebase UIDs are strings.
CREATE OR REPLACE FUNCTION public.firebase_uid()
RETURNS text AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::text;
$$ LANGUAGE sql STABLE;

-- -----------------------------------------------------
-- RLS POLICIES FOR USERS
-- -----------------------------------------------------

-- Users can read their own profile
CREATE POLICY "Users can read own record" ON users
    FOR SELECT USING (firebase_uid() = id);

-- Users can insert their own profile (used during auth sync)
CREATE POLICY "Users can insert own record" ON users
    FOR INSERT WITH CHECK (firebase_uid() = id);

-- Users can update their own profile (used during upsert)
CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (firebase_uid() = id);


-- -----------------------------------------------------
-- RLS POLICIES FOR BUSINESSES
-- -----------------------------------------------------

-- Users can read a business if they belong to it
CREATE POLICY "Users can read their business" ON businesses
    FOR SELECT USING (
        id IN (SELECT business_id FROM users WHERE id = firebase_uid())
    );

-- Any authenticated user can create a business
CREATE POLICY "Users can insert businesses" ON businesses
    FOR INSERT WITH CHECK (firebase_uid() IS NOT NULL);

-- Users can update their business if they belong to it
CREATE POLICY "Users can update their business" ON businesses
    FOR UPDATE USING (
        id IN (SELECT business_id FROM users WHERE id = firebase_uid())
    );

-- Optional: Triggers to auto-update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON businesses
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
