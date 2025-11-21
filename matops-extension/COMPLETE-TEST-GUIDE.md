# COMPLETE TEST GUIDE - All Fixes Ready!

**Date**: November 2025
**Commits**:
- `2250203` - Win/loss calculation fix
- `c1dd167` - Anthropic API key update
- Previous - Wrestler names, match extraction, function interceptor

---

## What's Been Fixed

✅ **Wrestler Name Extraction** - Now shows real names instead of "High School - 129 -"
✅ **Match Extraction** - 100 matches extracted (was 0)
✅ **Win/Loss Calculation** - Checks wrestler position relative to "over"
✅ **Function Interceptor** - Detects user clicks on match scores
✅ **AI API Key** - Updated with correct Anthropic Claude key
✅ **MutationObserver** - Watches for modal updates

---

## FULL TEST WORKFLOW

### Step 1: Reload Extension ⚡
```
1. Go to: chrome://extensions/
2. Find "Mat Ops"
3. Click RELOAD button 🔄
4. Wait for confirmation
```

### Step 2: Refresh USABracketing 🌐
```
1. Go to your "My Wrestlers" page
2. Press Cmd+R (or F5)
3. Wait for page to fully load
```

### Step 3: Open Console (for monitoring) 🔍
```
1. Press F12 (or Cmd+Option+I)
2. Go to Console tab
3. Clear console (Cmd+K)
4. Keep it open to watch logs
```

### Step 4: Open Side Panel 📊
```
1. Click Mat Ops extension icon (Λ) in toolbar
2. Side panel opens from right
```

---

## TEST 1: Extract Stats

### Action
- Click "Extract Stats" button

### Expected Console Output
```
[Mat Ops] Found 21 wrestler containers
[Mat Ops] Found 2 weight classes for Braxtyn Bauer
[Mat Ops] Braxtyn Bauer - 129 lbs - 3 matches
[Mat Ops] Found 2 weight classes for Konnor Cleveland
[Mat Ops] Konnor Cleveland - 135 lbs - 5 matches
...
[Mat Ops] Total extracted: 21 wrestlers
```

### Expected Side Panel Stats
```
Wrestlers: 21
Matches: 100
Wins: 40-60 (realistic split, NOT 100!)
Losses: 40-60 (realistic split, NOT 0!)
```

### ✅ Success Criteria
- Real wrestler names in console
- Match counts shown per wrestler
- Win/Loss adds up to 100 with realistic split

### ❌ If Failed
- Shows "-" instead of numbers → Extraction failed
- Shows 100 wins, 0 losses → Win/loss logic didn't work
- Shows 0 matches → Match parsing failed

---

## TEST 2: Auto-Expand All

### Action
- Click "Auto-Expand All" button

### Expected Console Output
```
[Mat Ops] Expanding all weight classes...
[Mat Ops] Expanded 42 weight class sections
[Mat Ops] fetchScoreSummary intercepted!
[Mat Ops] ✅ Function interceptor attached! Click any match score to auto-capture
```

### Expected Side Panel
- Button text changes to "✓ Expanded"
- Captured counter shows: "Captured: 0 matches"

### ✅ Success Criteria
- Console shows "fetchScoreSummary intercepted!"
- Console shows "Function interceptor attached!"

### ❌ If Failed
- No "intercepted" message → Function interceptor not working

---

## TEST 3: Multi-Click Capture (THE BIG TEST!)

### Action
Click 3-5 different match scores (blue "Dec 5-2" links)

### Expected Console Output for EACH CLICK
```
[Mat Ops] 👆 User clicked match: abc123
[Mat Ops] 🎯 Modal with period data detected for abc123
[Mat Ops] ✅ Captured abc123: 8 total stats, stored in Map (size: 1)

[Mat Ops] 👆 User clicked match: xyz789
[Mat Ops] 🎯 Modal with period data detected for xyz789
[Mat Ops] ✅ Captured xyz789: 12 total stats, stored in Map (size: 2)

[Mat Ops] 👆 User clicked match: def456
[Mat Ops] 🎯 Modal with period data detected for def456
[Mat Ops] ✅ Captured def456: 6 total stats, stored in Map (size: 3)
```

### Expected Side Panel
- "Captured: 1 matches" → "Captured: 2 matches" → "Captured: 3 matches"
- Counter updates in real-time

### ✅ Success Criteria
- DIFFERENT match IDs for each click
- Map size INCREASES: (size: 1) → (size: 2) → (size: 3)
- Side panel counter updates
- Different "total stats" numbers per match

