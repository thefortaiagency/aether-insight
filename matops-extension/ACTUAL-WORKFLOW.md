# Mat Ops - ACTUAL Workflow (The Real Way)

**Date**: November 19, 2025
**Commit**: bfbfc28 - Fixed manual click listener capture

---

## What I Misunderstood 🤦

### I Thought:
- Click button → Extension automatically clicks all 50 matches for you
- Watch modals open/close automatically
- Wait ~90 seconds while it runs

### Actually:
- Click button → Extension **attaches listeners** to all match links
- **YOU manually click each match** (Dec 9-6, Fall 2:34, etc.)
- Extension **auto-captures when YOU open** the modal
- As fast as you can click!

---

## The REAL Workflow ✅

### Step 1: Extract Basic Stats
```
1. Go to: https://usabracketing.com → "My Wrestlers"
2. Click extension icon (Λ) in toolbar
3. Side panel opens from right
4. Click "📊 Extract Stats"
5. Stats summary updates (wrestlers, matches, wins, losses)
```

**Result**: Basic wrestler/match data captured

---

### Step 2: Auto-Expand + Attach Listeners
```
1. Click "🔄 Auto-Expand All"
2. All weight class sections expand on page
3. Extension attaches click listeners to ALL match score links
4. Instructions panel appears in side panel:

   📋 To Capture Detailed Stats:
   1. Weight classes are now expanded
   2. Click any match score (e.g., "Dec 9-6")
   3. Extension auto-captures when modal opens
   4. Click Export when done - includes all captured stats!

   Captured: 0 matches
```

**Result**: Page ready, listeners attached, waiting for YOUR clicks

---

### Step 3: Click Matches Manually (YOU DO THIS!)
```
1. On the USABracketing page, you'll see expanded matches
2. Each match has a score link: "Dec 9-6", "Fall 2:34", "Tech Fall 18-3"
3. Click the FIRST match score → Modal opens
4. Extension auto-captures takedowns, escapes, reversals, etc.
5. Close modal (X button or ESC key)
6. Click NEXT match score → Auto-captures again
7. Repeat for all matches you want detailed stats for

Watch the counter in side panel:
"Captured: 1 matches"
"Captured: 2 matches"
"Captured: 3 matches"
...
```

**Result**: Detailed stats captured for each match YOU click

---

### Step 4: Export Everything
```
1. When done clicking matches, click "💾 Export JSON"
2. Extension merges:
   - Basic stats (wrestler, team, weight classes, basic match info)
   - Detailed stats (takedowns, escapes, reversals for captured matches)
3. Downloads: matops-export-2025-11-19.json
4. Status shows: "Exported 10 wrestlers (15/50 with detailed stats)"
```

**Result**: JSON file with ALL data (basic + detailed)

---

## Technical Details

### What Happens During Auto-Expand

**Function**: `attachMatchScoreListeners()` in `content-extractor.js`

```javascript
function attachMatchScoreListeners() {
  // Find all match score links
  const scoreLinks = document.querySelectorAll('a[href*="fetchScoreSummary"]');

  scoreLinks.forEach(link => {
    // Attach click listener
    link.addEventListener('click', (e) => {
      const matchId = extractMatchId(link.href);

      // Wait for modal to load, then auto-capture
      setTimeout(() => {
        captureMatchDetail(matchId);
      }, 1000);
    });
  });
}
```

**What it does**:
1. Finds all 50+ match score links: `<a href="javascript:fetchScoreSummary('abc123')">Dec 9-6</a>`
2. Attaches click event listener to each one
3. When YOU click the link:
   - Extracts match ID from href
   - Waits 1000ms for modal to load (Livewire takes time)
   - Calls `captureMatchDetail(matchId)` to parse modal
   - Stores in `detailedMatches` Map

---

### What Happens When You Click a Match

**User Action**: Click "Dec 9-6" link on page

**Extension Response**:
1. Click listener fires
2. Extracts match ID: "abc123"
3. Logs: `[Mat Ops] 👆 User clicked match: abc123`
4. Waits 1000ms for modal to appear
5. Finds modal: `document.querySelectorAll('.mx-auto.max-w-md.rounded.shadow-md')`
6. Validates it has period data (not wrestler profile)
7. Parses modal with `parseMatchDetail(modal)`:
   - Counts takedowns (green text = wrestler, red text = opponent)
   - Counts escapes
   - Counts reversals
   - Counts nearfalls (2/3/4 points)
   - Counts penalties
   - Detects pins
   - Builds period-by-period event timeline
8. Stores in Map: `detailedMatches.set('abc123', detailedStatsObject)`
9. Logs: `[Mat Ops] ✅ Captured abc123: 8 total stats`

**Side Panel Response**:
- Every 2 seconds, polls for captured count
- Updates: "Captured: 1 matches" → "Captured: 2 matches"

---

## Console Messages You'll See

### When Auto-Expand Clicked:
```
[Mat Ops] Received message: auto_expand
[Mat Ops] 🔄 Expanding all weight classes...
[Mat Ops] Found 20 weight class headers to expand
[Mat Ops] ✅ All weight classes expanded
[Mat Ops] 🎯 Attaching listeners to 50 match score links
[Mat Ops] ✅ Listeners attached! Click any match score to auto-capture
```

