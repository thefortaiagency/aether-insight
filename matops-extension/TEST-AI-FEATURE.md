# Test the AI Feature - Quick Guide 🚀

## Step 1: Reload Extension
1. Open Chrome
2. Go to `chrome://extensions/`
3. Find "Mat Ops - Wrestling Stats Tracker"
4. Click the **circular reload icon** 🔄
5. Look for "Service worker (Active)" to confirm it's running

## Step 2: Go to USABracketing
1. Navigate to: https://usabracketing.com
2. Log in if needed
3. Go to "My Wrestlers" page
4. Press F5 to refresh the page

## Step 3: Extract Stats
1. Wait 4-5 seconds for auto-expand to complete
2. You should see: "✅ Extracted X wrestlers, Y matches"
3. Check sidebar for wrestler cards with match counts

## Step 4: Capture Detailed Stats (Optional but Recommended)
1. Click any match score (e.g., "Dec 9-6", "Fall 3:45")
2. Modal opens with match details
3. Extension auto-captures (check console: `[Mat Ops] 📊 Captured match detail`)
4. Close modal
5. Repeat for 3-5 more matches
6. Sidebar shows: "📊 Captured detailed stats (X matches)"

## Step 5: Test AI Chat! 🤖
1. Scroll down in sidebar to "🤖 Ask AI About Stats"
2. Type a question in the input field
3. Click "Ask" button (or press Enter)
4. Watch for "🤔 Thinking..." indicator
5. AI response appears in white box below

## Example Questions to Try

### Basic Questions
- "Give me a summary of all wrestlers and their records"
- "How many total matches do we have?"
- "What's the overall win/loss percentage?"

### Wrestler-Specific
- "What's Braxtyn Bauer's record?"
- "Who has the most wins?"
- "Which wrestler has the best win percentage?"

### Detailed Stats (if you captured match details)
- "Who has the most takedowns?"
- "What's the average number of escapes per match?"
- "How many pins do we have total?"
- "Compare Braxtyn's takedown stats to Konnor's"

### Advanced Analysis
- "Which wrestlers need to work on their escapes?"
- "What's our team's strongest move type?"
- "Who gets pinned the most?"

## What to Look For

### ✅ Working Correctly
- AI responds within 2-5 seconds
- Answers include specific wrestler names
- Numbers match what you see in sidebar
- Multiple questions work in sequence
- Chat scrolls automatically
- User messages in blue (right), AI in white (left)

### ❌ Something's Wrong
- "🤔 Thinking..." never disappears → Check console for errors
- "❌ Error: ..." message → Check console for API error details
- No response after 10 seconds → Check internet connection
- Blank chat area → Check if stats were extracted first

## Console Debugging

Press F12 and look for:
- `[Mat Ops] Asking AI: [your question]`
- `[Mat Ops] AI question: [your question]` (from background.js)
- `[Mat Ops] AI response: [AI answer]` (from background.js)
- Any red error messages

## Common Issues & Fixes

### Issue: "No stats to analyze"
**Fix**: Make sure stats are extracted first (click "Expand All & Extract")

### Issue: API Error 401 (Unauthorized)
**Fix**: Check API key in background.js CONFIG.openaiApiKey

### Issue: API Error 429 (Rate Limit)
**Fix**: Wait a minute, Anthropic has generous limits but not unlimited

### Issue: Thinking indicator never disappears
**Fix**: Check console for network errors, ensure internet connection

### Issue: AI gives wrong numbers
**Fix**: AI only knows about stats you've extracted - capture more matches for better accuracy

## Expected Behavior

### First Question (no detailed stats)
**You**: "Give me a summary"
**AI**: "You have 21 wrestlers across various weight classes with a total of 87 matches. Overall record: 45 wins, 42 losses (51.7% win rate). Notable wrestlers include Braxtyn Bauer (4-1), Konnor Cleveland (2-1), ..."

### After Capturing Details
**You**: "Who has the most takedowns?"
**AI**: "Based on detailed stats captured from 10 matches: Braxtyn Bauer leads with 15 takedowns (average 3.0 per match), followed by Konnor Cleveland with 8 takedowns (average 2.67 per match)."

### Comparative Analysis
**You**: "Compare Braxtyn to Konnor"
**AI**: "Braxtyn Bauer: 4-1 record, 15 takedowns, 6 escapes, 3 nearfalls. Konnor Cleveland: 2-1 record, 8 takedowns, 4 escapes, 1 nearfall. Braxtyn has a higher win rate (80% vs 67%) and significantly more scoring moves per match."

## Files to Check If Issues

1. **background.js** line 12: API key present?
2. **content-matops.js** line 888-936: askAI() method exists?
3. **manifest.json** line 18: Anthropic API host permission added?

## Success Criteria ✅

- [ ] Extension reloads without errors
- [ ] Stats extract successfully (21 wrestlers, 87 matches)
- [ ] At least 3 match details captured
- [ ] AI chat UI visible in sidebar
- [ ] First question gets response within 5 seconds
- [ ] AI mentions specific wrestler names
- [ ] AI uses actual numbers from extracted data
- [ ] Multiple questions work in sequence
- [ ] Chat history preserved during session

---

**Ready, Coach!** If all these work, you've got a **fully functional AI-powered wrestling stats analyzer** right in your browser! 🤼‍♂️🤖

No exports needed. No separate tools. Just **ask and get answers instantly**.

**This is revolutionary for coaching!** 🔥
