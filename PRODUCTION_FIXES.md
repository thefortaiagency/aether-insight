# Production Issues and Fixes

## Current Issues (Aug 25, 2025)

### 1. API Routes Returning 500 Errors
- `/api/teams` - 500 Internal Server Error
- `/api/wrestlers` - 500 Internal Server Error

### Root Causes:
1. **Missing Database Tables**: The `teams` and `wrestlers` tables don't exist in Supabase
2. **Wrong Supabase Client**: Routes use `supabase` instead of `supabaseAdmin`
3. **Possible Missing Environment Variables**: Check Vercel has all required env vars

## How to Fix

### Step 1: Check Environment Variables on Vercel

Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

Ensure these are set:
```
NEXT_PUBLIC_SUPABASE_URL=https://yesycwefigqotbplguqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Create Missing Tables in Supabase

Go to [Supabase Dashboard](https://supabase.com) → SQL Editor

Run this SQL:

```sql
-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT,
  division TEXT,
  conference TEXT,
  logo_url TEXT,
  coach_name TEXT,
  assistant_coaches TEXT[],
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wrestlers table
CREATE TABLE IF NOT EXISTS wrestlers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade INTEGER,
  weight_class INTEGER,
  actual_weight DECIMAL,
  birth_date DATE,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create season_records table
CREATE TABLE IF NOT EXISTS season_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler_id UUID REFERENCES wrestlers(id) ON DELETE CASCADE,
  season TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  pins INTEGER DEFAULT 0,
  tech_falls INTEGER DEFAULT 0,
  major_decisions INTEGER DEFAULT 0,
  team_points DECIMAL DEFAULT 0,
  tournament_placements JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wrestlers_team_id ON wrestlers(team_id);
CREATE INDEX IF NOT EXISTS idx_wrestlers_weight_class ON wrestlers(weight_class);
CREATE INDEX IF NOT EXISTS idx_season_records_wrestler_id ON season_records(wrestler_id);

-- Grant permissions
GRANT ALL ON teams TO service_role;
GRANT ALL ON wrestlers TO service_role;
GRANT ALL ON season_records TO service_role;
```

### Step 3: Fix API Routes (Already committed, needs deployment)

The API routes need to use `supabaseAdmin` instead of `supabase`. This has been fixed locally but needs to be deployed:

```bash
git pull origin master
```

Then Vercel will auto-deploy the fixes.

## Content Security Policy Warning

The CSP warning about `vercel.live` is not critical - it's just Vercel's feedback widget being blocked. This doesn't affect functionality.

## Quick Fix Summary

1. **Check Vercel has environment variables** (especially SUPABASE_SERVICE_ROLE_KEY)
2. **Create the missing tables** using the SQL above
3. **Pull latest code** which has the API fixes

## Testing After Fixes

1. Visit https://insight.aethervtc.ai/team-stats
2. Should load without errors
3. Visit https://insight.aethervtc.ai/matches/live-scoring
4. Create a test match to verify database saving works

## Live Scoring is Working

The good news is that the live scoring system (matches, match_events) is working correctly. The errors are only affecting the teams/wrestlers features which appear to be newer additions that haven't been fully set up in production.