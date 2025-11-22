-- Calendar Integration: Events & Practices with Peak Performance Planning
-- Created: 2025-11-22
-- SAFE VERSION: Handles existing tables

-- ==========================================
-- DROP existing tables if they have wrong structure
-- ==========================================
DROP TABLE IF EXISTS season_phases CASCADE;
DROP TABLE IF EXISTS practices CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- ==========================================
-- EVENTS TABLE (Tournaments, Duals, etc.)
-- ==========================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

    -- Basic Info
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- dual, tournament, scrimmage, conference, sectional, regional, state, camp, clinic
    date DATE NOT NULL,
    end_date DATE, -- For multi-day tournaments
    start_time TIME,
    end_time TIME,

    -- Location
    location TEXT, -- Venue name
    address TEXT, -- Full address
    home_away TEXT DEFAULT 'away', -- home, away, neutral

    -- Opponent (for duals)
    opponent_team TEXT,
    opponent_record TEXT, -- "12-3" for scouting

    -- Logistics
    weigh_in_time TIME,
    bus_departure_time TIME,
    bus_return_time TIME,
    attire TEXT, -- "Singlet A", "Warmups", etc.

    -- ==========================================
    -- PEAK PERFORMANCE / IMPORTANCE LEVELS
    -- ==========================================
    importance INTEGER DEFAULT 3 CHECK (importance >= 1 AND importance <= 5),
    -- 1 = Low (scrimmage, JV only)
    -- 2 = Medium-Low (early season dual)
    -- 3 = Medium (regular season tournament)
    -- 4 = High (conference, rivalry, important qualifier)
    -- 5 = Peak (sectional, regional, state, national)

    peak_event BOOLEAN DEFAULT FALSE, -- Mark as peak performance event
    periodization_phase TEXT, -- prep, competition, taper, peak, recovery
    days_out_from_peak INTEGER, -- Calculated: days until next peak event

    -- For AI practice planning
    preparation_notes TEXT, -- What to focus on leading up
    opponent_scouting JSONB, -- Opponent strengths/weaknesses
    weight_management_notes TEXT, -- Special weight considerations

    -- Results (filled after event)
    status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, postponed
    team_score_us INTEGER,
    team_score_them INTEGER,
    team_placement INTEGER, -- For tournaments (1st, 2nd, etc.)
    placers JSONB, -- Array of {wrestler_id, place, weight_class}
    highlights TEXT, -- Post-event notes

    -- Metadata
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX idx_events_team ON events(team_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_importance ON events(importance);
CREATE INDEX idx_events_peak ON events(peak_event);
CREATE INDEX idx_events_status ON events(status);

-- ==========================================
-- PRACTICES TABLE
-- ==========================================

CREATE TABLE practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

    -- Scheduling
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Practice Type
    type TEXT DEFAULT 'regular', -- regular, light, competition_prep, technique, conditioning, film_study, recovery, weigh_in_only
    intensity INTEGER DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5), -- 1=recovery, 5=max intensity

    -- Location
    location TEXT,

    -- Focus Areas (for AI to reference)
    focus_areas TEXT[], -- Array: ['takedowns', 'escapes', 'conditioning', etc.]
    technique_focus TEXT[], -- Specific techniques: ['double leg', 'stand up', 'cradle']

    -- Structure (minutes)
    warmup_minutes INTEGER DEFAULT 15,
    technique_minutes INTEGER DEFAULT 30,
    drilling_minutes INTEGER DEFAULT 20,
    live_wrestling_minutes INTEGER DEFAULT 20,
    conditioning_minutes INTEGER DEFAULT 15,
    cooldown_minutes INTEGER DEFAULT 10,

    -- Periodization / Peak Performance
    periodization_phase TEXT, -- prep, build, competition, taper, peak, recovery
    days_out_from_peak INTEGER, -- Days until next peak event
    target_event_id UUID REFERENCES events(id), -- Which event this practice is preparing for

    -- AI Generation
    ai_generated BOOLEAN DEFAULT FALSE,
    generation_prompt TEXT,
    based_on_stats JSONB, -- Stats that influenced the practice plan
    coach_modified BOOLEAN DEFAULT FALSE, -- Did coach modify AI plan?

    -- Attendance (filled after practice)
    attendance JSONB, -- {present: [], absent: [], excused: []}

    -- Post-Practice Notes
    notes TEXT,
    what_went_well TEXT,
    areas_to_improve TEXT,
    injuries_reported JSONB, -- Any injuries during practice

    -- Coach
    coach_id UUID,

    -- Metadata
    status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for practices
CREATE INDEX idx_practices_team ON practices(team_id);
CREATE INDEX idx_practices_date ON practices(date);
CREATE INDEX idx_practices_type ON practices(type);
CREATE INDEX idx_practices_phase ON practices(periodization_phase);
CREATE INDEX idx_practices_target_event ON practices(target_event_id);

-- ==========================================
-- SEASON PERIODIZATION TABLE
-- For AI to understand training phases
-- ==========================================

CREATE TABLE season_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    season_id UUID,  -- Optional reference to seasons table

    name TEXT NOT NULL, -- "Early Season Build", "Conference Prep", "Post-Season Peak"
    phase_type TEXT NOT NULL, -- prep, build, competition, taper, peak, recovery
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Training Parameters
    intensity_target INTEGER DEFAULT 3, -- 1-5
    volume_target INTEGER DEFAULT 3, -- 1-5 (how much training)
    technique_focus TEXT[], -- What to work on
    conditioning_focus TEXT[], -- Type of conditioning

    -- Goals
    goals TEXT[],
    peak_events UUID[], -- Events to peak for in this phase

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_season_phases_team ON season_phases(team_id);
CREATE INDEX idx_season_phases_dates ON season_phases(start_date, end_date);

-- ==========================================
-- HELPER FUNCTION: Calculate days to peak
-- ==========================================

CREATE OR REPLACE FUNCTION calculate_days_to_peak(p_team_id UUID, p_date DATE)
RETURNS INTEGER AS $$
DECLARE
    next_peak_date DATE;
BEGIN
    SELECT MIN(date) INTO next_peak_date
    FROM events
    WHERE team_id = p_team_id
      AND date >= p_date
      AND (peak_event = TRUE OR importance >= 4);

    IF next_peak_date IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN next_peak_date - p_date;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE events IS 'Calendar events: tournaments, duals, scrimmages with importance levels for peak performance planning';
COMMENT ON COLUMN events.importance IS '1=Low (JV), 2=Med-Low, 3=Medium, 4=High (conference), 5=Peak (state)';
COMMENT ON COLUMN events.peak_event IS 'Mark events where athletes should peak (state, regionals, etc.)';
COMMENT ON COLUMN events.periodization_phase IS 'Training phase: prep, build, competition, taper, peak, recovery';

COMMENT ON TABLE practices IS 'Practice sessions with structure for AI-powered planning';
COMMENT ON COLUMN practices.intensity IS '1=recovery, 2=light, 3=medium, 4=hard, 5=max';
COMMENT ON COLUMN practices.periodization_phase IS 'Training phase this practice is part of';
COMMENT ON COLUMN practices.target_event_id IS 'Which upcoming event this practice is preparing for';

COMMENT ON TABLE season_phases IS 'Training periodization phases within a season';
