-- User Communications Table
-- For admin-user messaging about bug reports and feature requests
-- Run this SQL in your Supabase SQL editor to create the table

CREATE TABLE IF NOT EXISTS user_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Reference to the related item
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('bug', 'feature')),
    item_id UUID NOT NULL,
    
    -- Message details
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('info_request', 'clarification', 'rejection', 'update', 'general')),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Communication metadata
    from_admin BOOLEAN DEFAULT true,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_communications_item_type ON user_communications(item_type);
CREATE INDEX IF NOT EXISTS idx_user_communications_item_id ON user_communications(item_id);
CREATE INDEX IF NOT EXISTS idx_user_communications_is_read ON user_communications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_communications_created_at ON user_communications(created_at);

-- Enable Row Level Security
ALTER TABLE user_communications ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for all operations (since we're managing auth in the app)
CREATE POLICY "Allow all operations on user_communications" ON user_communications FOR ALL USING (true);

-- Example data for testing
INSERT INTO user_communications (item_type, item_id, message_type, subject, message, priority) VALUES 
('bug', 'd2c8f5b1-4e67-4d2a-9c3b-1a5e7f9d2c8a', 'info_request', 'Bug Report #1001 - Need More Details', 'Hi! Thanks for reporting this bug. Could you please provide more specific steps to reproduce the issue? Also, what browser and operating system are you using?', 'normal'),
('feature', 'a5f2d8c1-7b4e-4a9c-8d6f-2c5e9b1a4f7d', 'clarification', 'Feature Request #502 - Clarification Needed', 'This feature sounds interesting! Could you elaborate on how you envision this working? Some mockups or detailed use cases would help us understand your needs better.', 'low'),
('bug', 'b7a4f9d2-5c8e-4b6a-9f3d-7e2a5c8b1f4e', 'update', 'Bug Report #998 - Status Update', 'Good news! We''ve identified the root cause of this issue and are working on a fix. Expected resolution in the next update cycle.', 'high');