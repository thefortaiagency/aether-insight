-- Complete setup script for all missing tables
-- Safe to run multiple times - only creates what's missing
-- Run this in Supabase Dashboard -> SQL Editor

-- ============================================
-- CHECK AND CREATE MATCH_STATISTICS TABLE
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_statistics') THEN
        CREATE TABLE match_statistics (
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
        RAISE NOTICE 'Created match_statistics table';
    ELSE
        RAISE NOTICE 'match_statistics table already exists';
    END IF;
END $$;

-- ============================================
-- CHECK AND CREATE MATCH_UPDATES TABLE
-- ============================================
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

-- ============================================
-- CHECK AND CREATE TEAMS TABLE
-- ============================================
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

-- ============================================
-- CHECK AND CREATE WRESTLERS TABLE
-- ============================================
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

-- ============================================
-- CHECK AND CREATE SEASON_RECORDS TABLE
-- ============================================
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

-- ============================================
-- CREATE INDEXES (SAFE IF ALREADY EXIST)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_wrestler_name ON match_statistics(wrestler_name);
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_created_at ON match_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wrestlers_team_id ON wrestlers(team_id);
CREATE INDEX IF NOT EXISTS idx_wrestlers_weight_class ON wrestlers(weight_class);
CREATE INDEX IF NOT EXISTS idx_season_records_wrestler_id ON season_records(wrestler_id);

-- ============================================
-- ENABLE RLS (SAFE IF ALREADY ENABLED)
-- ============================================
ALTER TABLE match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES (ONLY IF NOT EXIST)
-- ============================================
DO $$
BEGIN
    -- Check and create policy for match_statistics
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'match_statistics' 
        AND policyname = 'Allow all operations on match_statistics'
    ) THEN
        CREATE POLICY "Allow all operations on match_statistics" 
        ON match_statistics 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'Created policy for match_statistics';
    ELSE
        RAISE NOTICE 'Policy for match_statistics already exists';
    END IF;

    -- Check and create policy for match_updates
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'match_updates' 
        AND policyname = 'Allow all operations on match_updates'
    ) THEN
        CREATE POLICY "Allow all operations on match_updates" 
        ON match_updates 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'Created policy for match_updates';
    ELSE
        RAISE NOTICE 'Policy for match_updates already exists';
    END IF;

    -- Check and create policy for teams
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'teams' 
        AND policyname = 'Allow all operations on teams'
    ) THEN
        CREATE POLICY "Allow all operations on teams" 
        ON teams 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'Created policy for teams';
    ELSE
        RAISE NOTICE 'Policy for teams already exists';
    END IF;

    -- Check and create policy for wrestlers
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'wrestlers' 
        AND policyname = 'Allow all operations on wrestlers'
    ) THEN
        CREATE POLICY "Allow all operations on wrestlers" 
        ON wrestlers 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'Created policy for wrestlers';
    ELSE
        RAISE NOTICE 'Policy for wrestlers already exists';
    END IF;

    -- Check and create policy for season_records
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'season_records' 
        AND policyname = 'Allow all operations on season_records'
    ) THEN
        CREATE POLICY "Allow all operations on season_records" 
        ON season_records 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'Created policy for season_records';
    ELSE
        RAISE NOTICE 'Policy for season_records already exists';
    END IF;
END $$;

-- ============================================
-- GRANT PERMISSIONS (SAFE TO RUN MULTIPLE TIMES)
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================
-- VERIFY SETUP
-- ============================================
SELECT 'VERIFICATION RESULTS:' as status;

-- Check tables
SELECT 
    'TABLES' as category,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('matches', 'match_events', 'match_statistics', 'match_updates', 'teams', 'wrestlers', 'season_records')
ORDER BY table_name;

-- Check policies
SELECT 
    'POLICIES' as category,
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS POLICIES'
        ELSE '❌ NO POLICIES'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('match_statistics', 'match_updates', 'teams', 'wrestlers', 'season_records')
GROUP BY tablename
ORDER BY tablename;

-- Count records (to see if tables have data)
DO $$
DECLARE
    rec RECORD;
    count_val INTEGER;
BEGIN
    RAISE NOTICE 'RECORD COUNTS:';
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('matches', 'match_events', 'match_statistics', 'match_updates', 'teams', 'wrestlers', 'season_records')
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', rec.table_name) INTO count_val;
        RAISE NOTICE '  % - % records', rec.table_name, count_val;
    END LOOP;
END $$;

-- Final success message
SELECT '✅ Database setup complete! All tables and policies are configured.' as message;