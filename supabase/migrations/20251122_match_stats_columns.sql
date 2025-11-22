-- Add detailed stats columns to matches table
-- These track individual scoring moves for each match

-- Takedowns
ALTER TABLE matches ADD COLUMN IF NOT EXISTS takedowns_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS takedowns_against INTEGER DEFAULT 0;

-- Escapes
ALTER TABLE matches ADD COLUMN IF NOT EXISTS escapes_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS escapes_against INTEGER DEFAULT 0;

-- Reversals
ALTER TABLE matches ADD COLUMN IF NOT EXISTS reversals_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS reversals_against INTEGER DEFAULT 0;

-- Near Falls (2 point)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS nearfall_2_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS nearfall_2_against INTEGER DEFAULT 0;

-- Near Falls (3 point)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS nearfall_3_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS nearfall_3_against INTEGER DEFAULT 0;

-- Near Falls (4 point)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS nearfall_4_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS nearfall_4_against INTEGER DEFAULT 0;

-- Penalties
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalties_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalties_against INTEGER DEFAULT 0;

-- Overtime periods (Sudden Victory, Tiebreaker 1, Tiebreaker 2, Ultimate Tiebreaker)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS ot_sudden_victory_score_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS ot_sudden_victory_score_against INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS ot_tiebreaker1_score_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS ot_tiebreaker1_score_against INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS ot_tiebreaker2_score_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS ot_tiebreaker2_score_against INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS ot_ultimate_score_for INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS ot_ultimate_score_against INTEGER DEFAULT 0;
