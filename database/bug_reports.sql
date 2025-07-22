-- Bug Reports Table
-- Run this SQL in your Supabase SQL editor to create the bug_reports table  
-- Project: supbaincqxpxklccstqa (Nymph)

CREATE TABLE IF NOT EXISTS bug_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Bug details
    feature_name VARCHAR(255) NOT NULL,
    expected_behavior TEXT NOT NULL,
    actual_behavior TEXT NOT NULL,
    error_code VARCHAR(100),
    error_message TEXT,
    
    -- Status and priority
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    priority VARCHAR(10) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Critical')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_priority ON bug_reports(priority);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_bug_reports_feature_name ON bug_reports(feature_name);

-- Enable Row Level Security
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for all operations (since we're managing auth in the app)
CREATE POLICY "Allow all operations on bug_reports" ON bug_reports FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_bug_reports_updated_at 
    BEFORE UPDATE ON bug_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();