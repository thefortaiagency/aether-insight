-- Mat Ops Integration Migration
-- Adds fields needed for USABracketing sync integration

-- Add USABracketing ID to wrestlers table
ALTER TABLE wrestlers
ADD COLUMN IF NOT EXISTS usab_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS track_id TEXT,
ADD COLUMN IF NOT EXISTS imported_from TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Add sync tracking to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS usab_match_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS imported_from TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS sync_timestamp TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wrestlers_usab_id ON wrestlers(usab_id);
CREATE INDEX IF NOT EXISTS idx_wrestlers_track_id ON wrestlers(track_id);
CREATE INDEX IF NOT EXISTS idx_matches_usab_match_id ON matches(usab_match_id);
CREATE INDEX IF NOT EXISTS idx_matches_imported_from ON matches(imported_from);

-- Create Mat Ops sync log table
CREATE TABLE IF NOT EXISTS matops_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT NOT NULL, -- 'USABracketing', 'TrackWrestling', 'FloArena'
  wrestlers_synced INTEGER DEFAULT 0,
  matches_synced INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_details JSONB,
  sync_duration_ms INTEGER,
  user_agent TEXT,
  extension_version TEXT,
  success BOOLEAN DEFAULT TRUE,
  team_id UUID REFERENCES teams(id),
  synced_data JSONB -- Store the raw data for debugging
);

CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp ON matops_sync_log(sync_timestamp);
CREATE INDEX IF NOT EXISTS idx_sync_log_source ON matops_sync_log(source);
CREATE INDEX IF NOT EXISTS idx_sync_log_team ON matops_sync_log(team_id);

-- Add comment explaining Mat Ops integration
COMMENT ON TABLE matops_sync_log IS 'Tracks all syncs from Mat Ops Chrome extension and other wrestling stat sources';
COMMENT ON COLUMN wrestlers.usab_id IS 'USABracketing wrestler unique identifier for sync matching';
COMMENT ON COLUMN wrestlers.track_id IS 'TrackWrestling wrestler unique identifier for sync matching';
COMMENT ON COLUMN matches.usab_match_id IS 'USABracketing match unique identifier to prevent duplicates';
