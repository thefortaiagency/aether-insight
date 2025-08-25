# Database Schema for Video-Scoring Synchronization

## Tables Needed

### 1. matches (existing)
- id (UUID)
- wrestler_name (TEXT)
- opponent_name (TEXT)
- final_score_for (INTEGER)
- final_score_against (INTEGER)
- created_at (TIMESTAMP)
- video_start_time (TIMESTAMP) - When video recording started
- video_end_time (TIMESTAMP) - When video recording ended

### 2. match_events (new)
```sql
CREATE TABLE IF NOT EXISTS match_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL, -- Unix timestamp in milliseconds
  video_timestamp INTEGER, -- Seconds from video start
  event_type TEXT NOT NULL, -- takedown, escape, reversal, near_fall, penalty, etc.
  wrestler_id TEXT NOT NULL, -- 'wrestler1' or 'wrestler2'
  wrestler_name TEXT,
  points INTEGER DEFAULT 0,
  description TEXT,
  period INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_match_events_timestamp ON match_events(timestamp);
```

### 3. match_videos (new)
```sql
CREATE TABLE IF NOT EXISTS match_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  cloudflare_video_id TEXT NOT NULL,
  video_url TEXT,
  duration INTEGER, -- Duration in seconds
  recording_started_at TIMESTAMP,
  recording_ended_at TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE,
  watermarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_videos_match_id ON match_videos(match_id);
CREATE INDEX idx_match_videos_cloudflare_id ON match_videos(cloudflare_video_id);
```

## How Video-Scoring Sync Works

### During Live Scoring:
1. **Match Start**: 
   - Create match record with `created_at`
   - Start video recording with same timestamp
   - Store `video_start_time` in matches table

2. **Scoring Events**:
   - Each scoring action creates a `match_event` record
   - Store exact `timestamp` (Date.now())
   - Calculate `video_timestamp` = (event_timestamp - video_start_time) / 1000

3. **Match End**:
   - Stop video recording
   - Store `video_end_time`
   - Upload video to Cloudflare
   - Create `match_videos` record with Cloudflare ID

### During Video Review:
1. **Load Match**: 
   - Fetch match data and associated video
   - Load all match_events ordered by timestamp

2. **Create Timeline**:
   - Each event has a `video_timestamp` (seconds from start)
   - Display events on timeline relative to video duration

3. **Jump to Event**:
   - Click event → seek video to `video_timestamp`
   - Highlight scoring action at that moment

### Example Data Flow:
```javascript
// Match starts at 10:00:00 AM
matchStartTime = 1703123456000

// Takedown at 10:00:15 AM (15 seconds later)
eventTime = 1703123471000
videoTimestamp = (1703123471000 - 1703123456000) / 1000 = 15 seconds

// In video player, jump to 15 seconds to see the takedown
```

## Benefits:
- Perfect synchronization between video and scoring
- Jump directly to any scoring moment
- Create highlight reels of just scoring actions
- Analyze patterns (e.g., most takedowns happen in period 1)
- Coach review with precise timestamps
- Share specific moments with wrestlers