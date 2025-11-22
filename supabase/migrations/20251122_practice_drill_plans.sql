-- Add drill_plan column to practices for storing full practice plan
-- Created: 2025-11-22

-- Add JSONB column for storing the drill plan array
ALTER TABLE practices ADD COLUMN IF NOT EXISTS drill_plan JSONB;

-- Add plan_name for template reference
ALTER TABLE practices ADD COLUMN IF NOT EXISTS plan_name TEXT;

-- Comment
COMMENT ON COLUMN practices.drill_plan IS 'JSON array of drills: [{id, name, duration, category, description}]';
COMMENT ON COLUMN practices.plan_name IS 'Name of the practice plan template used';
