# Supabase Migration Instructions

## How to Run This Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL below
4. Click "Run" to execute

## Migration SQL for Video-Scoring Sync

```sql
-- Create match_events table
CREATE TABLE IF NOT EXISTS match_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID,
  timestamp BIGINT,
  video_timestamp INTEGER,
  event_type TEXT NOT NULL,
  wrestler_id TEXT NOT NULL,
  wrestler_name TEXT,
  points INTEGER DEFAULT 0,
  description TEXT,
  period INTEGER DEFAULT 1,
  event_time INTEGER,
  move_name TEXT,
  from_position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_timestamp ON match_events(timestamp);

-- Create match_videos table
CREATE TABLE IF NOT EXISTS match_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID,
  cloudflare_video_id TEXT NOT NULL,
  video_url TEXT,
  duration INTEGER,
  recording_started_at TIMESTAMPTZ,
  recording_ended_at TIMESTAMPTZ,
  processed BOOLEAN DEFAULT FALSE,
  watermarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_match_videos_match_id ON match_videos(match_id);
CREATE INDEX IF NOT EXISTS idx_match_videos_cloudflare_id ON match_videos(cloudflare_video_id);

-- Grant permissions
GRANT ALL ON match_events TO authenticated;
GRANT ALL ON match_videos TO authenticated;
GRANT ALL ON match_events TO anon;
GRANT ALL ON match_videos TO anon;
```

## If You Get Trigger Errors

If you see errors about triggers already existing, that's OK! It means they were created before. You can safely ignore those errors.

## To Drop and Recreate (if needed)

If you need to start fresh, run this first:

```sql
-- BE CAREFUL: This will delete all data in these tables!
DROP TABLE IF EXISTS match_events CASCADE;
DROP TABLE IF EXISTS match_videos CASCADE;
```

Then run the creation SQL above.

## Verify Tables Were Created

After running the migration, verify with:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('match_events', 'match_videos');

-- Check match_events structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_events' 
ORDER BY ordinal_position;

-- Check match_videos structure  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_videos' 
ORDER BY ordinal_position;
```

## Test Insert

Test that everything works:

```sql
-- Test insert into match_events
INSERT INTO match_events (
  match_id,
  timestamp,
  video_timestamp,
  event_type,
  wrestler_id,
  wrestler_name,
  points,
  description,
  period
) VALUES (
  gen_random_uuid(),
  1234567890,
  15,
  'takedown',
  'wrestler1',
  'Test Wrestler',
  2,
  'Test Wrestler - Takedown +2',
  1
);

-- Check it was inserted
SELECT * FROM match_events ORDER BY created_at DESC LIMIT 1;

-- Clean up test data
DELETE FROM match_events WHERE wrestler_name = 'Test Wrestler';
```

## Success!

Once the tables are created, the video-scoring synchronization system will:
1. Save scoring events with timestamps during live scoring
2. Link videos to matches when uploaded
3. Allow synchronized playback in the Video Review page

The system will automatically start working with your next match!