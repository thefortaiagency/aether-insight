# Mat Ops - Fixes Applied (Nov 19, 2025)

## Issue 1: 0 Matches Extracted

**Problem**: Wrestlers were being extracted (21 found) but 0 matches for all of them.

## Root Cause

The selectors were too generic. The parser was looking for ANY `<ul> <li>` elements, but needed to find the SPECIFIC match list:

```html
<ul class="divide-y divide-gray-200 text-sm text-gray-800">
  <li class="p-2">Match data here...</li>
</ul>
```

## Fixes Applied

### 1. Updated Weight Class Parser

**Before**:
```javascript
const matchItems = weightDiv.querySelectorAll('ul li');
```

**After**:
```javascript
// Find the specific match list
const matchList = weightDiv.querySelector('ul.divide-y.divide-gray-200, ul.divide-y');
if (!matchList) {
  console.log('[Mat Ops] No match list found in weight class');
  return weightClass;
}

// Get only <li class="p-2"> elements (skip headers)
const matchItems = matchList.querySelectorAll('li.p-2');
```

### 2. Updated Weight Header Selector

**Before**:
```javascript
const weightHeader = weightDiv.querySelector('.text-usa-blue.underline.cursor-pointer');
```

**After**:
```javascript
const weightHeader = weightDiv.querySelector('.text-usa-blue.underline.cursor-pointer, span[wire\\:click*="toggleMatches"]');
```

This handles Livewire's wire:click attribute.

### 3. Updated Wrestler Container Selector

**Before**:
```javascript
const wrestlerDivs = document.querySelectorAll('div[wire\\:id][class*="mb-2"]');
```

**After**:
```javascript
const wrestlerDivs = document.querySelectorAll('div[wire\\:id].mb-2, div[wire\\:id][class*="mb-2"]');
```

More flexible to handle both exact match and partial match.

### 4. Updated Weight Class Section Selector

**Before**:
```javascript
const weightDivs = div.querySelectorAll('.bg-gray-50.p-4.rounded-lg.shadow-sm.border');
```

**After**:
```javascript
const weightDivs = div.querySelectorAll('.bg-gray-50.p-4.rounded-lg, .bg-gray-50.p-4');
```

More flexible selector that matches actual HTML structure.

### 5. Added Console Logging

Added detailed logging to help debug:
- `[Mat Ops] Found X wrestler containers`
- `[Mat Ops] Found X weight classes for {name}`
- `[Mat Ops] Found X match items`
- `[Mat Ops] {name} - {weight} lbs - X matches`
- `[Mat Ops] Total extracted: X wrestlers`

### 6. Added Match Validation

**Before**:
```javascript
if (match) {
  weightClass.matches.push(match);
}
```

**After**:
```javascript
// Additional safety check
if (!text.includes('Bout') && !text.includes('over') && !text.includes('lost to')) {
  return;
}

const match = parseMatchLine(text, li);
if (match && (match.bout || match.opponent)) {
  weightClass.matches.push(match);
}
```

Only adds matches that have valid bout number or opponent.

## How to Test

1. **Reload Extension**:
   - Go to `chrome://extensions/`
   - Find "Mat Ops - Wrestling Stats Tracker"
   - Click the reload icon (circular arrow)

2. **Refresh USABracketing Page**:
   - Go back to My Wrestlers page
   - Press F5 to refresh

3. **Check Console**:
   - Press F12 to open DevTools
   - Go to Console tab
   - Look for `[Mat Ops]` messages showing:
     * Number of wrestlers found
     * Number of weight classes per wrestler
     * Number of matches per weight class

4. **Check Sidebar**:
   - Should now show match counts > 0
   - Each wrestler card should show actual match numbers
   - Stats summary should show total matches/wins/losses

## Expected Output

**Console**:
```
[Mat Ops] Found 21 wrestler containers
[Mat Ops] Found 1 weight classes for Braxtyn Bauer
[Mat Ops] Found 5 match items
[Mat Ops] Braxtyn Bauer - 129 lbs - 5 matches
[Mat Ops] Found 1 weight classes for Konnor Cleveland
[Mat Ops] Found 3 match items
[Mat Ops] Konnor Cleveland - 109 lbs - 3 matches
...
[Mat Ops] Total extracted: 21 wrestlers
```

