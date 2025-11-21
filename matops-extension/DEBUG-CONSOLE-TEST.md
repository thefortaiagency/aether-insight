# Debug Console Test

## Step 1: Test if content script is loaded

Open Console (F12) and paste this:

```javascript
console.log('Testing Mat Ops...');
console.log('detailedMatches exists?', typeof detailedMatches);
console.log('extractWrestlers exists?', typeof extractWrestlers);
```

**Expected**:
```
Testing Mat Ops...
detailedMatches exists? object
extractWrestlers exists? function
```

**If you see "undefined"**: Content script not loaded - reload extension + refresh page

---

## Step 2: Test wrestler extraction manually

Paste this in Console:

```javascript
// Test if we can find wrestlers
const wrestlerDivs = document.querySelectorAll('div[wire\\:id].mb-2, div[wire\\:id][class*="mb-2"]');
console.log('Found wrestler divs:', wrestlerDivs.length);

// Show what we found
wrestlerDivs.forEach((div, i) => {
  console.log(`Wrestler ${i+1}:`, div.querySelector('.font-semibold')?.textContent);
});
```

**Expected**:
```
Found wrestler divs: 10
Wrestler 1: John Doe (Eagles)
Wrestler 2: Jane Smith (Tigers)
...
```

**If 0**: Wrong selector - page structure changed OR wrong page

---

## Step 3: Test extraction function manually

Paste this:

```javascript
// Call extraction function directly
const wrestlers = extractWrestlers();
console.log('Extracted:', wrestlers.length, 'wrestlers');
console.log('Data:', wrestlers);
```

**Expected**:
```
[Mat Ops] Found 10 wrestler containers
[Mat Ops] Found 2 weight classes for John Doe
...
Extracted: 10 wrestlers
Data: [{name: "John Doe", team: "Eagles", weightClasses: [...]}, ...]
```

**If error**: Show me the error message!

---

## Step 4: Test if side panel can receive data

In the side panel, open the DevTools for the side panel:
1. Right-click inside the side panel
2. Click "Inspect"
3. This opens DevTools for the side panel (separate from page)
4. Go to Console tab
5. Click "Extract Stats" button
6. Look for errors

---

## Quick Fix: Reload Everything

```bash
1. chrome://extensions/ → Mat Ops → REMOVE
2. chrome://extensions/ → Load unpacked
3. Select: /Users/thefortob/Development/00-PRODUCTION/matops/extension-src/
4. Go to USABracketing → My Wrestlers
5. Refresh page (Cmd+R)
6. Open side panel
7. Click Extract Stats
```

---

## What URL are you on?

Make sure you're on:
```
https://usabracketing.com/...
```

NOT:
```
https://www.usabracketing.com/...  (with www)
```

If www, the content script might not match!

---

## Send me:

1. What URL you're on
2. Output from Step 1 (is content script loaded?)
3. Output from Step 2 (how many wrestler divs found?)
4. Any errors in console
