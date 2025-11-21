-- Aether Insights - Coaching Tables Migration
-- Adds coaches accounts and AI coaching insights

-- ==========================================
-- COACHES TABLE (linked to AetherVTC accounts)
-- ==========================================

CREATE TABLE IF NOT EXISTS coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aether_user_id UUID UNIQUE,  -- Link to AetherVTC account (required for access)
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    profile_photo_url TEXT,
    certifications JSONB,  -- USA Wrestling certifications, etc.
    years_coaching INTEGER,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link teams to coaches (many-to-many)
CREATE TABLE IF NOT EXISTS team_coaches (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'assistant', -- head, assistant, volunteer
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, coach_id)
);

CREATE INDEX IF NOT EXISTS idx_coaches_aether_user ON coaches(aether_user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_email ON coaches(email);
CREATE INDEX IF NOT EXISTS idx_team_coaches_team ON team_coaches(team_id);
CREATE INDEX IF NOT EXISTS idx_team_coaches_coach ON team_coaches(coach_id);

-- ==========================================
-- AI COACHING INSIGHTS
-- ==========================================

CREATE TABLE IF NOT EXISTS coaching_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id),

    -- Insight categorization
    insight_type TEXT NOT NULL, -- strength, weakness, practice_focus, opponent_prep, trend, alert
    category TEXT, -- takedowns, escapes, conditioning, mental, technique, etc.
    priority TEXT DEFAULT 'medium', -- high, medium, low

    -- Content
    title TEXT,
    content TEXT NOT NULL,
    recommendations JSONB, -- Array of specific recommendations
    supporting_stats JSONB, -- Stats that support this insight

    -- AI metadata
    ai_model TEXT,
    ai_confidence DECIMAL(3,2),
    prompt_used TEXT,

    -- Status
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES coaches(id),
    dismissed BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,

    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Some insights are time-sensitive

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_team ON coaching_insights(team_id);
CREATE INDEX IF NOT EXISTS idx_insights_wrestler ON coaching_insights(wrestler_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON coaching_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON coaching_insights(priority);
CREATE INDEX IF NOT EXISTS idx_insights_generated ON coaching_insights(generated_at);

-- ==========================================
-- ENHANCE PRACTICES TABLE FOR AI GENERATION
-- ==========================================

ALTER TABLE practices
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS generation_prompt TEXT,
ADD COLUMN IF NOT EXISTS based_on_stats JSONB,
ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id);

-- ==========================================
-- ADD FLO_ID TO WRESTLERS (FloWrestling sync)
-- ==========================================

ALTER TABLE wrestlers
ADD COLUMN IF NOT EXISTS flo_id TEXT;

CREATE INDEX IF NOT EXISTS idx_wrestlers_flo_id ON wrestlers(flo_id);

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE coaches IS 'Coach accounts linked to AetherVTC for authentication';
COMMENT ON TABLE team_coaches IS 'Many-to-many relationship between teams and coaches';
COMMENT ON TABLE coaching_insights IS 'AI-generated coaching insights and recommendations';
COMMENT ON COLUMN coaches.aether_user_id IS 'Required link to AetherVTC account for authentication';
COMMENT ON COLUMN coaching_insights.insight_type IS 'Type: strength, weakness, practice_focus, opponent_prep, trend, alert';
COMMENT ON COLUMN wrestlers.flo_id IS 'FloWrestling wrestler ID for sync matching';
