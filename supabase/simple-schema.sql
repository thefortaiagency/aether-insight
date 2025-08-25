-- Aether Insight Wrestling Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  school VARCHAR(255),
  division VARCHAR(50),
  conference VARCHAR(100),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Wrestlers table
CREATE TABLE IF NOT EXISTS wrestlers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  grade INTEGER CHECK (grade >= 7 AND grade <= 12),
  weight_class INTEGER,
  actual_weight DECIMAL(5,2),
  birth_date DATE,
  email VARCHAR(255),
  phone VARCHAR(20),
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  match_type VARCHAR(20),
  weight_class INTEGER NOT NULL,
  wrestler1_id UUID REFERENCES wrestlers(id),
  wrestler2_id UUID REFERENCES wrestlers(id),
  wrestler1_name VARCHAR(255),
  wrestler2_name VARCHAR(255),
  wrestler1_team VARCHAR(255),
  wrestler2_team VARCHAR(255),
  wrestler1_color VARCHAR(10),
  wrestler2_color VARCHAR(10),
  winner_id UUID REFERENCES wrestlers(id),
  win_type VARCHAR(20),
  final_score_wrestler1 INTEGER DEFAULT 0,
  final_score_wrestler2 INTEGER DEFAULT 0,
  match_duration INTEGER,
  periods_wrestled INTEGER DEFAULT 3,
  tournament_name VARCHAR(255),
  mat_number VARCHAR(10),
  referee VARCHAR(100),
  video_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Match Events table (for detailed scoring tracking)
CREATE TABLE IF NOT EXISTS match_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  event_time INTEGER NOT NULL,
  period INTEGER NOT NULL CHECK (period >= 1 AND period <= 6),
  event_type VARCHAR(30) NOT NULL,
  wrestler_id UUID REFERENCES wrestlers(id),
  wrestler_name VARCHAR(255),
  points INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Match Statistics table
CREATE TABLE IF NOT EXISTS match_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
  wrestler_id UUID REFERENCES wrestlers(id),
  wrestler_name VARCHAR(255),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Season Records table
CREATE TABLE IF NOT EXISTS season_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  pins INTEGER DEFAULT 0,
  tech_falls INTEGER DEFAULT 0,
  major_decisions INTEGER DEFAULT 0,
  team_points DECIMAL(5,2) DEFAULT 0,
  tournament_placements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Videos table (for match recordings)
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  cloudflare_id VARCHAR(255),
  url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  upload_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wrestlers_team_id ON wrestlers(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_wrestler1 ON matches(wrestler1_id);
CREATE INDEX IF NOT EXISTS idx_matches_wrestler2 ON matches(wrestler2_id);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_season_records_wrestler_id ON season_records(wrestler_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wrestlers_updated_at ON wrestlers;
CREATE TRIGGER update_wrestlers_updated_at BEFORE UPDATE ON wrestlers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_match_statistics_updated_at ON match_statistics;
CREATE TRIGGER update_match_statistics_updated_at BEFORE UPDATE ON match_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_season_records_updated_at ON season_records;
CREATE TRIGGER update_season_records_updated_at BEFORE UPDATE ON season_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can make these more restrictive later)
CREATE POLICY "Enable all access for teams" ON teams
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for wrestlers" ON wrestlers
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for matches" ON matches
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for match_events" ON match_events
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for match_statistics" ON match_statistics
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for season_records" ON season_records
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for videos" ON videos
    FOR ALL USING (true) WITH CHECK (true);