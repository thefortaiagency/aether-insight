-- Check which tables exist
-- Run this in Supabase Dashboard -> SQL Editor to see what's already created

-- Check for tables
SELECT 
    'TABLES' as category,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'matches',
    'match_events', 
    'match_statistics', 
    'match_updates', 
    'teams', 
    'wrestlers', 
    'season_records'
)
ORDER BY table_name;

-- Check for RLS policies
SELECT 
    'POLICIES' as category,
    tablename,
    policyname,
    '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'matches',
    'match_events',
    'match_statistics', 
    'match_updates', 
    'teams', 
    'wrestlers', 
    'season_records'
)
ORDER BY tablename, policyname;

-- Count records in each table
SELECT 
    'RECORD COUNT' as category,
    table_name,
    (xpath('/row/count/text()', 
           query_to_xml('SELECT COUNT(*) FROM ' || table_name, true, true, '')))[1]::text::int AS record_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'matches',
    'match_events', 
    'match_statistics', 
    'match_updates', 
    'teams', 
    'wrestlers', 
    'season_records'
)
ORDER BY table_name;