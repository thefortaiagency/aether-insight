-- Add stats fields to wrestlers table for spreadsheet editing
-- These allow direct stat entry without match-by-match tracking

ALTER TABLE wrestlers
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tech_falls INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS major_decisions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS decisions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forfeits_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forfeits_lost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS takedowns INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS takedowns_against INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS escapes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS escapes_against INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reversals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reversals_against INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS near_fall_2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS near_fall_2_against INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS near_fall_3 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS near_fall_3_against INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS near_fall_4 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS near_fall_4_against INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS penalties INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points_against INTEGER DEFAULT 0;

COMMENT ON COLUMN wrestlers.wins IS 'Total wins this season';
COMMENT ON COLUMN wrestlers.losses IS 'Total losses this season';
COMMENT ON COLUMN wrestlers.pins IS 'Wins by pin/fall';
COMMENT ON COLUMN wrestlers.tech_falls IS 'Wins by technical fall (15+ point lead)';
COMMENT ON COLUMN wrestlers.major_decisions IS 'Wins by major decision (8-14 points)';
COMMENT ON COLUMN wrestlers.decisions IS 'Wins by regular decision';
COMMENT ON COLUMN wrestlers.takedowns IS 'Total takedowns scored';
COMMENT ON COLUMN wrestlers.team_points IS 'Team points earned (dual meet scoring)';
