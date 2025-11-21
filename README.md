# Aether Insights - Wrestling Analytics Platform

**Advanced wrestling analytics, live scoring, practice planning, and AI coaching powered by Claude.**

---

## 🏢 Platform Ecosystem

| Platform | Purpose | Repository |
|----------|---------|------------|
| **Aether Insights** | Wrestling stats, practice planning, coaching AI | This repo |
| **AetherVTC** | Communication - video, chat, phone, SMS | Separate platform |

> **Note**: Aether Insights requires an AetherVTC account for coach authentication.

---

## 🎯 What is Aether Insights?

Aether Insights is the complete wrestling team management system that combines:
- **Stats Management** - Track, analyze, and visualize wrestler performance
- **Practice Planning** - AI-assisted practice plans based on team needs
- **Coaching AI** - Personalized insights and recommendations
- **USABracketing Integration** - Automatic stats extraction via Chrome extension
- **Live Match Scoring** - Real-time scoring with video sync

**The MatBoss Killer** - Everything coaches need in one platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)
- AetherVTC account (for coach access)

### Installation

```bash
# Clone the repository
git clone https://github.com/thefortaiagency/aether-insight.git
cd aether-insight

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the platform.

---

## 📂 Repository Structure

```
aether-insight/
├── app/                        # Next.js 15 App Router
│   ├── api/                    # API routes
│   │   ├── matops/sync/        # Stats sync endpoint
│   │   ├── matches/            # Match CRUD operations
│   │   ├── teams/              # Team management
│   │   └── videos/             # Video upload/analysis
│   ├── dashboard/              # Main dashboard
│   ├── wrestlers/              # Wrestler management
│   ├── matches/                # Match scoring & history
│   └── teams/                  # Team settings
├── components/                 # React components
│   ├── match-scoring/          # Live scoring components
│   ├── video/                  # Video player & analysis
│   └── ui/                     # Shadcn UI components
├── lib/                        # Utilities
│   ├── supabase.ts             # Supabase client
│   └── database.types.ts       # Database types
├── supabase/                   # Database
│   ├── migrations/             # SQL migrations
│   └── schema.sql              # Database schema
├── matops-extension/           # Chrome Extension
│   └── extension-src/          # Extension source files
└── public/                     # Static assets
    ├── matopswhite.png         # Full logo (white text)
    └── matopstarget.png        # Icon/target logo
```

---

## 🔌 Chrome Extension (Stats Extraction)

**Automatically extract wrestling stats from USABracketing!**

### Installation

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `aether-insight/matops-extension/extension-src`

### Usage

1. Navigate to USABracketing.com
2. Click Mat Ops icon in toolbar
3. Extract stats from "My Wrestlers" page
4. Click "Sync to Platform"
5. View updated stats in dashboard

**See**: `matops-extension/README.md` for full documentation

---

## 🗄️ Database Schema

### Technology
- **PostgreSQL** via Supabase
- **Drizzle ORM** for type-safe queries
- **Real-time subscriptions** for live updates

### Core Tables
| Table | Purpose |
|-------|---------|
| `teams` | Team info, branding, settings |
| `wrestlers` | Profiles (no accounts - just data) |
| `matches` | Match results with detailed scoring |
| `coaches` | Coach accounts (linked to AetherVTC) |
| `practices` | Practice sessions and plans |
| `coaching_insights` | AI-generated recommendations |

### Stats Tables
| Table | Purpose |
|-------|---------|
| `wrestler_season_stats` | Aggregated season statistics |
| `match_events` | Move-by-move tracking |
| `weight_history` | Weight tracking over time |
| `matops_sync_log` | Import/sync history |

### Sync Fields (Optional)
```sql
wrestlers.usab_id    -- USABracketing ID
wrestlers.track_id   -- TrackWrestling ID
wrestlers.flo_id     -- FloWrestling ID
```

---

## 🎯 Core Features

### 1. Stats Management
- Import from USABracketing, TrackWrestling, FloWrestling
- Season stats with MatBoss Power Index
- Win/loss trends, pin rates, bonus percentages
- Position-specific analytics (neutral, top, bottom)

### 2. Coaching AI
- Ask questions about your team's stats
- Get personalized recommendations
- Opponent scouting analysis
- Identify strengths and weaknesses

### 3. Practice Planning
- AI-generated practice plans
- Based on team weaknesses and upcoming opponents
- Drill library with progressions
- Attendance tracking

### 4. Live Match Scoring
- Real-time scoring interface
- Period-by-period tracking
- Detailed stats (takedowns, escapes, reversals, nearfalls)
- Riding time tracking

### 5. Team Management
- Roster management (wrestlers are data, not users)
- Weight class tracking
- Tournament scheduling
- Coach collaboration

---

## 👤 Account Model

```
COACHES (require AetherVTC account)
    └── Teams
        └── Wrestlers (just data records - no accounts)
            └── Matches/Stats
```

- **Coaches**: Must have AetherVTC account to access Aether Insights
- **Wrestlers**: Data entries only - no login required
- **Future**: Wrestlers with AetherVTC accounts can "pull" their stats

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare Stream (Phase 2 - Video)
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_STREAM_API_TOKEN=your-api-token

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Extension Config

Edit `matops-extension/extension-src/background.js`:

```javascript
const CONFIG = {
  matopsApiUrl: 'https://your-domain.vercel.app/api/matops',
  localApiUrl: 'http://localhost:3000/api/matops',
  isDevelopment: true, // false for production
  defaultTeamId: 'your-team-uuid'
};
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Chrome Extension                     │
│  (USABracketing/FloArena/Track extraction)   │
└──────────────────┬──────────────────────────┘
                   │
                   │ POST /api/matops/sync
                   ▼
┌─────────────────────────────────────────────┐
│       Aether Insights (Next.js)              │
│                                              │
│  ├─ Stats Dashboard                          │
│  ├─ Coaching AI (Claude)                     │
│  ├─ Practice Planning                        │
│  └─ Live Scoring                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ Auth via AetherVTC
                   ▼
┌─────────────────────────────────────────────┐
│           AetherVTC Platform                 │
│  (Communication - separate platform)         │
│                                              │
│  ├─ Video Conferencing                       │
│  ├─ Chat/Messaging                           │
│  ├─ Phone/SMS                                │
│  └─ User Accounts                            │
└─────────────────────────────────────────────┘
```

---

## 📊 API Documentation

### POST /api/matops/sync

Sync wrestler and match data from Chrome extension.

**Request**:
```json
{
  "source": "USABracketing",
  "teamId": "uuid",
  "version": "1.0.0",
  "wrestlers": [
    {
      "firstName": "John",
      "lastName": "Smith",
      "weightClass": 132,
      "wins": 25,
      "losses": 3,
      "pins": 18,
      "usabId": "12345",
      "matches": [...]
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "wrestlers": 15,
  "matches": 127,
  "duration": 2341
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel
```

See `VERCEL_SETUP.md` for environment variable configuration.

---

## 📝 License

Proprietary - The Fort Suite

---

## 🙏 Credits

- **Built by**: Coach Andy O (30+ years coaching experience)
- **Tech Stack**: Next.js, Supabase, Cloudflare, Claude AI
- **Purpose**: Make wrestling coaching better through technology

---

**Aether Insights - The MatBoss Killer** 🤼‍♂️
*Built by coaches, for coaches*