### ❌ If Failed
- No "👆 User clicked" message → Click listener not firing
- Same match ID captured multiple times → Still capturing wrong modal
- Map size stays at (size: 1) → Multi-click still broken
- No "🎯 Modal detected" → MutationObserver not working

**Close modal between clicks** (X button or ESC key)

---

## TEST 4: AI Chat

### Action
1. After extracting stats, scroll to AI Chat section
2. Type question: "Which wrestler has the most wins?"
3. Click "Ask AI"

### Expected Console Output
```
[Mat Ops] AI question: Which wrestler has the most wins?
[Mat Ops] Sending to Anthropic API...
[Mat Ops] AI response received
```

### Expected Side Panel
- Loading indicator appears
- AI response shows in chat
- Response mentions specific wrestler names and stats

### ✅ Success Criteria
- No API key error
- Response mentions real wrestler names from your data
- Response is relevant to question

### ❌ If Failed
- "Error: AI API error: invalid x-api-key" → API key still wrong
- "Error: No stats available" → Need to extract stats first
- Generic response → AI not using your stats context

---

## TEST 5: Export JSON

### Action
- Click "Export JSON" button

### Expected Result
- File downloads: `matops-stats-[timestamp].json`
- Open file in text editor

### Expected JSON Structure
```json
{
  "wrestlers": [
    {
      "name": "Braxtyn Bauer",
      "team": "WART",
      "state": "IA",
      "weightClasses": [
        {
          "division": "High School",
          "weight": 129,
          "placement": "3rd Place",
          "matches": [
            {
              "opponent": "Gavin Reed",
              "result": "Loss",
              "winType": "Decision",
              "score": "Dec 2-0"
            }
          ]
        }
      ]
    }
  ],
  "detailedStats": [
    {
      "matchId": "abc123",
      "takedowns": 3,
      "escapes": 2,
      "reversals": 1,
      "nearfall2": 0,
      "nearfall3": 1,
      "nearfall4": 0
    }
  ],
  "metadata": {
    "exportedAt": "2025-11-19T...",
    "totalWrestlers": 21,
    "totalMatches": 100
  }
}
```

### ✅ Success Criteria
- JSON file downloads successfully
- Real wrestler names present
- Match results show both Wins AND Losses
- Detailed stats included (if matches were clicked)
- Valid JSON (can parse in text editor)

### ❌ If Failed
- File doesn't download → Export functionality broken
- Empty or minimal data → Extraction didn't work
- All wins, no losses → Win/loss fix didn't work
- No detailed stats → Multi-click capture didn't work

---

## COMPLETE SUCCESS CHECKLIST

After all tests, you should have:

- [ ] Stats Summary shows: 21 wrestlers, 100 matches, ~40-60 wins, ~40-60 losses
- [ ] Console shows real wrestler names during extraction
- [ ] Console shows "fetchScoreSummary intercepted!" after auto-expand
- [ ] Console shows different match IDs when clicking multiple matches
- [ ] Side panel counter increases: 0 → 1 → 2 → 3 matches captured
- [ ] AI chat responds without API key error
- [ ] Exported JSON contains real data with wins AND losses
- [ ] Exported JSON includes detailed stats for clicked matches

---

## IF SOMETHING FAILS

### Win/Loss Still Shows 100/0
1. Check console during extraction
2. Copy 2-3 match text lines from page
3. Tell me which wrestler's page you're on
4. Send console output

### Multi-Click Still Broken
1. Check if "fetchScoreSummary intercepted!" appears in console
2. Check if "👆 User clicked match" appears when clicking
3. Send console output for 3 consecutive clicks
4. Tell me if side panel counter updates

### AI Not Working
1. Check exact error message
2. Send console output
3. Verify you extracted stats first

### Export Empty/Wrong
1. Make sure you clicked "Extract Stats" first
2. Check Stats Summary numbers
3. Send me first 50 lines of exported JSON

---

## QUICK COMMANDS (Console Testing)

If you want to test manually, paste these in browser console:

### Test if content script loaded
```javascript
console.log('detailedMatches:', typeof detailedMatches);
console.log('extractWrestlers:', typeof extractWrestlers);
```

### Test extraction manually
```javascript
const wrestlers = extractWrestlers();
console.log('Extracted:', wrestlers.length, 'wrestlers');
console.log('First wrestler:', wrestlers[0]);
```

### Check detailed captures
```javascript
console.log('Captured matches:', detailedMatches.size);
detailedMatches.forEach((data, id) => console.log(id, data));
```

---

**LET'S TEST THIS NOW!** 🎯

Follow each test in order and let me know:
1. Which tests pass ✅
2. Which tests fail ❌
3. Console output for any failures
4. Screenshots if helpful

We're SO CLOSE to having this fully working! 🔥
