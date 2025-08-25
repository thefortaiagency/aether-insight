-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- This will create the missing tables for live scoring

-- Create match_statistics table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS match_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_id UUID,
  wrestler_name TEXT NOT NULL,
  takedowns INTEGER DEFAULT 0,
  escapes INTEGER DEFAULT 0,
  reversals INTEGER DEFAULT 0,
  near_fall_2 INTEGER DEFAULT 0,
  near_fall_3 INTEGER DEFAULT 0,
  near_fall_4 INTEGER DEFAULT 0,
  stalls INTEGER DEFAULT 0,
  cautions INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  penalties INTEGER DEFAULT 0,
  riding_time INTEGER DEFAULT 0,
  riding_time_point BOOLEAN DEFAULT FALSE,
  blood_time INTEGER DEFAULT 0,
  injury_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for match_statistics
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_wrestler_name ON match_statistics(wrestler_name);

-- Create match_updates table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS match_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for match_updates
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_created_at ON match_updates(created_at DESC);

-- Grant permissions (adjust as needed for your security requirements)
-- These allow the anon role to read/write (for testing)
GRANT ALL ON match_statistics TO anon;
GRANT ALL ON match_updates TO anon;
GRANT ALL ON match_statistics TO authenticated;
GRANT ALL ON match_updates TO authenticated;
GRANT ALL ON match_statistics TO service_role;
GRANT ALL ON match_updates TO service_role;

-- Enable RLS (Row Level Security) but allow all operations for now
ALTER TABLE match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_updates ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for testing - restrict in production)
CREATE POLICY "Allow all operations on match_statistics" ON match_statistics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on match_updates" ON match_updates
  FOR ALL USING (true) WITH CHECK (true);

-- Success message
SELECT 'Tables created successfully!' as message;