**Sidebar**:
```
Stats Summary
Wrestlers: 21
Matches: 87 (example total)
Wins: 45
Losses: 42

Wrestlers
Braxtyn Bauer (Warrior RTC)
  5W 0L - 5 matches
  129 lbs - DNP

Konnor Cleveland (The Fort Hammers)
  2W 1L - 3 matches
  109 lbs - DNP
```

## What If It Still Doesn't Work?

If matches are still showing 0:

1. **Check if weight classes are expanded**:
   - Click on "High School - 129 - (DNP)" to expand
   - Matches might be collapsed by default
   - Try clicking "Refresh Stats" button after expanding

2. **Run the HTML inspector**:
   - Copy/paste `/Users/thefortob/Development/00-PRODUCTION/matops/extension-src/html-inspector.js` into console
   - Send me the output, especially "STEP 7"

3. **Check console for errors**:
   - Look for red error messages
   - Look for `[Mat Ops] No match list found` messages
   - This tells us if the selector is still wrong

---

## Issue 2: Sidebar Won't Expand When Collapsed

**Problem**: Clicking the sidebar collapse button hides it, but there's no way to expand it again.

## Root Cause

The collapsed tab was created using CSS `::before` pseudo-element, which **cannot have click event listeners**. Pseudo-elements don't exist in the DOM, so JavaScript can't attach handlers to them.

## Fix Applied

### 1. Created Real DOM Element for Toggle Tab

**Added to `content-matops.js`**:
```javascript
createToggleTab() {
  const tab = document.createElement('div');
  tab.id = 'matops-toggle-tab';
  tab.className = 'matops-toggle-tab';
  tab.innerHTML = '🤼';
  tab.style.display = 'none'; // Hidden by default (sidebar starts open)

  tab.addEventListener('click', () => {
    this.toggleSidebar();
  });

  document.body.appendChild(tab);
}
```

### 2. Updated Toggle Logic

**Before**:
```javascript
toggleSidebar() {
  this.isOpen = !this.isOpen;
  this.panel.classList.toggle('matops-sidebar-collapsed', !this.isOpen);
  // Only changed icon arrow direction
}
```

**After**:
```javascript
toggleSidebar() {
  this.isOpen = !this.isOpen;
  this.panel.classList.toggle('matops-sidebar-collapsed', !this.isOpen);

  const tab = document.getElementById('matops-toggle-tab');

  if (this.isOpen) {
    // Hide tab when sidebar is open
    if (tab) tab.style.display = 'none';
  } else {
    // Show tab when sidebar is collapsed
    if (tab) tab.style.display = 'flex';
  }
}
```

### 3. Updated CSS

**Removed** (non-functional):
```css
.matops-sidebar-collapsed::before { ... }
```

**Added** (functional):
```css
.matops-toggle-tab {
  position: fixed;
  right: 0;
  top: 50%;
  width: 40px;
  height: 80px;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  z-index: 999998;
  /* ... */
}

.matops-toggle-tab:hover {
  background: linear-gradient(180deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-50%) translateX(-2px);
}
```

## How It Works Now

1. **Sidebar starts open** (normal state)
2. **Click collapse button** → Sidebar slides to the right, toggle tab appears
3. **Click toggle tab** (🤼) → Sidebar expands back, tab disappears
4. **Repeat** as needed

The tab has a hover effect and is always clickable when visible.

---

## Files Modified

- `/Users/thefortob/Development/00-PRODUCTION/matops/extension-src/content-matops.js`
  * `parseWeightClass()` function
  * `extractWrestlers()` function
  * `toggleSidebar()` function
  * `createToggleTab()` function (new)

- `/Users/thefortob/Development/00-PRODUCTION/matops/extension-src/sidebar.css`
  * Removed `.matops-sidebar-collapsed::before` (non-functional)
  * Added `.matops-toggle-tab` styles (functional)

## Next Steps

1. Test the fixes
2. Report back if matches are now extracted
3. If still broken, run HTML inspector and send output
4. Once matches work, test detailed stats capture by clicking match scores

---

**Coach**: Reload the extension and refresh the page. Check the console for `[Mat Ops]` messages and let me know what you see!
