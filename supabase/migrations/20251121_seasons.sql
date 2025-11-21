-- Aether Insights - Seasons Migration
-- Adds seasons support for High School, Middle School, Off-Season tracking

-- ==========================================
-- SEASONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

    -- Season identification
    name TEXT NOT NULL, -- "2024-25 High School", "2024-25 Middle School", "Summer 2025 Club"
    season_type TEXT NOT NULL CHECK (season_type IN ('high_school', 'middle_school', 'club', 'offseason')),
    year_start INTEGER NOT NULL, -- 2024
    year_end INTEGER, -- 2025 (null for single-year like summer)

    -- Dates
    start_date DATE,
    end_date DATE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_current BOOLEAN DEFAULT FALSE, -- Only one season per team should be current

    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique season per team/type/year
    UNIQUE(team_id, season_type, year_start)
);

CREATE INDEX IF NOT EXISTS idx_seasons_team ON seasons(team_id);
CREATE INDEX IF NOT EXISTS idx_seasons_current ON seasons(team_id, is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_seasons_type ON seasons(season_type);

-- ==========================================
-- SEASON ROSTERS (wrestlers assigned to seasons)
-- ==========================================

CREATE TABLE IF NOT EXISTS season_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,

    -- Season-specific info
    weight_class INTEGER,
    is_varsity BOOLEAN DEFAULT TRUE,
    is_starter BOOLEAN DEFAULT FALSE,
    jersey_number TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- A wrestler can only be on a roster once per season
    UNIQUE(season_id, wrestler_id)
);

CREATE INDEX IF NOT EXISTS idx_roster_season ON season_rosters(season_id);
CREATE INDEX IF NOT EXISTS idx_roster_wrestler ON season_rosters(wrestler_id);

-- ==========================================
-- SEASON STATS (aggregated per wrestler per season)
-- ==========================================

CREATE TABLE IF NOT EXISTS season_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,

    -- Record
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,

    -- Win Types
    pins INTEGER DEFAULT 0,
    tech_falls INTEGER DEFAULT 0,
    major_decisions INTEGER DEFAULT 0,
    decisions INTEGER DEFAULT 0,
    forfeits_won INTEGER DEFAULT 0,

    -- Loss Types
    pins_against INTEGER DEFAULT 0,
    tech_falls_against INTEGER DEFAULT 0,
    major_decisions_against INTEGER DEFAULT 0,
    decisions_against INTEGER DEFAULT 0,
    forfeits_lost INTEGER DEFAULT 0,

    -- Scoring Stats (cumulative for season)
    takedowns INTEGER DEFAULT 0,
    takedowns_against INTEGER DEFAULT 0,
    escapes INTEGER DEFAULT 0,
    escapes_against INTEGER DEFAULT 0,
    reversals INTEGER DEFAULT 0,
    reversals_against INTEGER DEFAULT 0,
    near_fall_2 INTEGER DEFAULT 0,
    near_fall_2_against INTEGER DEFAULT 0,
    near_fall_3 INTEGER DEFAULT 0,
    near_fall_3_against INTEGER DEFAULT 0,
    near_fall_4 INTEGER DEFAULT 0,
    near_fall_4_against INTEGER DEFAULT 0,

    -- Points
    total_points_scored INTEGER DEFAULT 0,
    total_points_against INTEGER DEFAULT 0,
    team_points_earned INTEGER DEFAULT 0,

    -- Penalties
    penalties INTEGER DEFAULT 0,
    stalling_calls INTEGER DEFAULT 0,

    -- Calculated fields (updated via triggers or on save)
    win_percentage DECIMAL(5,2),
    pin_percentage DECIMAL(5,2),
    bonus_percentage DECIMAL(5,2), -- % of wins that are bonus (pin, tech, major)

    -- Timestamps
    last_match_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(season_id, wrestler_id)
);

CREATE INDEX IF NOT EXISTS idx_season_stats_season ON season_stats(season_id);
CREATE INDEX IF NOT EXISTS idx_season_stats_wrestler ON season_stats(wrestler_id);

-- ==========================================
-- ADD SEASON_ID TO MATCHES
-- ==========================================

ALTER TABLE matches
ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id);

CREATE INDEX IF NOT EXISTS idx_matches_season ON matches(season_id);

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE seasons IS 'Wrestling seasons (HS, MS, Club, Off-season) by year';
COMMENT ON TABLE season_rosters IS 'Wrestlers assigned to specific season rosters';
COMMENT ON TABLE season_stats IS 'Aggregated statistics per wrestler per season';
COMMENT ON COLUMN seasons.season_type IS 'high_school, middle_school, club, offseason';
COMMENT ON COLUMN season_stats.bonus_percentage IS 'Percentage of wins by pin, tech fall, or major decision';
