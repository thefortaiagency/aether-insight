# Mat Ops - Auto-Expand Feature Added

## Problem
Coach reported that matches don't show up unless:
1. User clicks on wrestler to expand weight class section
2. Then clicks "Refresh Stats" button

This is because USABracketing collapses weight class sections by default, and matches aren't in the DOM until they're expanded.

## Solution

Added **"Expand All & Extract"** button that automatically:
1. Finds all weight class headers (`span[wire:click*="toggleMatches"]`)
2. Clicks each one to expand and load matches via Livewire
3. Waits 2 seconds for Livewire to finish loading
4. Automatically extracts all match data

## New Workflow

### Automatic (Recommended)
1. Page loads → Sidebar appears
2. **Click "Expand All & Extract"** (big green button)
3. Extension expands all weight classes automatically
4. Status shows: "Expanding X weight classes..."
5. After 2 seconds: "Loading matches..."
6. After 2 more seconds: "✅ Extracted 21 wrestlers, 87 matches"

### Manual (If needed)
1. Manually expand weight classes you want
2. Click "Refresh Stats" to extract visible matches
3. Repeat as needed

## Code Changes

### 1. Added `expandAllWeightClasses()` Method
```javascript
expandAllWeightClasses() {
  // Find all weight class headers
  const weightHeaders = document.querySelectorAll('span[wire\\:click*="toggleMatches"]');

  // Click each one to expand
  weightHeaders.forEach(header => {
    header.click();
  });

  // Wait for Livewire to load, then extract
  setTimeout(() => {
    setTimeout(() => {
      this.extractStats();
    }, 1000);
  }, 1000);
}
```

### 2. Added "Expand All & Extract" Button
- **Location**: Top of Actions section (green/primary button)
- **Icon**: Expand/collapse arrows icon
- **Function**: Calls `expandAllWeightClasses()`

### 3. Smarter Status Messages
- If 0 matches found: "No matches found. Click 'Expand All' to load matches."
- If matches found: "✅ Extracted X wrestlers, Y matches"

## Technical Details

### How Livewire Expansion Works
USABracketing uses Livewire framework which:
1. Keeps match lists hidden/collapsed by default
2. Loads match HTML dynamically when you click weight class header
3. Uses `wire:click="toggleMatches"` attribute on headers

Extension detects this and simulates clicks.

### Timing
- **1 second** delay after clicking headers (for Livewire AJAX)
- **1 second** delay before extraction (for DOM updates)
- **Total: 2 seconds** from click to extraction

If Livewire is slow, increase these timings.

## User Experience

### What User Sees
1. Clicks "Expand All & Extract"
2. Watches weight class sections expand one by one on page
3. Sidebar shows progress: "Expanding 21 weight classes..."
4. After 2 seconds: "✅ Extracted 21 wrestlers, 87 matches"
5. All wrestler cards now show match counts

### What User Doesn't See
- Extension automatically finding and clicking headers
- Livewire loading matches in background
- Parser extracting from newly loaded DOM

## Benefits

✅ **Mostly Automated** - One click instead of 21+ manual expansions
✅ **Clear Progress** - Status messages show what's happening
✅ **Flexible** - Still allows manual expand + refresh if needed
✅ **Non-Destructive** - Doesn't break page functionality

## Testing

1. Reload extension
2. Go to My Wrestlers page (weight classes collapsed)
3. Click "Expand All & Extract" button
4. Watch weight classes expand on page
5. After 2-3 seconds, check sidebar for match counts

## Future Enhancements

Could add:
- Progress bar showing expansion progress
- Cancel button to stop mid-expansion
- Auto-detect when weight classes are already expanded (skip clicks)
- Adaptive timing based on network speed

---

**Status**: ✅ Implemented and ready to test
**Files Modified**: `content-matops.js` (added expandAllWeightClasses method + button)
