# Mat Ops - Wrestling Analytics Platform

**Advanced wrestling analytics, live scoring, video analysis, and team management powered by AI.**

---

## 🎯 What is Mat Ops?

Mat Ops is the complete wrestling team management system that combines:
- **Live Match Scoring** - Real-time scoring with video sync
- **USABracketing Integration** - Automatic stats extraction via Chrome extension
- **Video Analysis** - Cloudflare Stream integration with AI analysis
- **Team Management** - Roster, weight tracking, season stats
- **AI-Powered Insights** - Claude-powered analytics and coaching recommendations

**The MatBoss Killer** - Everything coaches need in one platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

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
│   │   ├── matops/sync/        # USABracketing sync endpoint
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
    ├── matopslogo.png          # Full logo
    └── matopstarget.png        # Icon/target logo
```

---

## 🔌 Mat Ops Chrome Extension

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
4. Click "Sync to Mat Ops Platform"
5. View updated stats in dashboard

**See**: `matops-extension/README.md` for full documentation

---

## 🗄️ Database

### Technology
- **PostgreSQL** via Supabase
- **Drizzle ORM** for type-safe queries
- **Real-time subscriptions** for live updates

### Main Tables
- `teams` - Team info, coaches, branding
- `wrestlers` - Detailed wrestler profiles with stats
- `matches` - Match results with period-by-period scoring
- `videos` - Video recordings with Cloudflare Stream
- `statistics` - Aggregated season stats
- `matops_sync_log` - USABracketing sync history

### Running Migrations

```bash
# Push schema changes to Supabase
npm run db:push

# Generate new migration
npm run db:generate

# View current schema
npm run db:studio
```

---

## 🎥 Features

### 1. Live Match Scoring
- Real-time scoring interface
- Period-by-period tracking
- Detailed stats (takedowns, escapes, reversals, nearfalls)
- Riding time tracking
- Video timestamp sync

### 2. USABracketing Integration
- **Chrome Extension** extracts stats automatically
- **API Endpoint** `/api/matops/sync` receives data
- **Upsert Logic** prevents duplicates
- **Sync History** tracks all imports

### 3. Video Analysis
- **Cloudflare Stream** for video hosting
- **Timeline Markers** for scoring events
- **AI Analysis** (coming soon) - Move detection
- **Highlight Generation** - Auto-create highlight reels

### 4. Team Management
- Roster management
- Weight class tracking
- Season stats aggregation
- Tournament scheduling
- Parent communication

### 5. Analytics Dashboard
- Team performance metrics
- Wrestler comparisons
- Opponent scouting reports
- Trend analysis
- Predictive modeling (coming soon)

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare Stream
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_STREAM_API_TOKEN=your-api-token

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Chrome Extension Config

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

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add production URL to Chrome extension config
```

### Database Migration on Deploy

Migrations run automatically via Supabase CLI or manually:

```bash
supabase db push
```

---

## 🧪 Testing

### Run Development Server
```bash
npm run dev
```

### Test Extension
1. Load extension in Chrome (see above)
2. Navigate to USABracketing.com
3. Extract stats
4. Verify sync to localhost:3000

### Check Database
```sql
-- View sync history
SELECT * FROM matops_sync_log
ORDER BY sync_timestamp DESC;

-- View imported wrestlers
SELECT * FROM wrestlers
WHERE imported_from = 'USABracketing';
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

### GET /api/matops/sync

Get sync history.

**Query Params**:
- `teamId` - Filter by team
- `limit` - Max records (default: 10)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│        Mat Ops Chrome Extension              │
│  (USABracketing stats extraction)            │
└──────────────────┬──────────────────────────┘
                   │
                   │ POST /api/matops/sync
                   ▼
┌─────────────────────────────────────────────┐
│          Mat Ops Platform (Next.js)          │
│                                              │
│  ├─ API Routes (/api/matops, /api/matches)  │
│  ├─ React Components (dashboard, scoring)   │
│  └─ Supabase Client (queries, subscriptions)│
└──────────────────┬──────────────────────────┘
                   │
                   │ Database queries
                   ▼
┌─────────────────────────────────────────────┐
│       PostgreSQL (Supabase)                  │
│                                              │
│  ├─ teams, wrestlers, matches                │
│  ├─ videos, statistics                       │
│  └─ matops_sync_log                          │
└─────────────────────────────────────────────┘
```

---

## 🤝 Contributing

This is a proprietary project for The Fort Suite. Internal contributions welcome.

### Development Workflow
1. Create feature branch
2. Make changes
3. Test locally
4. Submit PR
5. Deploy to staging
6. Merge to master

---

## 📝 License

Proprietary - The Fort Suite

---

## 🙏 Credits

- **Built by**: Coach Andy O (30+ years coaching experience)
- **Tech Stack**: Next.js, Supabase, Cloudflare, Claude AI
- **Purpose**: Make wrestling coaching better through technology

---

## 📞 Support

- **Issues**: Create GitHub issue
- **Questions**: Contact via The Fort Suite
- **Documentation**: See `/docs` and `matops-extension/README.md`

---

**Mat Ops - The MatBoss Killer** 🤼‍♂️
*Built by coaches, for coaches*
