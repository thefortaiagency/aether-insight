-- URGENT: Run this in Supabase SQL Editor to fix 500 errors
-- This creates all missing tables immediately

-- Create teams table (required for wrestlers)
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

-- Create match_statistics table
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

-- Create match_updates table
CREATE TABLE IF NOT EXISTS match_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wrestlers_team_id ON wrestlers(team_id);
CREATE INDEX IF NOT EXISTS idx_wrestlers_weight_class ON wrestlers(weight_class);
CREATE INDEX IF NOT EXISTS idx_season_records_wrestler_id ON season_records(wrestler_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_updates ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (for testing - restrict in production)
DO $$
BEGIN
  -- Teams policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'Allow all operations on teams') THEN
    CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Wrestlers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wrestlers' AND policyname = 'Allow all operations on wrestlers') THEN
    CREATE POLICY "Allow all operations on wrestlers" ON wrestlers FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Season records policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'season_records' AND policyname = 'Allow all operations on season_records') THEN
    CREATE POLICY "Allow all operations on season_records" ON season_records FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Match statistics policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_statistics' AND policyname = 'Allow all operations on match_statistics') THEN
    CREATE POLICY "Allow all operations on match_statistics" ON match_statistics FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Match updates policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_updates' AND policyname = 'Allow all operations on match_updates') THEN
    CREATE POLICY "Allow all operations on match_updates" ON match_updates FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Verify everything was created
SELECT 
    'TABLES CREATED:' as status,
    string_agg(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'wrestlers', 'season_records', 'match_statistics', 'match_updates');

-- SUCCESS MESSAGE
SELECT '✅ All tables created successfully! The 500 errors should be fixed now.' as message;