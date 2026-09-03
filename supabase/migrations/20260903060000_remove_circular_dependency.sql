-- Remove the circular dependency by dropping business_id from users
ALTER TABLE users DROP COLUMN IF EXISTS business_id CASCADE;

-- Recreate businesses RLS without referring to users.business_id
-- Also remove the demo-user checks since we are removing demo mode
DROP POLICY IF EXISTS "Users can read their business" ON businesses;
CREATE POLICY "Users can read their business" ON businesses
    FOR SELECT USING (
        owner_id = firebase_uid()
    );

DROP POLICY IF EXISTS "Users can update their business" ON businesses;
CREATE POLICY "Users can update their business" ON businesses
    FOR UPDATE USING (
        owner_id = firebase_uid()
    );
