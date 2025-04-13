-- Enable RLS on scenarios table
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all scenarios
CREATE POLICY "Allow authenticated users to read scenarios"
ON scenarios FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create scenarios
CREATE POLICY "Allow authenticated users to create scenarios"
ON scenarios FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own scenarios
CREATE POLICY "Allow authenticated users to update their own scenarios"
ON scenarios FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own scenarios
CREATE POLICY "Allow authenticated users to delete their own scenarios"
ON scenarios FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on scenario_options table
ALTER TABLE scenario_options ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all scenario options
CREATE POLICY "Allow authenticated users to read scenario_options"
ON scenario_options FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create scenario options
CREATE POLICY "Allow authenticated users to create scenario_options"
ON scenario_options FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable RLS on scenario_feedback table
ALTER TABLE scenario_feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all scenario feedback
CREATE POLICY "Allow authenticated users to read scenario_feedback"
ON scenario_feedback FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create scenario feedback
CREATE POLICY "Allow authenticated users to create scenario_feedback"
ON scenario_feedback FOR INSERT
TO authenticated
WITH CHECK (true); 