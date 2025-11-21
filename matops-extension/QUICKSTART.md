# Mat Ops - Quick Start Guide 🤼

## What You've Got

**A Chrome extension that extracts wrestling stats from USABracketing** - no more manual data entry!

## Installation (5 minutes)

1. **Open Chrome Extensions**:
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode** (top-right toggle)

3. **Load Extension**:
   - Click "Load unpacked"
   - Navigate to: `/Users/thefortob/Development/00-PRODUCTION/matops/extension-src`
   - Click "Select"

4. **Confirm**:
   - You should see "Mat Ops - Wrestling Stats Tracker" with 🤼 icons
   - Extension is ready!

## Usage

### Basic Workflow
1. **Go to USABracketing.com** → Log in
2. **Navigate to Event** → General → My Wrestlers
3. **Sidebar appears automatically** (right side, blue gradient)
4. **Stats extracted in 2 seconds** (wrestlers, matches, wins, losses)

### Get Detailed Match Stats
**Just browse normally!** When you click any match score to view details, the extension automatically captures:
- Takedowns, escapes, reversals
- Nearfall points (2pt, 3pt, 4pt)
- Penalties
- Period-by-period scoring with timestamps

**You'll see**: "📊 Captured detailed stats (X matches)" in the sidebar status

### Export Everything
1. Click **"Export JSON"** button in sidebar
2. File downloads: `matops-export-2025-11-19.json`
3. Export includes:
   - All wrestlers and teams
   - All matches (opponent, score, result, round, mat, bout)
   - **Detailed stats for every match you clicked on**

## What Gets Captured

### From Wrestler List (Automatic)
```json
{
  "name": "Hunter Douglas",
  "team": "The Fort Hammers",
  "state": "IN",
  "weightClass": 141,
  "placement": "DNP",
  "matches": [
    {
      "mat": "Mat 14",
      "bout": "2039",
      "round": "Champ. Rd of 64",
      "opponent": "Braxton Shines",
      "opponentTeam": "TFH",
      "result": "Win",
      "winType": "Tech Fall",
      "score": "TF 22-4 (2:59)",
      "wrestlerScore": 22,
      "opponentScore": 4,
      "matchId": "9c6f4d70-...",
      "videoUrl": "https://..."
    }
  ]
}
```

### From Match Detail Clicks (When You Click Scores)
```json
{
  "takedowns": 5,
  "escapes": 2,
  "reversals": 1,
  "nearfall2": 0,
  "nearfall3": 1,
  "nearfall4": 0,
  "penalty1": 0,
  "penalty2": 0,
  "takedownsOpp": 1,
  "escapesOpp": 0,
  "reversalsOpp": 0,
  "nearfall2Opp": 0,
  "nearfall3Opp": 0,
  "nearfall4Opp": 0,
  "penalty1Opp": 1,
  "penalty2Opp": 0,
  "pin": false,
  "pinOpp": false,
  "periods": [
    {
      "period": 1,
      "events": [
        { "wrestler": "self", "move": "Takedown 2", "timestamp": "1:45" },
        { "wrestler": "opponent", "move": "Escape 1", "timestamp": "1:22" },
        { "wrestler": "self", "move": "Takedown 2", "timestamp": "0:58" }
      ]
    }
  ]
}
```

## Tips

### To Get Complete Data
1. **Extract basic stats** (automatic on page load)
2. **Click through matches** you want detailed stats for
   - Click the score link to open match details
   - Extension captures automatically
   - Close modal and move to next match
3. **Export JSON** when done (includes all detailed stats)

### Troubleshooting
- **Sidebar not appearing?** Refresh page, wait 2 seconds
- **No data extracted?** Make sure wrestlers are expanded (click weight class headers)
- **Extension not loading?** Check `chrome://extensions/` - should see Mat Ops

## What's Next?

✅ **Extension is production-ready** - test it on real events!

⏳ **Future features** (not built yet):
- Database sync to Aether platform
- Stats dashboard with analytics
- Team management tools
- Season tracking

**For now**: Use Export JSON to get data out, then decide if you want database integration.

---

## Coach's Notes

This gives you everything USABracketing has, but in a format you can actually use:
- JSON export for Excel/analysis
- Detailed match stats (takedowns, escapes, reversals, etc.)
- Season tracking across multiple events
- No manual data entry

**Ready to build stats dashboards and team management on top of this foundation.**

🔥 Let's test it on a real event! 🔥
