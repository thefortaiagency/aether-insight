/**
 * HTML Inspector - Deep dive into USABracketing structure
 * Run this in browser console to capture exact HTML structure
 */

console.log('=== MAT OPS HTML INSPECTOR ===\n');

// ========== STEP 1: FIND ALL WRESTLER CONTAINERS ==========
console.log('STEP 1: Finding wrestler containers...');
const wrestlerDivs = document.querySelectorAll('div[wire\\:id]');
console.log(`Found ${wrestlerDivs.length} divs with wire:id`);

// Try to narrow down to actual wrestler containers
const wrestlerContainers = Array.from(wrestlerDivs).filter(div => {
  const text = div.textContent;
  return text.includes('High School') || text.includes('Middle School') ||
         text.includes('Elementary') || text.includes('lbs');
});
console.log(`Filtered to ${wrestlerContainers.length} potential wrestler containers`);

if (wrestlerContainers.length > 0) {
  console.log('\nFirst wrestler container classes:', wrestlerContainers[0].className);
  console.log('First wrestler container structure:');
  console.log(wrestlerContainers[0].innerHTML.substring(0, 500) + '...');
}

// ========== STEP 2: FIND WRESTLER HEADERS ==========
console.log('\n\nSTEP 2: Finding wrestler name headers...');

// Try multiple selector patterns
const selectors = [
  '.p-2.bg-gray-200.border-b.border-usa-blue a',
  '.bg-gray-200 a[href*="/athletes/"]',
  'a[href*="/athletes/"]',
  '.p-2 a'
];

selectors.forEach(selector => {
  const found = document.querySelectorAll(selector);
  console.log(`Selector: "${selector}" → Found ${found.length}`);
  if (found.length > 0) {
    console.log(`  First match: "${found[0].textContent.trim()}"`);
  }
});

// ========== STEP 3: FIND WEIGHT CLASS SECTIONS ==========
console.log('\n\nSTEP 3: Finding weight class sections...');

const weightSelectors = [
  '.bg-gray-50.p-4.rounded-lg.shadow-sm.border',
  '.bg-gray-50',
  '.rounded-lg.shadow-sm',
  'div[class*="bg-gray"]'
];

weightSelectors.forEach(selector => {
  const found = document.querySelectorAll(selector);
  console.log(`Selector: "${selector}" → Found ${found.length}`);
});

// ========== STEP 4: FIND ALL <UL> and <LI> ELEMENTS ==========
console.log('\n\nSTEP 4: Finding list elements...');

const allUls = document.querySelectorAll('ul');
const allLis = document.querySelectorAll('li');

console.log(`Total <ul> elements: ${allUls.length}`);
console.log(`Total <li> elements: ${allLis.length}`);

// Check what's in the <li> elements
const liTexts = Array.from(allLis).map(li => li.textContent.trim()).slice(0, 10);
console.log('\nFirst 10 <li> elements:');
liTexts.forEach((text, i) => {
  console.log(`  ${i + 1}. ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
});

// ========== STEP 5: SEARCH FOR MATCH INDICATORS ==========
console.log('\n\nSTEP 5: Searching for match indicators...');

// Search for common match-related text
const searchTerms = ['Mat', 'Bout', 'over', 'lost to', 'Dec', 'TF', 'Fall'];
const bodyText = document.body.innerHTML;

searchTerms.forEach(term => {
  const regex = new RegExp(term, 'gi');
  const matches = bodyText.match(regex);
  console.log(`"${term}" appears ${matches ? matches.length : 0} times in page`);
});

// ========== STEP 6: FIND SCORE LINKS ==========
console.log('\n\nSTEP 6: Finding score links...');

const scoreLinks = document.querySelectorAll('a[href*="fetchScoreSummary"]');
console.log(`Found ${scoreLinks.length} fetchScoreSummary links`);

if (scoreLinks.length > 0) {
  console.log('First score link:', scoreLinks[0].outerHTML);
  console.log('Parent element:', scoreLinks[0].parentElement.outerHTML);
}

// ========== STEP 7: DEEP DIVE ON FIRST WRESTLER ==========
console.log('\n\nSTEP 7: Deep dive on first wrestler...');

if (wrestlerContainers.length > 0) {
  const firstWrestler = wrestlerContainers[0];

  console.log('Full HTML of first wrestler:');
  console.log('=====================================');
  console.log(firstWrestler.outerHTML);
  console.log('=====================================');

  // Find all nested divs
  const nestedDivs = firstWrestler.querySelectorAll('div');
  console.log(`\nFirst wrestler has ${nestedDivs.length} nested divs`);

  // Find all nested links
  const nestedLinks = firstWrestler.querySelectorAll('a');
  console.log(`First wrestler has ${nestedLinks.length} links:`);
  nestedLinks.forEach((link, i) => {
    console.log(`  Link ${i + 1}: ${link.textContent.trim()} → ${link.href}`);
  });

  // Find all nested lists
  const nestedUls = firstWrestler.querySelectorAll('ul');
  const nestedLis = firstWrestler.querySelectorAll('li');
  console.log(`First wrestler has ${nestedUls.length} <ul> and ${nestedLis.length} <li> elements`);

  if (nestedLis.length > 0) {
    console.log('\nFirst 5 <li> elements in first wrestler:');
    Array.from(nestedLis).slice(0, 5).forEach((li, i) => {
      console.log(`  ${i + 1}. ${li.textContent.trim()}`);
    });
  }
}

// ========== STEP 8: FIND EXPANDED VS COLLAPSED ==========
console.log('\n\nSTEP 8: Checking for expand/collapse mechanism...');

// Look for common collapse indicators
const collapseIndicators = [
  'button[aria-expanded]',
  '[class*="collapse"]',
  '[class*="hidden"]',
  '[x-show]',
  '[wire\\:click]'
];

collapseIndicators.forEach(selector => {
  const found = document.querySelectorAll(selector);
  if (found.length > 0) {
    console.log(`Found ${found.length} elements with selector: ${selector}`);
  }
});

// ========== EXPORT RESULTS ==========
console.log('\n\n=== EXPORT DATA FOR ANALYSIS ===');
console.log('Copy the wrestler container HTML above and send it back for analysis.');
console.log('Look for patterns in how matches are structured.');
