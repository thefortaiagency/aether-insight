# Mat Ops Debug Guide

## Issue: 0 Matches Extracted

You're seeing 21 wrestlers but 0 matches for all of them. This means the match parser isn't finding matches in the HTML.

## Debug Steps

### 1. Check Browser Console
Open the browser console (F12 → Console tab) and look for:

```
[Mat Ops] messages
```

You should see:
- `[Mat Ops] Sidebar loaded ✅`
- `[Mat Ops] Extracted data: [...]` - Check if matches array is empty

### 2. Check if Wrestlers are Expanded
The matches won't show up unless the weight class sections are expanded!

**Critical**: You need to **click on at least one weight class** to expand it and show matches.

For example, click on:
- "High School - 129 - (DNP)" for Braxtyn Bauer
- This expands the section and shows matches

### 3. Manual Console Test

Copy/paste this into the browser console while on the "My Wrestlers" page:

```javascript
// Test 1: Find wrestler containers
const wrestlerDivs = document.querySelectorAll('div[wire\\:id][class*="mb-2"]');
console.log('Found wrestler divs:', wrestlerDivs.length);

// Test 2: Find weight class sections
const weightDivs = document.querySelectorAll('.bg-gray-50.p-4.rounded-lg.shadow-sm.border');
console.log('Found weight class sections:', weightDivs.length);

// Test 3: Find match items
const matchItems = document.querySelectorAll('ul li');
console.log('Found <li> elements:', matchItems.length);

// Test 4: Check for match text
matchItems.forEach((li, i) => {
  const text = li.textContent.trim();
  if (text.includes('Mat') && text.includes('Bout')) {
    console.log(`Match ${i}:`, text);
  }
});
```

This will show you:
1. How many wrestler containers found
2. How many weight class sections found
3. How many `<li>` elements exist
4. Which ones contain match data

### 4. Check HTML Structure

Right-click on a wrestler card → Inspect Element, then look for:

```html
<div wire:id="..." class="mb-2">
  <div class="p-2 bg-gray-200...">
    <a href="/athletes/...">Braxtyn Bauer</a> (Warrior RTC, IN)
  </div>

  <div class="bg-gray-50 p-4 rounded-lg shadow-sm border">
    <div class="text-usa-blue underline cursor-pointer">
      High School - 129 - (DNP)
    </div>

    <!-- MATCHES SHOULD BE HERE IN <ul><li> -->
    <ul>
      <li>Mat 2 - Bout 3011 - Champ. Rd of 128: ...</li>
      <li>Mat 2 - Bout 3012 - Cons. Rd of 64: ...</li>
    </ul>
  </div>
</div>
```

### 5. Check if Matches are Collapsed

USABracketing might hide matches by default! Look for:
- A "Show Matches" button
- A collapsed/expanded state
- Matches only load when you click the weight class header

## Common Issues

### Issue 1: Matches Not Visible
**Symptom**: 0 matches extracted, but wrestlers show up
**Cause**: Weight class sections are collapsed
**Fix**: Click on weight class headers to expand them

### Issue 2: Wrong Selectors
**Symptom**: Console shows 0 `<li>` elements found
**Cause**: USABracketing changed their HTML structure
**Fix**: Need to update selectors in content-matops.js

### Issue 3: Livewire Lazy Loading
**Symptom**: Matches appear after a delay
**Cause**: Livewire loads matches dynamically
**Fix**: Wait a few seconds after expanding, or click "Refresh Stats"

## What to Report Back

After running the console tests, tell me:

1. **How many `<li>` elements found?**
   - If 0: Matches aren't in the DOM yet
   - If >0: Selectors are wrong

2. **Are weight classes expanded or collapsed?**
   - Collapsed: Need to expand them first
   - Expanded: Selectors need fixing

3. **Console errors?**
   - Any red errors in console?
   - Any `[Mat Ops]` error messages?

4. **Screenshot of expanded wrestler**
   - Expand one wrestler fully
   - Screenshot the HTML structure in DevTools
   - This shows exact HTML we're parsing

## Quick Fix to Try

If matches are there but not parsing, try clicking **"Refresh Stats"** button in the sidebar after expanding a wrestler. This re-runs the extraction.

---

**Next Steps**: Run the console test above and report back what you see!
