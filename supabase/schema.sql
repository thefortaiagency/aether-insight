-- Aether Insight Wrestling Analytics Database Schema
-- Superior to MatBoss with AI-powered analytics and real-time capabilities

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For advanced indexing

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    school_name VARCHAR(255),
    division VARCHAR(50),
    conference VARCHAR(100),
    state VARCHAR(2),
    mascot VARCHAR(100),
    colors JSONB, -- {"primary": "#color", "secondary": "#color"}
    logo_url TEXT,
    coach_name VARCHAR(255),
    assistant_coaches JSONB, -- Array of assistant coach names
    home_venue VARCHAR(255),
    founded_year INTEGER,
    website_url TEXT,
    social_media JSONB, -- {"twitter": "@handle", "instagram": "@handle"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wrestlers table with comprehensive profile
CREATE TABLE wrestlers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    grade INTEGER CHECK (grade BETWEEN 7 AND 12),
    birth_date DATE,
    height_inches INTEGER,
    current_weight DECIMAL(5,2),
    certified_weight DECIMAL(5,2),
    weight_class INTEGER,
    years_experience INTEGER,
    dominant_position VARCHAR(20), -- neutral, top, bottom
    stance VARCHAR(10), -- orthodox, southpaw
    academic_gpa DECIMAL(3,2),
    eligibility_status VARCHAR(50) DEFAULT 'eligible',
    profile_photo_url TEXT,
    jersey_number INTEGER,
    hometown VARCHAR(255),
    previous_schools JSONB, -- Array of previous schools
    recruitment_status VARCHAR(50),
    college_interest JSONB, -- Array of interested colleges
    parent_contacts JSONB, -- Array of parent contact info
    medical_notes TEXT,
    dietary_restrictions TEXT,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_wrestler_team (team_id),
    INDEX idx_wrestler_weight_class (weight_class)
);

-- Weight history tracking
CREATE TABLE weight_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    body_fat_percentage DECIMAL(4,2),
    hydration_level VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    INDEX idx_weight_history_wrestler (wrestler_id),
    INDEX idx_weight_history_date (recorded_at)
);

-- Matches table with comprehensive tracking
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID,
    wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,
    opponent_wrestler_id UUID REFERENCES wrestlers(id),
    opponent_name VARCHAR(255), -- For external opponents
    opponent_team VARCHAR(255),
    match_date DATE NOT NULL,
    match_time TIME,
    match_type VARCHAR(50), -- dual, tournament, exhibition
    weight_class INTEGER,
    round VARCHAR(50), -- finals, semifinals, quarterfinals, etc
    mat_number INTEGER,
    
    -- Match outcome
    result VARCHAR(20), -- win, loss, draw, forfeit, medical_forfeit, dq
    win_type VARCHAR(50), -- pin, tech_fall, major_decision, decision, forfeit, dq, default
    
    -- Scoring by period
    period1_score_for INTEGER DEFAULT 0,
    period1_score_against INTEGER DEFAULT 0,
    period2_score_for INTEGER DEFAULT 0,
    period2_score_against INTEGER DEFAULT 0,
    period3_score_for INTEGER DEFAULT 0,
    period3_score_against INTEGER DEFAULT 0,
    overtime_score_for INTEGER DEFAULT 0,
    overtime_score_against INTEGER DEFAULT 0,
    
    -- Final scores
    final_score_for INTEGER,
    final_score_against INTEGER,
    
    -- Time tracking
    match_duration INTERVAL,
    pin_time TIME,
    riding_time_for INTERVAL,
    riding_time_against INTERVAL,
    
    -- Video and analytics
    video_url TEXT,
    cloudflare_video_id VARCHAR(255),
    highlights_generated BOOLEAN DEFAULT FALSE,
    ai_analysis_complete BOOLEAN DEFAULT FALSE,
    
    -- Notes
    coach_notes TEXT,
    referee_name VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_match_wrestler (wrestler_id),
    INDEX idx_match_date (match_date),
    INDEX idx_match_event (event_id)
);

