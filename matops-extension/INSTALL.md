# Mat Ops - Installation Guide

## 🚀 Install the Browser Extension

### Step 1: Create Icons (Quick)

We need simple placeholder icons for Chrome. Run this:

```bash
cd /Users/thefortob/Development/00-PRODUCTION/matops/extension-src
mkdir -p icons

# Create placeholder icon files (we'll use text-based icons for now)
# You can replace these with real images later
echo "🤼" > icons/matops-16.png
echo "🤼" > icons/matops-48.png
echo "🤼" > icons/matops-128.png
```

**OR** just create 3 empty files:
```bash
touch icons/matops-16.png icons/matops-48.png icons/matops-128.png
```

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**:
   - Go to: `chrome://extensions/`
   - OR: Menu → More Tools → Extensions

2. **Enable Developer Mode**:
   - Toggle "Developer mode" in the top-right corner

3. **Load Extension**:
   - Click "Load unpacked"
   - Navigate to: `/Users/thefortob/Development/00-PRODUCTION/matops/extension-src`
   - Click "Select"

4. **Confirm It Loaded**:
   - You should see "Mat Ops - Wrestling Stats Tracker" in your extensions list
   - Pin it to your toolbar (optional)

### Step 3: Test It!

1. **Go to USABracketing**:
   - Navigate to: https://www.usabracketing.com
   - Log in
   - Go to an event → **General** → **My Wrestlers**

2. **See the Sidebar**:
   - A blue sidebar should appear on the right side
   - Shows: 🤼 **Mat Ops**
   - Auto-extracts stats after 2 seconds

3. **Use the Sidebar**:
   - View wrestler count, match count, wins/losses
   - See detailed wrestler cards
   - Click "Refresh Stats" to re-extract
   - Click "Export JSON" to download data

4. **Capture Detailed Match Stats** (NEW!):
   - Click on any match score to view match details
   - Extension automatically captures period-by-period stats:
     * Takedowns, escapes, reversals
     * Nearfall points (2, 3, 4 point)
     * Penalties
     * Period-by-period scoring events
   - Status shows: "📊 Captured detailed stats (X matches)"
   - Export includes detailed stats for all clicked matches

## 🎨 Features

### Stats Summary
- **Wrestlers**: Total count
- **Matches**: Total matches extracted
- **Wins**: Total wins across all wrestlers
- **Losses**: Total losses

### Wrestler Cards
Each wrestler shows:
- Name and team
- Win-Loss record
- Total matches
- Weight classes and placements

### Detailed Match Stats (Automatic Capture)
When you click on any match score to view details, Mat Ops automatically captures:
- **Takedowns**: Count for wrestler and opponent
- **Escapes**: Count for wrestler and opponent
- **Reversals**: Count for wrestler and opponent
- **Nearfalls**: 2-point, 3-point, 4-point nearfalls
- **Penalties**: Point deductions
- **Period-by-Period**: All scoring events with timestamps
- **Pin Detection**: Automatic pin/fall detection

**How it works**: Just browse matches normally! The extension watches for match detail modals and captures stats automatically. No extra clicks needed.

### Actions
- **Refresh Stats**: Re-extract data from page
- **Export JSON**: Download all data as JSON file (includes detailed stats for viewed matches)
- **Toggle Sidebar**: Collapse/expand sidebar

## 🔧 Troubleshooting

### Extension Not Loading
- Make sure icons folder exists
- Check Developer Mode is ON
- Try reloading the extension

### Sidebar Not Appearing
- Make sure you're on the "My Wrestlers" page
- Check browser console for errors (F12)
- Try refreshing the page

### No Data Extracted
- Make sure wrestlers are visible (expand at least one)
- Click "Refresh Stats" button
- Check console logs: `[Mat Ops]` messages

### Modify the Sidebar
To change sidebar behavior, edit:
- `/extension-src/content-matops.js` - Logic
- `/extension-src/sidebar.css` - Styling

After changes:
1. Go to `chrome://extensions/`
2. Click reload icon on Mat Ops extension
3. Refresh USABracketing page

## 📊 Export Data

The exported JSON includes:
- Wrestler names, teams, states, athlete IDs
- Weight classes and placements
- Match details: opponent, score, result, win type, round, mat, bout
- Video URLs
- Match IDs (for linking to USABracketing)

Example:
```json
{
  "name": "Hunter Douglas",
  "team": "The Fort Hammers",
  "state": "IN",
  "athleteId": "83580871-ad66-4c06-b891-2909d228f82d",
  "weightClasses": [
    {
      "division": "High School",
      "weight": 141,
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
          "matchId": "9c6f4d70-e911-43e6-a834-7d7f69e24bb1",
          "videoUrl": ""
        }
      ]
    }
  ]
}
```

## 🎯 Next Steps

Once the sidebar is working:
1. ✅ Test extraction on multiple events
2. ⏳ Add database sync (later)
3. ⏳ Build stats dashboard in Aether
4. ⏳ Add team management features

**For now: Just extract and export data. No database sync yet!**

---

## 🆘 Need Help?

Check browser console logs:
```
F12 → Console tab
Look for: [Mat Ops] messages
```

Extension working if you see:
```
[Mat Ops] Sidebar loaded ✅
[Mat Ops] Extracted data: [...]
```

**Mat Ops is ready to extract wrestling stats from USABracketing!** 🤼
