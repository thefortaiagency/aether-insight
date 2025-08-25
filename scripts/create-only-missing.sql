-- This script only creates tables that don't exist
-- Safe to run multiple times

-- Create teams table if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') THEN
        CREATE TABLE teams (
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
        RAISE NOTICE 'Created teams table';
    ELSE
        RAISE NOTICE 'teams table already exists';
    END IF;
END $$;

-- Create wrestlers table if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wrestlers') THEN
        CREATE TABLE wrestlers (
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
        RAISE NOTICE 'Created wrestlers table';
    ELSE
        RAISE NOTICE 'wrestlers table already exists';
    END IF;
END $$;

-- Create season_records table if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'season_records') THEN
        CREATE TABLE season_records (
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
        RAISE NOTICE 'Created season_records table';
    ELSE
        RAISE NOTICE 'season_records table already exists';
    END IF;
END $$;

-- Create match_updates table if missing (seems to be missing based on earlier errors)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_updates') THEN
        CREATE TABLE match_updates (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
            update_type TEXT NOT NULL,
            data JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Created match_updates table';
    ELSE
        RAISE NOTICE 'match_updates table already exists';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_wrestlers_team_id ON wrestlers(team_id);
CREATE INDEX IF NOT EXISTS idx_wrestlers_weight_class ON wrestlers(weight_class);
CREATE INDEX IF NOT EXISTS idx_season_records_wrestler_id ON season_records(wrestler_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_created_at ON match_updates(created_at DESC);

-- Grant permissions (safe to run multiple times)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Final check
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Table exists'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'wrestlers', 'season_records', 'match_updates')
ORDER BY table_name;