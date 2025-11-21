# Mat Ops Scraper Test Instructions

## Quick Test (No Extension Install)

### Method 1: Browser Console (Easiest)

1. **Go to USABracketing**:
   - Navigate to: https://www.usabracketing.com
   - Log in with your credentials
   - Go to an event → **General** → **My Wrestlers**

2. **Open Browser Console**:
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Click the **Console** tab

3. **Copy & Paste Test Script**:
   - Open: `/Users/thefortob/Development/00-PRODUCTION/matops/extension-src/test-scraper.js`
   - Copy the ENTIRE file contents
   - Paste into browser console
   - Press `Enter`

4. **See Results**:
   - Console will display:
     - ✅ Each wrestler found
     - ✅ Weight classes
     - ✅ Match details (opponent, score, result)
     - ✅ Summary stats (total wins/losses)

5. **Inspect Data**:
   ```javascript
   // In console, type:
   window.matOpsTestData

   // Or export to JSON file:
   copy(JSON.stringify(window.matOpsTestData, null, 2))
   // Then paste into a text file
   ```

### Method 2: Bookmarklet (Reusable)

1. **Create Bookmarklet**:
   - Right-click bookmark bar → Add Page
   - Name: `Mat Ops Test`
   - URL: Paste this (entire line):
   ```javascript
   javascript:(function(){var s=document.createElement('script');s.src='file:///Users/thefortob/Development/00-PRODUCTION/matops/extension-src/test-scraper.js';document.body.appendChild(s);})()
   ```

2. **Use It**:
   - Go to My Wrestlers page
   - Click the bookmarklet
   - Check console for results

## What The Test Shows

### Console Output Example:
```
🤼 Mat Ops Test Scraper
Extracting data from USABracketing...

================================================================================
✅ Found 15 wrestlers
================================================================================

────────────────────────────────────────────────────────────────────────────────
📍 WRESTLER #1: Braxtyn Bauer
   Team: Warrior RTC, IN
   Athlete ID: 13494ffc-53f0-4fee-8a97-1c89f992fc9d
────────────────────────────────────────────────────────────────────────────────

  ⚖️  Weight Class 1: High School - 129 lbs
      Placement: DNP
      Matches: 5

      Match Details:
      1. ❌ Loss - Decision
         Opponent: Gavin Reed (MHS)
         Score: 0-2
         Round: Champ. Rd of 128
         Mat 2 - Bout 3011
         📹 Video: https://youtu.be/_ehhDG_eWtE

      2. ✅ Win - Forfeit
         Opponent: Bye ()
         Score: 0-0
         Round: Cons. Sub-Rd of 64
         Mat  - Bout

      3. ✅ Win - Decision
         Opponent: Ty Whitten (MCWC)
         Score: 9-6
         Round: Cons. Rd of 64
         Mat 9 - Bout 3115
         📹 Video: https://classofx.com/networks/content/...

      ... (more matches)

================================================================================
📊 SUMMARY
================================================================================
Total Wrestlers: 15
Total Matches: 47
Total Wins: 32
Total Losses: 15
```

## What We're Testing

✅ **Can we find all wrestlers?**
- Wrestler name
- Team name
- State
- Athlete ID (UUID from USABracketing)

✅ **Can we find weight classes?**
- Division (High School, Middle School, etc.)
- Weight (106, 113, 120, 129, etc.)
- Placement (1st, 2nd, DNP, etc.)

✅ **Can we extract match details?**
- Opponent name and team
- Win/Loss result
- Win type (Decision, Pin, Tech Fall, etc.)
- Score (wrestler score vs opponent score)
- Round (Champ Rd of 128, Cons Rd of 64, etc.)
- Mat assignment and bout number
- Video links (YouTube, ClassOfX)

✅ **Can we count stats?**
- Total matches per wrestler
- Wins vs losses
- Match outcomes by type

## Troubleshooting

### "No wrestlers found"
- Make sure you're on the **My Wrestlers** page
- Make sure wrestlers are visible (not collapsed)
- Try expanding at least one wrestler's weight class

### "Cannot read property..."
- USABracketing may have changed their HTML structure
- Open DevTools → Elements tab
- Right-click a wrestler name → Inspect
- Share the HTML snippet with me to update selectors

### "Script error"
- Make sure you copied the ENTIRE test-scraper.js file
- Check for any copy/paste issues

## Next Steps

Once you confirm the scraper works:
1. ✅ We know we can extract the data
2. ⏭️ Install the Chrome extension
3. ⏭️ Add the "Extract Stats" button
4. ⏭️ Later: Add database sync

## Export Test Data

To save extracted data to a file:

```javascript
// In console after running test:
const json = JSON.stringify(window.matOpsTestData, null, 2);
const blob = new Blob([json], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'matops-test-data.json';
a.click();
```

This will download `matops-test-data.json` with all extracted data.

---

**Let's test the scraper before building anything else!** 🤼