-- Match events/moves tracking (granular move-by-move)
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    event_time INTERVAL NOT NULL, -- Time in match when event occurred
    period INTEGER CHECK (period BETWEEN 1 AND 4), -- 4 = overtime
    event_type VARCHAR(50) NOT NULL, -- takedown, escape, reversal, nearfall, penalty, etc
    points_scored INTEGER DEFAULT 0,
    wrestler_id UUID REFERENCES wrestlers(id),
    
    -- Move details
    move_name VARCHAR(100), -- single_leg, double_leg, high_c, etc
    move_category VARCHAR(50), -- takedown, escape, reversal, pin_attempt
    from_position VARCHAR(50), -- neutral, top, bottom
    to_position VARCHAR(50),
    
    -- Additional context
    success BOOLEAN DEFAULT TRUE,
    counter_move VARCHAR(100),
    video_timestamp INTEGER, -- Seconds in video
    ai_detected BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2), -- AI confidence 0-1
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_event_match (match_id),
    INDEX idx_event_time (event_time),
    INDEX idx_event_type (event_type)
);

-- Tournament/Event management
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50), -- tournament, dual_meet, tri_meet, quad
    host_team_id UUID REFERENCES teams(id),
    venue VARCHAR(255),
    address TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    weigh_in_time TIME,
    start_time TIME,
    entry_fee DECIMAL(10,2),
    max_entries_per_weight INTEGER,
    tournament_format VARCHAR(50), -- bracket, round_robin, pool_to_bracket
    scoring_system VARCHAR(50), -- standard, modified
    live_stream_url TEXT,
    results_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_event_date (start_date)
);

-- Practice sessions
CREATE TABLE practices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    practice_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    practice_type VARCHAR(50), -- regular, conditioning, technique, live_wrestling
    focus_areas JSONB, -- Array of focus areas
    planned_drills JSONB, -- Array of drill objects
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_practice_team (team_id),
    INDEX idx_practice_date (practice_date)
);

-- Practice attendance
CREATE TABLE practice_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
    wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,
    status VARCHAR(20), -- present, absent, late, excused, injured
    arrival_time TIME,
    departure_time TIME,
    participation_level VARCHAR(20), -- full, limited, observation
    notes TEXT,
    
    UNIQUE(practice_id, wrestler_id),
    INDEX idx_attendance_practice (practice_id),
    INDEX idx_attendance_wrestler (wrestler_id)
);

-- ==========================================
-- STATISTICS TABLES (MatBoss compatibility + enhancements)
-- ==========================================

-- Season statistics (aggregated)
CREATE TABLE wrestler_season_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,
    season_year INTEGER NOT NULL,
    
    -- Basic record
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    win_percentage DECIMAL(5,2),
    
    -- Win types
    pins INTEGER DEFAULT 0,
    tech_falls INTEGER DEFAULT 0,
    major_decisions INTEGER DEFAULT 0,
    decisions INTEGER DEFAULT 0,
    forfeits_received INTEGER DEFAULT 0,
    defaults_received INTEGER DEFAULT 0,
    disqualifications_received INTEGER DEFAULT 0,
    
    -- Loss types
    pinned INTEGER DEFAULT 0,
    tech_falled INTEGER DEFAULT 0,
    major_decisioned INTEGER DEFAULT 0,
    decisioned INTEGER DEFAULT 0,
    forfeited INTEGER DEFAULT 0,
    defaulted INTEGER DEFAULT 0,
    disqualified INTEGER DEFAULT 0,
    
    -- MatBoss Power Index
    mb_power_index DECIMAL(5,2),
    
    -- Bonus percentages
    bonus_rate_for DECIMAL(5,2),
    bonus_rate_against DECIMAL(5,2),
    
    -- Team points
    dual_meet_points_for DECIMAL(6,2),
    dual_meet_points_against DECIMAL(6,2),
    tournament_points DECIMAL(6,2),
    
    -- Position statistics
    neutral_takedowns_for INTEGER DEFAULT 0,
    neutral_takedowns_against INTEGER DEFAULT 0,
    neutral_takedown_percentage DECIMAL(5,2),
    first_takedown_count INTEGER DEFAULT 0,
    first_takedown_percentage DECIMAL(5,2),
    
    -- Bottom position
    escapes INTEGER DEFAULT 0,
    reversals INTEGER DEFAULT 0,
    bottom_points_for INTEGER DEFAULT 0,
    bottom_points_against INTEGER DEFAULT 0,
    
    -- Top position
    nearfall_2_count INTEGER DEFAULT 0,
    nearfall_3_count INTEGER DEFAULT 0,
    nearfall_4_count INTEGER DEFAULT 0,
    riding_time_points INTEGER DEFAULT 0,
    top_points_for INTEGER DEFAULT 0,
    top_points_against INTEGER DEFAULT 0,
    
    -- Period scoring
    period1_points_for INTEGER DEFAULT 0,
    period1_points_against INTEGER DEFAULT 0,
    period2_points_for INTEGER DEFAULT 0,
    period2_points_against INTEGER DEFAULT 0,
    period3_points_for INTEGER DEFAULT 0,
    period3_points_against INTEGER DEFAULT 0,
    overtime_points_for INTEGER DEFAULT 0,
    overtime_points_against INTEGER DEFAULT 0,
    
    -- Advanced metrics
    average_match_time INTERVAL,
    fastest_pin_time INTERVAL,
    total_match_time INTERVAL,
    conditioning_score DECIMAL(5,2), -- Based on period performance
    clutch_rating DECIMAL(5,2), -- Performance in close matches
    momentum_rating DECIMAL(5,2), -- Ability to come from behind
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(wrestler_id, season_year),
    INDEX idx_season_stats_wrestler (wrestler_id),
    INDEX idx_season_stats_year (season_year)
);

