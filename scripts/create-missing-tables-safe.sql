-- Safe SQL to create missing tables (checks if they exist first)
-- Run this in Supabase Dashboard -> SQL Editor

-- ============================================
-- LIVE SCORING TABLES
-- ============================================

-- Create match_statistics table (if not exists)
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

-- Create match_updates table (if not exists)
CREATE TABLE IF NOT EXISTS match_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEAM MANAGEMENT TABLES
-- ============================================

-- Create teams table (if not exists)
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

-- Create wrestlers table (if not exists)
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

-- Create season_records table (if not exists)
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

-- ============================================
-- INDEXES (IF NOT EXISTS)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_wrestler_name ON match_statistics(wrestler_name);
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_created_at ON match_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wrestlers_team_id ON wrestlers(team_id);
CREATE INDEX IF NOT EXISTS idx_wrestlers_weight_class ON wrestlers(weight_class);
CREATE INDEX IF NOT EXISTS idx_season_records_wrestler_id ON season_records(wrestler_id);

-- ============================================
-- CHECK WHAT WAS CREATED
-- ============================================

SELECT 'Tables Check:' as status;

SELECT table_name, 'EXISTS' as status 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('match_statistics', 'match_updates', 'teams', 'wrestlers', 'season_records')
ORDER BY table_name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'Setup complete! Check the tables list above.' as message;