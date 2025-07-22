-- Feature Requests Table
-- Run this SQL in your Supabase SQL editor to create the feature_requests table
-- Project: supbaincqxpxklccstqa (Nymph)

CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Feature details
    feature_name VARCHAR(255) NOT NULL,
    expected_behavior TEXT NOT NULL,
    feature_importance VARCHAR(50),
    desirability VARCHAR(50),
    
    -- Status and priority
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    priority VARCHAR(10) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Critical')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_priority ON feature_requests(priority);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON feature_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_requests_feature_name ON feature_requests(feature_name);

-- Enable Row Level Security
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for all operations (since we're managing auth in the app)
CREATE POLICY "Allow all operations on feature_requests" ON feature_requests FOR ALL USING (true);

-- Trigger to automatically update updated_at (reuses function from bug_reports)
CREATE TRIGGER update_feature_requests_updated_at 
    BEFORE UPDATE ON feature_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();