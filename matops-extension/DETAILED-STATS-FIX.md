# Mat Ops - Detailed Stats Capture Fixed

## Problem
**Coach's Feedback**: "If i click on a match for details it will grab the first one when I hit refresh but none after that."

The modal observer was only firing once because USABracketing **reuses the same modal container** - it doesn't create new DOM nodes for each match, just changes the content.

## Solution

Switched from passive modal observation to **active click interception**:

### How It Works Now

1. **On Page Load** - Extension finds ALL match score links
   ```
   [Mat Ops] Found 87 match score links
   ```

2. **Attach Click Listeners** - Each link gets a click handler
   - Link format: `<a href="javascript:fetchScoreSummary('match-id-123')">Dec 2-0</a>`
   - Listener extracts match ID from href

3. **When You Click** - Match score link is clicked
   ```
   [Mat Ops] 🎯 Match score clicked: d01c4f14-ce9d-4856-b3b3-cb1b0993dfc7
   ```

4. **Wait for Modal** - Extension waits 800ms for modal to load

5. **Capture Details** - Parses modal content with known match ID
   ```
   [Mat Ops] 📊 Captured match detail for d01c4f14-ce9d-4856-b3b3-cb1b0993dfc7:
   {
     takedowns: 1,
     escapes: 0,
     reversals: 0,
     nearfalls: 0,
     periods: 3
   }
   ```

6. **Repeat for Every Match** - Works for all subsequent clicks!

### New Methods Added

#### `attachMatchScoreListeners()`
- Finds all `a[href*="fetchScoreSummary"]` links
- Attaches click listener to each one
- Prevents duplicate listeners with `data-matops-listener` attribute
- Re-runs when new matches are loaded (Livewire updates)

#### `captureMatchDetail(matchId)`
- Waits for modal to appear
- Checks if modal has content (not empty)
- Retries if modal isn't ready (up to 3 attempts)
- Parses detailed stats with `parseMatchDetail()`
- Stores in `detailedMatches` Map
- Updates sidebar status

## User Workflow

### Fully Automatic Match Extraction
1. Load My Wrestlers page
2. Wait 4 seconds (auto-expand + extract)
3. See: "✅ Extracted 21 wrestlers, 87 matches"

### Manual Detailed Stats Capture
4. **Click match score** (e.g., "Dec 2-0") → Modal opens
5. **Check console**: `🎯 Match score clicked: ...`
6. **Wait 1 second** → Extension captures automatically
7. **Check sidebar**: "📊 Captured detailed stats (1 matches)"
8. **Close modal, click next match** → Repeat steps 4-7
9. **After all matches**: "📊 Captured detailed stats (87 matches)"

### Export
10. Click "Export JSON"
11. See: "✅ Exported 21 wrestlers (87/87 matches with detailed stats)"

## Console Output Example

```
[Mat Ops] Found 21 wrestler containers
[Mat Ops] Expanding 21 weight classes...
[Mat Ops] Clicked 21 weight class headers
[Mat Ops] Total extracted: 21 wrestlers
[Mat Ops] Found 87 match score links          ← Click listeners attached

User clicks first match:
[Mat Ops] 🎯 Match score clicked: d01c4f14... ← Click detected
[Mat Ops] 📊 Captured match detail for d01c4f14: { takedowns: 1, ... }

User clicks second match:
[Mat Ops] 🎯 Match score clicked: 8557abae... ← Works!
[Mat Ops] 📊 Captured match detail for 8557abae: { takedowns: 3, ... }

User clicks third match:
[Mat Ops] 🎯 Match score clicked: f462ce31... ← Works!
[Mat Ops] 📊 Captured match detail for f462ce31: { takedowns: 2, ... }

... continues for all 87 matches ...
```

## Export Data Structure

**Basic match data** (always captured):
```json
{
  "mat": "Mat 2",
  "bout": "3011",
  "round": "Champ. Rd of 128",
  "opponent": "Gavin Reed",
  "opponentTeam": "MHS",
  "result": "Loss",
  "winType": "Decision",
  "score": "Dec 2-0",
  "wrestlerScore": 0,
  "opponentScore": 2,
  "matchId": "d01c4f14-ce9d-4856-b3b3-cb1b0993dfc7",
  "videoUrl": "https://youtu.be/..."
}
```

**Detailed stats** (captured when you click match):
```json
{
  // ... all basic data above ...
  "takedowns": 1,
  "escapes": 0,
  "reversals": 0,
  "nearfall2": 0,
  "nearfall3": 0,
  "nearfall4": 0,
  "penalty1": 0,
  "penalty2": 0,
  "takedownsOpp": 0,
  "escapesOpp": 1,
  "reversalsOpp": 0,
  "nearfall2Opp": 0,
  "nearfall3Opp": 0,
  "nearfall4Opp": 0,
  "penalty1Opp": 0,
  "penalty2Opp": 0,
  "pin": false,
  "pinOpp": false,
  "periods": [
    {
      "period": 1,
      "events": [
        { "wrestler": "self", "move": "Takedown 2", "timestamp": "1:45" },
        { "wrestler": "opponent", "move": "Escape 1", "timestamp": "1:22" }
      ]
    },
    { "period": 2, "events": [...] },
    { "period": 3, "events": [...] }
  ]
}
```

## Benefits

✅ **Reliable** - Captures every match you click, not just the first
✅ **Automatic** - No "Refresh" button needed, captures on click
✅ **Resilient** - Retries if modal is slow to load
✅ **Clear Feedback** - Console and sidebar show exactly what's captured
✅ **Flexible** - Click only the matches you want detailed stats for

## Limitations (By Design)

⚠️ **Manual Clicking Required** - You have to click each match score to get detailed stats
- This is a USABracketing limitation (data is behind modals)
- We could automate clicking all 87 matches, but that would:
  * Take 2-3 minutes (87 matches × 2 seconds each)
  * Slam USABracketing server with requests
  * Look suspicious/get rate limited
- **Coach's Decision**: "ideally we don't have to click through all the matches but if we do we can deal with that"

## Future Automation Ideas

If you want to capture all matches automatically:

**Option A: Batch Clicker**
- Add "Capture All Details" button
- Automatically click through all 87 matches
- Show progress: "Capturing 23/87 matches..."
- Takes 2-3 minutes, but fully automated

**Option B: Selective Capture**
- Add checkboxes next to wrestlers
- "Capture Details for Selected" button
- Only clicks matches for checked wrestlers
- Faster than all 87, more control

**Option C: Smart Detection**
- Check if match is a win/loss that matters for stats
- Auto-click only important matches (tournament rounds, not byes)
- Reduces clicks from 87 to ~40-50

## Testing Checklist

- [ ] Load page, wait 4 seconds (auto-expand works)
- [ ] Click first match score → Check console for "🎯 Match score clicked"
- [ ] Wait 1 second → Check console for "📊 Captured match detail"
- [ ] Check sidebar → "📊 Captured detailed stats (1 matches)"
- [ ] Close modal, click second match → Should capture!
- [ ] Click 3-5 more matches → Should capture all of them
- [ ] Export JSON → Check file has detailed stats for clicked matches

---

**Ready to test, Coach!** Reload extension and try clicking multiple match scores. Each one should now capture correctly!