### When YOU Click a Match:
```
[Mat Ops] 👆 User clicked match: abc123
[Mat Ops] 🔍 Attempting to capture abc123 (retry 0/3)
[Mat Ops] Found 1 potential modals
[Mat Ops Parser] Starting parse, modal classes: mx-auto max-w-md rounded shadow-md
[Mat Ops Parser] Found period: Period 1
[Mat Ops Parser] Found period: Period 2
[Mat Ops Parser] Found period: Period 3
[Mat Ops Parser] ✅ Parsed 8 total moves for wrestler
[Mat Ops] ✅ Captured abc123: 8 total stats, stored in Map (size: 1)
```

### When YOU Click Next Match:
```
[Mat Ops] 👆 User clicked match: xyz789
[Mat Ops] 🔍 Attempting to capture xyz789 (retry 0/3)
...
[Mat Ops] ✅ Captured xyz789: 12 total stats, stored in Map (size: 2)
```

---

## Why This is Better Than Auto-Clicking

### Auto-Click (What I Built):
- ❌ Takes 1.8 seconds per match × 50 = 90 seconds total
- ❌ User sits and watches
- ❌ Can't skip matches you don't care about
- ❌ Network lag affects timing
- ❌ Failure rate higher (timing sensitive)

### Manual Click + Auto-Capture (The Real Way):
- ✅ As fast as YOU can click (10-20 seconds for 50 matches)
- ✅ You control which matches to capture
- ✅ Skip matches you don't care about
- ✅ Retry instantly if capture fails (just click again)
- ✅ More reliable (you see modal open before capture)
- ✅ Natural workflow (same as browsing normally)

---

## Features We Have

### 1. Auto-Expand ✅
**Button**: "🔄 Auto-Expand All"
**What it does**: Expands all weight class sections + attaches listeners
**When to use**: After extracting basic stats

### 2. Manual Click + Auto-Capture ✅
**How it works**: YOU click matches, extension captures automatically
**When to use**: After auto-expanding
**What you see**: "Captured: X matches" counter updates

### 3. Export with Merge ✅
**Button**: "💾 Export JSON"
**What it does**: Merges basic stats + detailed stats into one JSON
**Format**: `{ wrestler, matches: [{ opponent, result, takedowns, escapes, ... }] }`

### 4. AI Analysis ✅
**Input**: "Who had the most takedowns?"
**What it does**: Analyzes captured detailed stats
**Works with**: Both basic stats and detailed stats (if captured)

---

## Features We Also Have (Optional)

### Bulk Auto-Click (Still Available!)
**Function**: `captureAllMatchDetails()` in content-extractor.js
**What it does**: Automatically clicks all 50 matches for you
**How to use**: We could add a button for this if you want it

**Not currently exposed in UI because**:
- Manual clicking is faster
- Manual clicking is more reliable
- Manual clicking lets you skip matches

**But the code is there if you want it!**

---

## What YOU Need to Do Now

### Test the REAL Workflow:

1. **Reload Extension**:
   ```
   chrome://extensions/ → Mat Ops → Reload
   ```

2. **Go to USABracketing**:
   ```
   https://usabracketing.com → "My Wrestlers"
   ```

3. **Open Side Panel**:
   - Click extension icon (Λ)
   - Side panel opens

4. **Extract Stats**:
   - Click "📊 Extract Stats"
   - Verify stats summary shows numbers

5. **Auto-Expand**:
   - Click "🔄 Auto-Expand All"
   - Verify instructions panel appears
   - Check console: "[Mat Ops] ✅ Listeners attached!"

6. **Click Matches Manually**:
   - On USABracketing page, click first match score (e.g., "Dec 9-6")
   - Modal opens
   - Check console: "[Mat Ops] 👆 User clicked match: abc123"
   - Check console: "[Mat Ops] ✅ Captured abc123: 8 total stats"
   - Check side panel: "Captured: 1 matches"
   - Close modal
   - Click next match
   - Verify counter updates: "Captured: 2 matches"

7. **Export**:
   - Click "💾 Export JSON"
   - Open downloaded file
   - Verify matches have detailed fields (takedowns, escapes, etc.)

---

## If It Still Doesn't Work

### Check Console for:
```
[Mat Ops] Content extractor loaded on USABracketing
```

**If NOT there**: Content script didn't load
- Reload extension
- Refresh USABracketing page
- Check you're on correct domain

### Check Console for:
```
[Mat Ops] ✅ Listeners attached! Click any match score to auto-capture
```

**If NOT there**: Listeners didn't attach
- Make sure auto-expand completed successfully
- Try clicking auto-expand again

### Check Console After Clicking Match:
```
[Mat Ops] 👆 User clicked match: abc123
```

**If NOT there**: Listener didn't fire
- Listener might not have attached
- Wrong element clicked (click the score link, not wrestler name)
- Console refresh the page and try again

---

## Summary

**Coach, you were 100% RIGHT** - I lost the click listener functionality!

**What we had**:
- Auto-expand → Attach listeners → YOU click matches → Auto-capture on your clicks

**What I built**:
- Bulk auto-clicking all matches (wrong workflow!)

**What we have NOW**:
- ✅ Auto-expand with listener attachment
- ✅ Manual click + auto-capture (the REAL workflow)
- ✅ Live counter showing captured matches
- ✅ Export with detailed stats merge
- ✅ AI analysis of detailed stats

**Test it and let me know if the click listeners work now!** 🎯
