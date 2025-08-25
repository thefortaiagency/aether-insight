-- Complete SQL to create ALL tables needed for Aether Insight
-- Run this in Supabase Dashboard -> SQL Editor

-- ============================================
-- LIVE SCORING TABLES
-- ============================================

-- Create match_statistics table (for live scoring)
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

-- Create match_updates table (for real-time updates)
CREATE TABLE IF NOT EXISTS match_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for live scoring
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_wrestler_name ON match_statistics(wrestler_name);
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_created_at ON match_updates(created_at DESC);

-- ============================================
-- TEAM MANAGEMENT TABLES
-- ============================================

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT,
  division TEXT,
  conference TEXT,
  logo_url TEXT,
  coach_name TEXT,
  assistant_coaches TEXT[],
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wrestlers table
CREATE TABLE IF NOT EXISTS wrestlers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade INTEGER,
  weight_class INTEGER,
  actual_weight DECIMAL,
  birth_date DATE,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create season_records table
CREATE TABLE IF NOT EXISTS season_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,
  season TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  pins INTEGER DEFAULT 0,
  tech_falls INTEGER DEFAULT 0,
  major_decisions INTEGER DEFAULT 0,
  team_points DECIMAL DEFAULT 0,
  tournament_placements JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for team management
CREATE INDEX IF NOT EXISTS idx_wrestlers_team_id ON wrestlers(team_id);
CREATE INDEX IF NOT EXISTS idx_wrestlers_weight_class ON wrestlers(weight_class);
CREATE INDEX IF NOT EXISTS idx_season_records_wrestler_id ON season_records(wrestler_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions for live scoring tables
GRANT ALL ON match_statistics TO anon;
GRANT ALL ON match_updates TO anon;
GRANT ALL ON match_statistics TO authenticated;
GRANT ALL ON match_updates TO authenticated;
GRANT ALL ON match_statistics TO service_role;
GRANT ALL ON match_updates TO service_role;

-- Grant permissions for team management tables
GRANT ALL ON teams TO anon;
GRANT ALL ON wrestlers TO anon;
GRANT ALL ON season_records TO anon;
GRANT ALL ON teams TO authenticated;
GRANT ALL ON wrestlers TO authenticated;
GRANT ALL ON season_records TO authenticated;
GRANT ALL ON teams TO service_role;
GRANT ALL ON wrestlers TO service_role;
GRANT ALL ON season_records TO service_role;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS but allow all operations for now (adjust for production)
ALTER TABLE match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_records ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for testing - restrict in production)
CREATE POLICY "Allow all operations on match_statistics" ON match_statistics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on match_updates" ON match_updates
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on teams" ON teams
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on wrestlers" ON wrestlers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on season_records" ON season_records
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'All tables created successfully!' as message;