-- ==========================================
-- VIDEO & AI ANALYSIS TABLES
-- ==========================================

-- Video library
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cloudflare_id VARCHAR(255) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    video_type VARCHAR(50), -- match, practice, technique, highlight
    duration INTEGER, -- seconds
    file_size BIGINT, -- bytes
    resolution VARCHAR(20),
    fps INTEGER,
    thumbnail_url TEXT,
    stream_url TEXT,
    download_url TEXT,
    
    -- Associations
    match_id UUID REFERENCES matches(id),
    event_id UUID REFERENCES events(id),
    practice_id UUID REFERENCES practices(id),
    team_id UUID REFERENCES teams(id),
    
    -- Processing status
    upload_status VARCHAR(50) DEFAULT 'pending',
    processing_status VARCHAR(50) DEFAULT 'pending',
    ai_analysis_status VARCHAR(50) DEFAULT 'pending',
    highlights_generated BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    recorded_date DATE,
    uploaded_by UUID,
    tags JSONB, -- Array of tags
    is_public BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_video_match (match_id),
    INDEX idx_video_team (team_id),
    INDEX idx_video_cloudflare (cloudflare_id)
);

-- AI-detected moves and techniques
CREATE TABLE video_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50), -- move_detection, performance_analysis, scouting
    
    -- Detected moves
    detected_moves JSONB, -- Array of {timestamp, move, confidence, wrestler_id}
    
    -- Performance metrics
    aggression_score DECIMAL(5,2),
    technique_score DECIMAL(5,2),
    conditioning_score DECIMAL(5,2),
    position_control_score DECIMAL(5,2),
    
    -- Heat maps and positioning
    mat_coverage_data JSONB, -- Position heat map data
    dominant_positions JSONB, -- Most common positions
    
    -- Patterns and tendencies
    offensive_patterns JSONB,
    defensive_patterns JSONB,
    weakness_areas JSONB,
    strength_areas JSONB,
    
    -- Recommendations
    coaching_suggestions JSONB,
    technique_improvements JSONB,
    opponent_strategies JSONB,
    
    processing_time_ms INTEGER,
    model_version VARCHAR(50),
    confidence_score DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_analysis_video (video_id),
    INDEX idx_analysis_type (analysis_type)
);

-- ==========================================
-- SCOUTING & RECRUITMENT TABLES
-- ==========================================

