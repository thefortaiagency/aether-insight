# Mat Ops Extension - Testing Checklist

**Date**: November 19, 2025
**Issue**: Extension not extracting stats, no console output

---

## Quick Debug Steps

### Step 1: Reload Extension
```
1. Go to: chrome://extensions/
2. Find "Mat Ops - Wrestling Stats Tracker"
3. Click the RELOAD button (🔄)
4. Verify it says "No errors"
```

### Step 2: Check Content Script Loaded
```
1. Go to: https://usabracketing.com
2. Navigate to "My Wrestlers" page
3. Press F12 (open DevTools)
4. Go to Console tab
5. Look for: "[Mat Ops] Content extractor loaded on USABracketing"
```

**If you DON'T see this message:**
- Content script isn't loading
- Check manifest.json matches correct
- Try refreshing the page

### Step 3: Check Side Panel Opens
```
1. Look for extension icon (Λ Aether logo) in Chrome toolbar (top right)
2. Click the icon
3. Side panel should slide in from right
4. Should show "Mat Ops" header with Aether logo
```

**If side panel doesn't open:**
- Extension not installed correctly
- Side panel permission missing

### Step 4: Test Extract Stats
```
1. With side panel open
2. Click "📊 Extract Stats" button
3. Watch Console (F12) for messages
4. Should see: "[Mat Ops] Received message: extract_stats"
5. Should see: "[Mat Ops] Found X wrestler containers"
```

**If no console messages:**
- Side panel can't communicate with content script
- Wrong page (not USABracketing)
- Extension reloading needed

### Step 5: Check Stats Display
```
After clicking "Extract Stats", the panel should show:
- Wrestlers: (number)
- Matches: (number)
- Wins: (number)
- Losses: (number)
```

**If all show "-":**
- Extraction returned no data
- Wrong selectors for USABracketing DOM
- Page structure changed

---

## Common Issues

### Issue: "Nothing in the inspect console"

**Cause**: Content script not loading

**Fix**:
1. Reload extension: chrome://extensions/ → Reload
2. Refresh USABracketing page
3. Make sure you're on usabracketing.com domain
4. Check Console for "[Mat Ops] Content extractor loaded"

### Issue: "Stats not filling in (shows -)"

**Cause**: Extraction not finding wrestlers

**Fix**:
1. Check you're on "My Wrestlers" page (not brackets page)
2. Open Console and manually run:
   ```javascript
   document.querySelectorAll('div[wire\\:id].mb-2').length
   ```
3. Should return number > 0
4. If 0, page structure changed

### Issue: "Side panel not opening"

**Cause**: Extension icon not working

**Fix**:
1. Reload extension
2. Look for Aether logo (Λ) in toolbar
3. If no icon, extension didn't install correctly
4. Check manifest.json has "sidePanel" permission

### Issue: "Extract Stats button does nothing"

**Cause**: Can't communicate with content script

**Fix**:
1. Check Console for errors
2. Verify content script loaded
3. Make sure on correct domain (usabracketing.com)
4. Try closing/reopening side panel

---

## Console Messages You SHOULD See

### On Page Load (USABracketing):
```
[Mat Ops] Content extractor loaded on USABracketing
```

### When Clicking "Extract Stats":
```
[Mat Ops] Received message: extract_stats
[Mat Ops] Found 10 wrestler containers
[Mat Ops] Found 2 weight classes for John Doe
[Mat Ops] John Doe - 120, 126 lbs - 15 matches
[Mat Ops] Total extracted: 10 wrestlers
```

### When Clicking "Auto-Expand All":
```
[Mat Ops] Received message: auto_expand
[Mat Ops] 🔄 Expanding all weight classes...
[Mat Ops] Found 20 weight class headers to expand
[Mat Ops] ✅ All weight classes expanded
```

### When Clicking "Capture Detailed Stats":
```
[Mat Ops] Received message: capture_detailed_stats
[Mat Ops] 🎯 Starting auto-capture of 50 matches
[Mat Ops] 🎯 Opening modal for match 1/50: abc123
[Mat Ops Parser] Starting parse, modal classes: ...
[Mat Ops Parser] Found period: Period 1
[Mat Ops] ✅ Captured abc123: 8 total stats
[Mat Ops] 🏁 Capture complete: 45 captured, 5 failed
```

---

## Manual Test (If Extension Fails)

### Test Content Script Manually:
1. Open USABracketing "My Wrestlers"
2. Open Console (F12)
3. Paste this code:
```javascript
// Test wrestler extraction
const wrestlerDivs = document.querySelectorAll('div[wire\\:id].mb-2, div[wire\\:id][class*="mb-2"]');
console.log('Found wrestlers:', wrestlerDivs.length);

// Test weight class headers
const weightHeaders = document.querySelectorAll('span[wire\\:click*="toggleMatches"]');
console.log('Found weight classes:', weightHeaders.length);

// Test match score links
const scoreLinks = document.querySelectorAll('a[href*="fetchScoreSummary"]');
console.log('Found match score links:', scoreLinks.length);
```

**Expected Results**:
- Found wrestlers: 10+ (if on "My Wrestlers" page)
- Found weight classes: 20+ (if wrestlers have multiple weight classes)
- Found match score links: 0 (if weight classes collapsed), 50+ (if expanded)

---

## File Locations

- **Extension Source**: `/Users/thefortob/Development/00-PRODUCTION/matops/extension-src/`
- **Content Script**: `content-extractor.js` (498 lines)
- **Side Panel UI**: `sidebar.html` (316 lines)
- **Side Panel JS**: `sidebar-panel.js` (434 lines)
- **Background Script**: `background.js` (AI integration)
- **Manifest**: `manifest.json`

---

## Quick Fixes

### If absolutely nothing works:

1. **Uninstall and Reinstall**:
   ```
   chrome://extensions/
   → Remove "Mat Ops"
   → Click "Load unpacked"
   → Select: /Users/thefortob/Development/00-PRODUCTION/matops/extension-src/
   ```

2. **Check for errors**:
   ```
   chrome://extensions/
   → Click "Errors" button under Mat Ops
   → Should show "No errors"
   ```

3. **Verify files exist**:
   ```bash
   ls -la /Users/thefortob/Development/00-PRODUCTION/matops/extension-src/

   # Should show:
   # content-extractor.js
   # sidebar.html
   # sidebar-panel.js
   # manifest.json
   # background.js
   # icons/aether-*.png
   ```

4. **Check manifest is valid**:
   ```bash
   cat extension-src/manifest.json | grep -E "version|sidePanel|content_scripts"

   # Should show:
   # "version": "1.0.0"
   # "sidePanel"
   # "content_scripts"
   ```

---

## Next Steps

If none of these work, we need to see:
1. **Console errors** (screenshot or copy/paste)
2. **Which page you're on** (URL)
3. **Extension errors** (chrome://extensions/ → Errors button)
4. **Chrome version** (chrome://version/)

**Then we can debug exactly what's wrong!**
