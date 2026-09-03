DROP POLICY IF EXISTS "Users can read their business" ON businesses;
CREATE POLICY "Users can read their business" ON businesses
    FOR SELECT USING (
        owner_id = firebase_uid() OR 
        owner_id = 'demo-user' OR
        id IN (SELECT business_id FROM users WHERE id = firebase_uid() OR id = 'demo-user')
    );

DROP POLICY IF EXISTS "Users can update their business" ON businesses;
CREATE POLICY "Users can update their business" ON businesses
    FOR UPDATE USING (
        owner_id = firebase_uid() OR 
        owner_id = 'demo-user' OR
        id IN (SELECT business_id FROM users WHERE id = firebase_uid() OR id = 'demo-user')
    );