-- Opponent scouting reports
CREATE TABLE scouting_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wrestler_id UUID REFERENCES wrestlers(id), -- Our wrestler
    opponent_name VARCHAR(255),
    opponent_team VARCHAR(255),
    opponent_wrestler_id UUID REFERENCES wrestlers(id), -- If in our system
    
    -- Opponent tendencies
    preferred_takedowns JSONB,
    escape_techniques JSONB,
    common_setups JSONB,
    favorite_positions JSONB,
    
    -- Weaknesses and strengths
    identified_weaknesses JSONB,
    identified_strengths JSONB,
    
    -- Strategy recommendations
    recommended_game_plan TEXT,
    moves_to_avoid JSONB,
    moves_to_attempt JSONB,
    
    -- Historical data
    previous_matches JSONB, -- Array of match IDs
    head_to_head_record JSONB,
    
    -- Video references
    video_clips JSONB, -- Array of video timestamps
    
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_scouting_wrestler (wrestler_id)
);

-- Recruitment prospects
CREATE TABLE recruitment_prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    graduation_year INTEGER,
    high_school VARCHAR(255),
    state VARCHAR(2),
    weight_class INTEGER,
    
    -- Performance data
    career_record VARCHAR(50),
    state_placements JSONB,
    national_rankings JSONB,
    
    -- Contact info
    email VARCHAR(255),
    phone VARCHAR(20),
    parent_contacts JSONB,
    coach_contact JSONB,
    
    -- Recruitment status
    interest_level VARCHAR(50), -- high, medium, low, committed_elsewhere
    recruitment_stage VARCHAR(50), -- identified, contacted, visiting, offered, committed
    visit_dates JSONB,
    scholarship_offered BOOLEAN DEFAULT FALSE,
    scholarship_amount DECIMAL(10,2),
    
    -- Notes and communications
    notes TEXT,
    communications_log JSONB,
    
    -- Academic info
    gpa DECIMAL(3,2),
    sat_score INTEGER,
    act_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_prospect_year (graduation_year),
    INDEX idx_prospect_interest (interest_level)
);

-- ==========================================
-- DRILL & TECHNIQUE LIBRARY
-- ==========================================

CREATE TABLE drills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- takedown, escape, conditioning, etc
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    duration_minutes INTEGER,
    description TEXT,
    key_points JSONB, -- Array of key coaching points
    common_mistakes JSONB,
    progressions JSONB, -- Array of progression steps
    video_url TEXT,
    diagram_url TEXT,
    equipment_needed JSONB,
    created_by UUID,
    is_public BOOLEAN DEFAULT TRUE,
    times_used INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_drill_category (category),
    INDEX idx_drill_public (is_public)
);

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_wrestlers_updated_at BEFORE UPDATE ON wrestlers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate MatBoss Power Index
CREATE OR REPLACE FUNCTION calculate_mb_power_index(
    wins INTEGER,
    losses INTEGER,
    pins INTEGER,
    tech_falls INTEGER,
    major_decisions INTEGER
) RETURNS DECIMAL AS $$
DECLARE
    total_matches INTEGER;
    win_percentage DECIMAL;
    bonus_points DECIMAL;
BEGIN
    total_matches := wins + losses;
    IF total_matches = 0 THEN
        RETURN 0;
    END IF;
    
    win_percentage := wins::DECIMAL / total_matches;
    bonus_points := (pins * 6 + tech_falls * 5 + major_decisions * 4)::DECIMAL / total_matches;
    
    RETURN ROUND(win_percentage * 3 + bonus_points - 3, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to get wrestler's current streak
CREATE OR REPLACE FUNCTION get_wrestler_streak(wrestler_uuid UUID)
RETURNS TABLE(streak_type VARCHAR, streak_count INTEGER) AS $$
DECLARE
    last_result VARCHAR;
    current_streak INTEGER := 0;
    streak_type VARCHAR;
BEGIN
    SELECT result INTO last_result
    FROM matches
    WHERE wrestler_id = wrestler_uuid
    ORDER BY match_date DESC, created_at DESC
    LIMIT 1;
    
    IF last_result = 'win' THEN
        streak_type := 'W';
    ELSE
        streak_type := 'L';
    END IF;
    
    SELECT COUNT(*) INTO current_streak
    FROM (
        SELECT result,
               ROW_NUMBER() OVER (ORDER BY match_date DESC, created_at DESC) as rn,
               ROW_NUMBER() OVER (PARTITION BY result ORDER BY match_date DESC, created_at DESC) as grp
        FROM matches
        WHERE wrestler_id = wrestler_uuid
    ) t
    WHERE result = last_result
    AND rn = grp;
    
    RETURN QUERY SELECT streak_type, current_streak;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Text search indexes
CREATE INDEX idx_wrestlers_name_search ON wrestlers USING gin(
    (first_name || ' ' || last_name) gin_trgm_ops
);

CREATE INDEX idx_teams_name_search ON teams USING gin(
    name gin_trgm_ops
);

-- Date range indexes for quick filtering
CREATE INDEX idx_matches_date_range ON matches USING btree(match_date);
CREATE INDEX idx_weight_history_date_range ON weight_history USING btree(recorded_at);

-- Composite indexes for common queries
CREATE INDEX idx_matches_wrestler_date ON matches(wrestler_id, match_date DESC);
CREATE INDEX idx_events_team_date ON events(host_team_id, start_date DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies (example for teams table)
CREATE POLICY "Teams are viewable by everyone" ON teams
    FOR SELECT USING (true);

CREATE POLICY "Teams are editable by team coaches" ON teams
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM team_coaches WHERE team_id = teams.id
    ));

