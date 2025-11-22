-- Add coach profile and AI personalization fields to teams table
-- Created: 2025-11-22

-- Coach profile/background
ALTER TABLE teams ADD COLUMN IF NOT EXISTS coach_profile JSONB DEFAULT '{}';
-- Structure: {
--   "name": "Coach Andy",
--   "background": "30+ years wrestling, 25 years coaching...",
--   "philosophy": "We build champions through discipline...",
--   "communication_style": "Direct and challenging",
--   "favorite_techniques": ["single leg", "cradle"],
--   "team_goals": "State championship, build program culture",
--   "ai_preferences": {
--     "tone": "motivating",
--     "formality": "casual",
--     "detail_level": "concise"
--   }
-- }

-- Plan name for practice scheduling
ALTER TABLE practices ADD COLUMN IF NOT EXISTS plan_name TEXT;

-- Comment
COMMENT ON COLUMN teams.coach_profile IS 'JSON object storing coach background, philosophy, goals, and AI interaction preferences';
