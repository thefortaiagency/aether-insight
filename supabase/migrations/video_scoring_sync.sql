-- Migration for Video-Scoring Synchronization
-- This script safely creates tables and triggers, checking if they exist first

-- 1. Create match_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS match_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL, -- Unix timestamp in milliseconds
  video_timestamp INTEGER, -- Seconds from video start
  event_type TEXT NOT NULL, -- takedown, escape, reversal, near_fall, penalty, etc.
  wrestler_id TEXT NOT NULL, -- 'wrestler1' or 'wrestler2'
  wrestler_name TEXT,
  points INTEGER DEFAULT 0,
  description TEXT,
  period INTEGER DEFAULT 1,
  event_time INTEGER, -- Time elapsed in period (seconds)
  move_name TEXT,
  from_position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_timestamp ON match_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_match_events_created_at ON match_events(created_at);

-- 3. Create match_videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS match_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  cloudflare_video_id TEXT NOT NULL,
  video_url TEXT,
  duration INTEGER, -- Duration in seconds
  recording_started_at TIMESTAMP WITH TIME ZONE,
  recording_ended_at TIMESTAMP WITH TIME ZONE,
  processed BOOLEAN DEFAULT FALSE,
  watermarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for match_videos
CREATE INDEX IF NOT EXISTS idx_match_videos_match_id ON match_videos(match_id);
CREATE INDEX IF NOT EXISTS idx_match_videos_cloudflare_id ON match_videos(cloudflare_video_id);

-- 5. Add video-related columns to matches table if they don't exist
DO $$ 
BEGIN
  -- Add video_start_time if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'video_start_time'
  ) THEN
    ALTER TABLE matches ADD COLUMN video_start_time TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add video_end_time if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'video_end_time'
  ) THEN
    ALTER TABLE matches ADD COLUMN video_end_time TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add has_video flag if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'has_video'
  ) THEN
    ALTER TABLE matches ADD COLUMN has_video BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 6. Create or replace function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers only if they don't exist
DO $$ 
BEGIN
  -- Trigger for match_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_match_events_updated_at'
  ) THEN
    CREATE TRIGGER update_match_events_updated_at
      BEFORE UPDATE ON match_events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Trigger for match_videos
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_match_videos_updated_at'
  ) THEN
    CREATE TRIGGER update_match_videos_updated_at
      BEFORE UPDATE ON match_videos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 8. Grant permissions (adjust based on your Supabase setup)
GRANT ALL ON match_events TO authenticated;
GRANT ALL ON match_videos TO authenticated;
GRANT ALL ON match_events TO anon;
GRANT ALL ON match_videos TO anon;

-- 9. Enable Row Level Security (optional but recommended)
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_videos ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for authenticated users
CREATE POLICY "Users can view all match events" ON match_events
  FOR SELECT USING (true);

CREATE POLICY "Users can insert match events" ON match_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update match events" ON match_events
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete match events" ON match_events
  FOR DELETE USING (true);

CREATE POLICY "Users can view all match videos" ON match_videos
  FOR SELECT USING (true);

CREATE POLICY "Users can insert match videos" ON match_videos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update match videos" ON match_videos
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete match videos" ON match_videos
  FOR DELETE USING (true);

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Video-scoring synchronization tables and triggers created successfully!';
END $$;