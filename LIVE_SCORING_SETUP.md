# Live Scoring Database Setup Guide

## ✅ Current Status (Aug 25, 2025)

The live scoring system is now properly configured to save all match data to the database:

1. **Matches Table**: ✅ Working - Saves match metadata
2. **Match Events Table**: ✅ Working - Saves individual scoring events
3. **Match Statistics Table**: ⚠️ Needs to be created manually
4. **Match Updates Table**: ⚠️ Needs to be created manually

## 🔧 What Was Fixed

### 1. API Routes Updated
- Changed from using `supabase` client to `supabaseAdmin` for proper write permissions
- Fixed field names to match actual database schema:
  - `matches` table doesn't have `wrestler_name`, only `opponent_name`
  - `match_events` uses `event_time` (HH:MM:SS format), not `timestamp`
  - `match_events` uses `points_scored`, not `points`

### 2. Date Format Corrections
- `match_date` expects date only (YYYY-MM-DD), not datetime
- `event_time` expects time format (HH:MM:SS)

### 3. Enhanced Error Logging
- Added console.log statements throughout for debugging
- Shows success/failure messages in browser console
- Displays match ID after creation

## 📊 Database Schema

### matches Table (Existing)
```sql
- id: UUID
- opponent_name: TEXT
- opponent_team: TEXT
- match_date: DATE
- weight_class: INTEGER
- mat_number: TEXT
- referee_name: TEXT
- final_score_for: INTEGER
- final_score_against: INTEGER
- (and more fields...)
```

### match_events Table (Existing)
```sql
- id: UUID
- match_id: UUID (references matches)
- event_time: TIME (HH:MM:SS)
- event_type: TEXT
- points_scored: INTEGER
- wrestler_id: UUID
- move_name: TEXT
- from_position: TEXT
- video_timestamp: INTEGER
- (and more fields...)
```

## 🚀 To Complete Setup

### Step 1: Create Missing Tables

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Create match_statistics table
CREATE TABLE IF NOT EXISTS match_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_id UUID,
  wrestler_name TEXT NOT NULL,
  takedowns INTEGER DEFAULT 0,
  escapes INTEGER DEFAULT 0,
  reversals INTEGER DEFAULT 0,
  near_fall_2 INTEGER DEFAULT 0,
  near_fall_3 INTEGER DEFAULT 0,
  near_fall_4 INTEGER DEFAULT 0,
  stalls INTEGER DEFAULT 0,
  cautions INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  penalties INTEGER DEFAULT 0,
  riding_time INTEGER DEFAULT 0,
  riding_time_point BOOLEAN DEFAULT FALSE,
  blood_time INTEGER DEFAULT 0,
  injury_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create match_updates table
CREATE TABLE IF NOT EXISTS match_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);

-- Grant permissions
GRANT ALL ON match_statistics TO service_role;
GRANT ALL ON match_updates TO service_role;
```

### Step 2: Test the System

1. Go to `/matches/live-scoring`
2. Enter wrestler names and match details
3. Click "Start Match"
4. Open browser console (F12) to see debug logs
5. Score some points using the buttons
6. Watch for success messages in console

### Step 3: Verify Data

Check your Supabase dashboard to see:
- New match created in `matches` table
- Scoring events in `match_events` table
- Statistics in `match_statistics` table (after creating it)
- Real-time updates in `match_updates` table (after creating it)

## 🧪 Testing Scripts

### Test Database Connection
```bash
node scripts/test-database-save.js
```

### Check Table Existence
```bash
node scripts/check-scoring-tables.js
```

### Verify Schema
```bash
node scripts/get-actual-schema.js
```

## 📝 Important Notes

1. **Auto-save is enabled by default** - Every scoring action saves to database
2. **Match ID is displayed** in the console after creation
3. **Video timestamps** are calculated automatically
4. **Offline support** falls back to local storage when offline

## 🎯 What's Working Now

✅ Match creation saves to database
✅ Score updates save in real-time
✅ Individual scoring events are tracked
✅ Video timestamps are recorded
✅ Proper error handling and logging

## 🐛 Troubleshooting

If matches aren't saving:
1. Check browser console for error messages
2. Verify Supabase credentials in `.env.local`
3. Ensure tables exist (run check script)
4. Check Supabase dashboard for RLS policies

If you see "Could not find column" errors:
- The database schema doesn't match the code
- Check actual schema with `get-actual-schema.js`
- Update API routes to match actual columns

## 📞 Support

If issues persist:
1. Check browser console for detailed error messages
2. Run `node scripts/test-database-save.js` to test connection
3. Verify all environment variables are set correctly
4. Check Supabase dashboard for any service issues