-- ==========================================
-- INITIAL DATA / ENUMS
-- ==========================================

-- Weight classes
CREATE TABLE weight_classes (
    id SERIAL PRIMARY KEY,
    weight INTEGER UNIQUE NOT NULL,
    name VARCHAR(20),
    division VARCHAR(50) -- high_school, college, youth
);

INSERT INTO weight_classes (weight, name, division) VALUES
(106, '106 lbs', 'high_school'),
(113, '113 lbs', 'high_school'),
(120, '120 lbs', 'high_school'),
(126, '126 lbs', 'high_school'),
(132, '132 lbs', 'high_school'),
(138, '138 lbs', 'high_school'),
(145, '145 lbs', 'high_school'),
(152, '152 lbs', 'high_school'),
(160, '160 lbs', 'high_school'),
(170, '170 lbs', 'high_school'),
(182, '182 lbs', 'high_school'),
(195, '195 lbs', 'high_school'),
(220, '220 lbs', 'high_school'),
(285, '285 lbs', 'high_school');

-- Move categories
CREATE TABLE move_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    points_value INTEGER DEFAULT 0,
    description TEXT
);

INSERT INTO move_categories (name, category, points_value, description) VALUES
('single_leg', 'takedown', 2, 'Single leg takedown'),
('double_leg', 'takedown', 2, 'Double leg takedown'),
('high_crotch', 'takedown', 2, 'High crotch takedown'),
('ankle_pick', 'takedown', 2, 'Ankle pick'),
('escape', 'escape', 1, 'Escape from bottom position'),
('reversal', 'reversal', 2, 'Reversal from bottom position'),
('nearfall_2', 'nearfall', 2, '2-point near fall'),
('nearfall_3', 'nearfall', 3, '3-point near fall'),
('nearfall_4', 'nearfall', 4, '4-point near fall'),
('penalty', 'penalty', 1, 'Penalty point'),
('stalling', 'penalty', 1, 'Stalling warning/point');

-- Create materialized view for team rankings
CREATE MATERIALIZED VIEW team_rankings AS
SELECT 
    t.id,
    t.name,
    t.state,
    COUNT(DISTINCT w.id) as roster_size,
    COUNT(m.id) as total_matches,
    SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END) as total_wins,
    SUM(CASE WHEN m.result = 'loss' THEN 1 ELSE 0 END) as total_losses,
    ROUND(
        SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END)::DECIMAL / 
        NULLIF(COUNT(m.id), 0) * 100, 2
    ) as win_percentage,
    SUM(CASE WHEN m.win_type = 'pin' THEN 1 ELSE 0 END) as total_pins,
    AVG(wss.mb_power_index) as avg_power_index
FROM teams t
LEFT JOIN wrestlers w ON w.team_id = t.id
LEFT JOIN matches m ON m.wrestler_id = w.id
LEFT JOIN wrestler_season_stats wss ON wss.wrestler_id = w.id 
    AND wss.season_year = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY t.id, t.name, t.state
ORDER BY win_percentage DESC NULLS LAST;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_team_rankings()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY team_rankings;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- PERMISSIONS AND GRANTS
-- ==========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant appropriate permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;