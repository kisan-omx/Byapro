DROP POLICY IF EXISTS "Users can insert businesses" ON businesses;

CREATE POLICY "Users can insert businesses" ON businesses
    FOR INSERT WITH CHECK (owner_id = firebase_uid());
