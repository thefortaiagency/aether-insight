# Stats Table Feature 📊

**Commit**: 2999ade - Add HTML table display for stats queries

---

## What It Does

When you type keywords like **"stats"**, **"full stats"**, or **"show all wrestlers"** in the AI chat, it now displays a beautiful HTML table instead of sending the query to the AI.

---

## How To Use

### 1. Extract Stats First
```
Click "Extract Stats" button
```

### 2. Type Any of These Keywords
- `stats`
- `statistics`
- `show all`
- `full stats`
- `display stats`
- `wrestler stats`
- `all wrestlers`

### 3. Get Instant Table
No AI tokens used - instant display!

---

## Table Features

### Columns Displayed
1. **Wrestler** - Name (bold)
2. **Team** - Team name
3. **Weight** - Weight class(es)
4. **Record** - Win-Loss record (e.g., "5-2")
5. **W** - Total wins (green)
6. **L** - Total losses (red)
7. **Win%** - Win percentage

### Totals Row
- Shows aggregated stats for all wrestlers
- Total record
- Total wins/losses
- Overall win percentage

---

## Example Table

```
┌─────────────────────────────────────────────────────────────┐
│ WRESTLER      │ TEAM │ WEIGHT  │ RECORD │ W │ L │ WIN%   │
├─────────────────────────────────────────────────────────────┤
│ Hunter Douglas│ TFH  │ 141 lbs │ 4-2    │ 4 │ 2 │ 67%    │
│ Ryan Koch     │ WART │ 147 lbs │ 6-0    │ 6 │ 0 │ 100%   │
│ Drew Heisler  │ WART │ 116 lbs │ 3-2    │ 3 │ 2 │ 60%    │
├─────────────────────────────────────────────────────────────┤
│ TOTAL (21 wrestlers)         │ 32-32  │32 │32 │ 50%    │
└─────────────────────────────────────────────────────────────┘
```

---

## Visual Styling

✅ **Professional Design**
- Clean table borders
- Gray headers with uppercase labels
- Alternating row hover (implied)
- Color-coded wins (green) and losses (red)
- Responsive and scrollable

✅ **Readable**
- 12px font for data
- 11px font for headers
- Good spacing (8-10px padding)
- High contrast colors

---

## Benefits

### 1. **Fast**
- No AI processing time
- Instant table generation
- No token usage

### 2. **Comprehensive**
- See all wrestlers at once
- Compare records easily
- Quick overview of team performance

### 3. **Professional**
- Clean HTML table
- Proper formatting
- Easy to scan

### 4. **Smart**
- Calculates win percentages
- Aggregates totals
- Handles multiple weight classes per wrestler

---

## When To Use Table vs AI

### Use Table Display (Type "stats")
- Want to see all wrestler records
- Need quick overview
- Compare multiple wrestlers
- Check team totals

### Use AI Chat (Ask specific questions)
- "Which wrestler has the highest win percentage?"
- "Show me wrestlers with 5+ wins"
- "Who has the most takedowns?" (needs detailed stats)
- "Compare Hunter Douglas vs Ryan Koch"

---

## Testing

### Step 1: Reload Extension
```
chrome://extensions/ → Mat Ops → RELOAD
```

### Step 2: Extract Stats
```
Go to USABracketing
Click "Extract Stats"
```

### Step 3: Type "stats"
```
In AI chat input, type: stats
Press Ask button
```

### Expected Result
Beautiful HTML table with all wrestler records! ✅

---

## Pro Tips

💡 **Quick Access**: Just type "stats" anytime for instant overview

💡 **Still Have AI**: Ask specific questions for AI analysis

💡 **Combine Both**: Look at table, then ask AI detailed questions

💡 **Export Has Same Data**: Export JSON includes same stats

---

**Type "stats" to see your data in a beautiful table!** 📊
