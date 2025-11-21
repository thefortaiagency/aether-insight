# Mat Ops - Wrestling Stats Tracker

**Extract wrestling stats from USABracketing and sync to Aether platform for comprehensive team management.**

## 🎯 Purpose

USABracketing makes it difficult to export wrestling statistics. Mat Ops solves this by:
1. **Browser Extension** - Extracts stats while you browse USABracketing (requires login)
2. **Automatic Sync** - Sends data to your Aether platform
3. **Team Management** - Track wrestlers, matches, and season stats in one place
4. **Analytics Dashboard** - Visualize performance trends

## 🏗️ Architecture

```
USABracketing (Login Required)
  ↓
Mat Ops Browser Extension (Extract Stats)
  ↓
Aether API (/api/matops/sync)
  ↓
PostgreSQL Database
  ↓
Aether Mat Ops Dashboard
```

## 📦 Components

### 1. Browser Extension (`extension-src/`)
- `manifest.json` - Chrome Extension Manifest V3
- `background.js` - Service worker for data coordination
- `content-scraper.js` - DOM scraper for USABracketing pages
- `popup.html/js` - Extension popup UI
- `matops.css` - Floating panel styles

### 2. Database Schema (`drizzle/schemas/matops.ts`)
- **wrestling_teams** - Team roster and coach info
- **wrestlers** - Wrestler profiles and season records
- **wrestling_events** - Tournaments and duals
- **wrestling_matches** - Detailed match-level statistics
- **season_stats** - Aggregated season performance
- **matops_sync_log** - Sync tracking and debugging

### 3. Aether Integration (TODO)
- API routes for data sync
- Stats dashboard page
- Team management page

## 📊 Stats Tracked

### Match-Level Stats
**Wrestler & Opponent:**
- Takedowns
- Escapes
- Reversals
- Nearfalls (2-point, 3-point, 4-point)
- Penalties (1-point, 2-point)
- Riding time bonus

**Match Info:**
- Date, opponent, weight class
- Match result (Win/Loss/Draw)
- Win type (Pin, Tech Fall, Major Decision, Decision, Forfeit)
- Final score
- Period-by-period scoring (optional)
- Tournament round and placement

### Season Aggregates
- Win-Loss-Draw record
- Win percentage
- Breakdown by win type (pins, tech falls, etc.)
- Offensive averages (takedowns/match, escapes/match, etc.)
- Points scored vs allowed

## 🚀 Installation

### Browser Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `/Users/thefortob/Development/00-PRODUCTION/matops/extension-src`

### Database Setup
```bash
cd /Users/thefortob/Development/00-PRODUCTION/aether_beta_2_obe_fork
npm run db:generate  # Generate migration
npm run db:migrate   # Apply to database
```

## 🎮 Usage

### Step 1: Extract Stats from USABracketing
1. Log in to USABracketing.com
2. Navigate to "My Wrestlers" for your event
3. Expand wrestler rows to see match details
4. Click the Mat Ops floating panel or extension icon
5. Click "Extract Stats" - data is captured automatically

### Step 2: Sync to Aether
1. Click "Sync to Aether" in Mat Ops extension
2. Data is sent to your Aether platform
3. View stats in Aether Mat Ops dashboard

### Step 3: Manage Team
1. Go to Aether → Mat Ops → Team Management
2. See all wrestlers, matches, and season stats
3. Export data, generate reports, track trends

## 🔧 Configuration

### Extension Settings
Edit `extension-src/background.js`:
```javascript
const CONFIG = {
  aetherApiUrl: 'https://aethervtc.ai/api/matops',
  localApiUrl: 'http://localhost:3000/api/matops',
  syncInterval: 60000, // Auto-sync interval
  isDevelopment: true   // Use local API
};
```

### Auto-Extract
Mat Ops automatically detects USABracketing pages and extracts data. To disable:
```javascript
// In content-scraper.js
const MATOPS_CONFIG = {
  autoExtract: false  // Manual extraction only
};
```

## 📋 Data Model

### Wrestler
```typescript
{
  id: uuid,
  teamId: uuid,
  firstName: string,
  lastName: string,
  grade: number,
  weightClass: number,
  usawId: string,
  wins: number,
  losses: number,
  pins: number
}
```

### Match
```typescript
{
  id: uuid,
  wrestlerId: uuid,
  eventId: uuid,
  matchDate: timestamp,
  opponent: string,
  result: "Win" | "Loss" | "Draw",
  winType: "Pin" | "Tech Fall" | "Major Decision" | "Decision",
  wrestlerScore: number,
  opponentScore: number,

  // Detailed stats
  takedowns: number,
  escapes: number,
  reversals: number,
  nearfall2: number,
  nearfall3: number,
  nearfall4: number,
  // ... opponent stats

  pin: boolean,
  forfeit: boolean,
  notes: string
}
```

## 🔄 Sync Process

1. **Browser Extension** extracts HTML from USABracketing
2. **Content Scraper** parses wrestler and match data
3. **Background Service** caches data in memory
4. **Sync API** sends data to Aether backend
5. **Aether API** validates and stores in PostgreSQL
6. **Dashboard** displays aggregated stats

## 🎯 Next Steps

### TODO - Extension
- [ ] Update DOM selectors once Coach provides actual HTML structure
- [ ] Add scraper for Statistics page
- [ ] Add scraper for Brackets page
- [ ] Support multiple seasons
- [ ] Offline mode (IndexedDB cache)

### TODO - Aether Backend
- [ ] Create `/api/matops/sync` endpoint
- [ ] Create `/api/matops/wrestlers` endpoint
- [ ] Create `/api/matops/matches` endpoint
- [ ] Create `/api/matops/stats` endpoint
- [ ] Implement season stats recalculation

### TODO - Aether Frontend
- [ ] Create Mat Ops dashboard page
- [ ] Create team management page
- [ ] Create wrestler detail page
- [ ] Create match entry form (manual input)
- [ ] Create stats visualizations (charts, trends)
- [ ] CSV export functionality

## 🏆 Features to Build

1. **Stats Dashboard**
   - Team win-loss record
   - Top performers (most wins, most pins, etc.)
   - Weight class breakdown
   - Season trend charts

2. **Wrestler Profiles**
   - Individual stats and records
   - Match history timeline
   - Head-to-head vs specific opponents
   - Performance trends

3. **Team Management**
   - Roster management
   - Weight class assignments
   - Lineup optimizer
   - Tournament registration helper

4. **Analytics**
   - Win percentage by weight class
   - Most common win types
   - Points scored vs allowed
   - Strength of schedule

## 🔐 Security

- Extension only runs on USABracketing.com
- No credentials stored in extension
- All data synced over HTTPS
- Coach has full control over data in Aether

## 📝 Notes

- USABracketing uses Livewire for dynamic content
- Mat Ops watches for DOM changes to auto-extract new data
- Browser extension requires manual installation (not in Chrome Web Store)
- Data is never sent anywhere except your Aether platform

## 🚀 This is a GAME-CHANGER, Coach!

No more manual stat tracking. No more Excel spreadsheets. Just extract from USABracketing and manage everything in Aether.

**Mat Ops + Aether = Complete wrestling team management system!** 🤼

---

**Status**: 🟡 In Development
- ✅ Extension structure complete
- ✅ Database schema complete
- ⏳ Waiting for USABracketing HTML structure
- ⏳ Aether API routes pending
- ⏳ Dashboard UI pending
