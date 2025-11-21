# Mat Ops Sidebar - Troubleshooting Guide

## If You Don't See the Sidebar

### Step 1: Reload Extension FIRST!
**CRITICAL**: You MUST reload the extension after making changes!

```bash
1. Open: chrome://extensions/
2. Find: "Mat Ops - Wrestling Stats Tracker"
3. Click: The circular RELOAD icon 🔄
4. Look for: "Service worker (Active)" - should say "Active"
```

### Step 2: Refresh USABracketing Page
```bash
1. Go to: https://usabracketing.com
2. Navigate to: "My Wrestlers" page
3. Press: F5 (full page refresh)
```

### Step 3: Check Console for Errors
```bash
1. Press: F12 (opens DevTools)
2. Click: "Console" tab
3. Look for: "[Mat Ops] Sidebar loaded ✅"
```

**Expected Console Output**:
```
[Mat Ops] Sidebar loaded ✅
[Mat Ops] Found 21 wrestler containers
[Mat Ops] Expanding 21 weight classes...
```

**If You See Errors**:
- Red text = problem!
- Copy error message and send it back

---

## How to Open Sidebar

### Automatic (Default)
- Sidebar appears **automatically** on the right side when you load USABracketing
- Blue gradient background
- Aether logo (Λ) in header

### If Sidebar is Collapsed
1. Look at the **right edge** of your screen
2. You should see a **blue tab** with the Aether logo
3. Click the tab to expand sidebar

**What the tab looks like**:
```
                    ┌──┐
                    │Λ │  ← Blue tab with Aether logo
                    └──┘
```

### If You Don't See the Tab
1. Sidebar might still be open (look for blue panel on right)
2. Extension might not be loaded (check step 1 above)
3. You might be on wrong page (needs to be usabracketing.com)

---

## Common Issues

### Issue 1: "I don't see anything at all"
**Solution**:
1. Extension not loaded → Reload extension (chrome://extensions/)
2. Wrong page → Go to usabracketing.com
3. Check console for errors (F12)

### Issue 2: "Sidebar was there, now it's gone"
**Solution**:
1. You probably clicked the collapse arrow (←)
2. Look for blue tab on right edge of screen
3. Click tab to expand sidebar

### Issue 3: "I see the tab but clicking doesn't work"
**Solution**:
1. Reload extension (chrome://extensions/)
2. Refresh page (F5)
3. Check console for JavaScript errors

### Issue 4: "Extension icon in toolbar but no sidebar"
**Solution**:
1. Make sure you're on usabracketing.com (not just any page)
2. Reload extension
3. Refresh page
4. Check console output

---

## What You SHOULD See

### On Page Load (usabracketing.com)
```
Right side of screen:
┌─────────────────────────────┐
│ [Λ Logo] Mat Ops    [↻] [←] │ ← Header with Aether logo
├─────────────────────────────┤
│ Stats Summary               │
│ Wrestlers: -                │
│ Matches: -                  │
│ Wins: -                     │
│ Losses: -                   │
├─────────────────────────────┤
│ Wrestlers                   │
│ Extracting stats...         │
├─────────────────────────────┤
│ Actions                     │
│ [Expand All & Extract]      │
│ [Refresh Stats]             │
│ [Export JSON]               │
└─────────────────────────────┘
```

### After 3 Seconds (Auto-Expand)
```
Status message:
"✅ Extracted 21 wrestlers, 87 matches. Click match scores to capture details."

Wrestlers list populated with cards
```

### When Collapsed
```
Right edge of screen:
┌──┐
│Λ │ ← Blue tab (click to expand)
└──┘
```

---

## Console Debug Commands

Open console (F12) and try these:

### Check if extension loaded
```javascript
console.log(document.getElementById('matops-sidebar'))
```
**Expected**: Should show HTML element or `null` if not loaded

### Check if toggle tab exists
```javascript
console.log(document.getElementById('matops-toggle-tab'))
```
**Expected**: Should show HTML element

### Manually show sidebar (if hidden)
```javascript
const sidebar = document.getElementById('matops-sidebar');
if (sidebar) sidebar.classList.remove('matops-sidebar-collapsed');
```

### Manually show toggle tab
```javascript
const tab = document.getElementById('matops-toggle-tab');
if (tab) tab.style.display = 'flex';
```

---

## Quick Checklist

Before asking for help, verify:

- [ ] Extension reloaded (chrome://extensions/ → Reload)
- [ ] Page refreshed (F5)
- [ ] On usabracketing.com domain
- [ ] Console shows "[Mat Ops] Sidebar loaded ✅"
- [ ] No red errors in console
- [ ] Tried clicking right edge of screen for toggle tab

---

## If Still Not Working

Send me:
1. **Screenshot** of the page
2. **Console output** (F12 → Console tab → screenshot)
3. **Extensions page** (chrome://extensions/ → Mat Ops → screenshot)
4. **Which page** you're on (exact URL)

Then I can diagnose the exact issue!

---

## Expected Behavior Summary

**AUTOMATIC**:
1. Load usabracketing.com → Sidebar appears on right (blue panel)
2. Wait 3 seconds → Stats extract automatically
3. Sidebar always visible unless you collapse it

**TOGGLE**:
1. Click collapse arrow (←) → Sidebar slides away
2. Blue tab appears on right edge
3. Click tab → Sidebar expands back

**NO MANUAL SETUP NEEDED** - it should just work!

If it's not working, there's a specific issue we need to debug.
