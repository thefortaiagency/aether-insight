/**
 * Mat Ops Content Scraper
 * Extracts wrestling stats from USABracketing pages
 */

// Configuration
const MATOPS_CONFIG = {
  enabled: true,
  autoExtract: true,
  debug: true
};

// State
let extractedData = {
  wrestlers: [],
  matches: [],
  eventInfo: null
};

/**
 * Initialize Mat Ops on page load
 */
function initMatOps() {
  console.log('[Mat Ops] Content scraper initialized on:', window.location.href);

  // Detect page type
  const pageType = detectPageType();
  console.log('[Mat Ops] Page type detected:', pageType);

  // Add Mat Ops UI
  addMatOpsUI();

  // Auto-extract if enabled and on supported page
  if (MATOPS_CONFIG.autoExtract && pageType !== 'unknown') {
    setTimeout(() => {
      extractDataFromPage(pageType);
    }, 1000); // Give Livewire time to render
  }

  // Watch for dynamic content changes (Livewire)
  observePageChanges();
}

/**
 * Detect what type of USABracketing page we're on
 */
function detectPageType() {
  const path = window.location.pathname;

  if (path.includes('/my_wrestlers')) return 'my_wrestlers';
  if (path.includes('/stats')) return 'statistics';
  if (path.includes('/brackets')) return 'brackets';
  if (path.includes('/wrestlers')) return 'wrestlers';
  if (path.includes('/teams')) return 'teams';
  if (path.includes('/events')) return 'event_detail';

  return 'unknown';
}

/**
 * Extract data based on page type
 */
function extractDataFromPage(pageType) {
  console.log('[Mat Ops] Extracting data from:', pageType);

  switch (pageType) {
    case 'my_wrestlers':
      extractMyWrestlers();
      break;
    case 'statistics':
      extractStatistics();
      break;
    case 'brackets':
      extractBrackets();
      break;
    default:
      console.log('[Mat Ops] No extraction logic for page type:', pageType);
  }
}

/**
 * Extract wrestlers from "My Wrestlers" page
 * COACH: This needs the actual HTML structure to be accurate
 */
function extractMyWrestlers() {
  console.log('[Mat Ops] Extracting wrestlers from My Wrestlers page');

  // TODO: Update selectors based on actual HTML
  const wrestlerRows = document.querySelectorAll('[data-wrestler-id], .wrestler-row, tr[wire\\:key*="wrestler"]');

  const wrestlers = [];

  wrestlerRows.forEach(row => {
    try {
      const wrestler = {
        id: row.getAttribute('data-wrestler-id') || row.getAttribute('wire:key'),
        name: extractText(row, '.wrestler-name, [data-field="name"]'),
        weightClass: extractText(row, '.weight-class, [data-field="weight"]'),
        team: extractText(row, '.team-name, [data-field="team"]'),
        division: extractText(row, '.division, [data-field="division"]'),
        record: extractText(row, '.record, [data-field="record"]'),
        extractedAt: new Date().toISOString()
      };

      // Extract match details if expanded
      const matchRows = row.querySelectorAll('.match-row, [data-match-id]');
      if (matchRows.length > 0) {
        wrestler.matches = extractMatchesFromRows(matchRows, wrestler.name);
      }

      wrestlers.push(wrestler);
    } catch (error) {
      console.error('[Mat Ops] Error extracting wrestler:', error);
    }
  });

  console.log(`[Mat Ops] Extracted ${wrestlers.length} wrestlers`);
  extractedData.wrestlers = wrestlers;

  // Send to background script
  chrome.runtime.sendMessage({
    action: 'extract_wrestlers',
    data: wrestlers
  });

  // Extract matches
  const allMatches = wrestlers.flatMap(w => w.matches || []);
  if (allMatches.length > 0) {
    chrome.runtime.sendMessage({
      action: 'extract_matches',
      data: allMatches
    });
  }

  updateMatOpsUI();
}

/**
 * Extract individual matches from match rows
 */
function extractMatchesFromRows(matchRows, wrestlerName) {
  const matches = [];

  matchRows.forEach(matchRow => {
    try {
      const match = {
        wrestlerName,
        matchDate: extractText(matchRow, '.match-date, [data-field="date"]'),
        weightClass: extractNumber(matchRow, '.weight-class, [data-field="weight"]'),
        opponent: extractText(matchRow, '.opponent, [data-field="opponent"]'),

        // Wrestler stats
        takedowns: extractNumber(matchRow, '[data-stat="takedowns"], .takedowns'),
        escapes: extractNumber(matchRow, '[data-stat="escapes"], .escapes'),
        reversals: extractNumber(matchRow, '[data-stat="reversals"], .reversals'),
        nearfall2: extractNumber(matchRow, '[data-stat="nearfall2"], .nearfall-2'),
        nearfall3: extractNumber(matchRow, '[data-stat="nearfall3"], .nearfall-3'),
        nearfall4: extractNumber(matchRow, '[data-stat="nearfall4"], .nearfall-4'),
        penalty1: extractNumber(matchRow, '[data-stat="penalty1"], .penalty-1'),
        penalty2: extractNumber(matchRow, '[data-stat="penalty2"], .penalty-2'),

        // Opponent stats
        takedownsOpp: extractNumber(matchRow, '[data-stat="takedowns-opp"], .takedowns-opp'),
        escapesOpp: extractNumber(matchRow, '[data-stat="escapes-opp"], .escapes-opp'),
        reversalsOpp: extractNumber(matchRow, '[data-stat="reversals-opp"], .reversals-opp'),
        nearfall2Opp: extractNumber(matchRow, '[data-stat="nearfall2-opp"], .nearfall-2-opp'),
        nearfall3Opp: extractNumber(matchRow, '[data-stat="nearfall3-opp"], .nearfall-3-opp'),
        nearfall4Opp: extractNumber(matchRow, '[data-stat="nearfall4-opp"], .nearfall-4-opp'),
        penalty1Opp: extractNumber(matchRow, '[data-stat="penalty1-opp"], .penalty-1-opp'),
        penalty2Opp: extractNumber(matchRow, '[data-stat="penalty2-opp"], .penalty-2-opp'),

        // Win conditions
        pin: hasClass(matchRow, 'pin, .win-pin') || extractText(matchRow, '.result').includes('Pin'),
        pinOpp: hasClass(matchRow, 'loss-pin, .pinned') || extractText(matchRow, '.result').includes('Lost by Pin'),
        forfeit: extractText(matchRow, '.result').includes('Forfeit'),

        // Scores
        wrestlerScore: extractNumber(matchRow, '.wrestler-score, [data-field="score"]'),
        opponentScore: extractNumber(matchRow, '.opponent-score, [data-field="opponent-score"]'),
        result: extractText(matchRow, '.result, [data-field="result"]'),

        notes: extractText(matchRow, '.notes, [data-field="notes"]')
      };

      matches.push(match);
    } catch (error) {
      console.error('[Mat Ops] Error extracting match:', error);
    }
  });

  return matches;
}

/**
 * Extract statistics page
 */
function extractStatistics() {
  console.log('[Mat Ops] Extracting statistics');
  // TODO: Implement when we see the statistics page structure
}

/**
 * Extract bracket information
 */
function extractBrackets() {
  console.log('[Mat Ops] Extracting brackets');
  // TODO: Implement when we see the brackets page structure
}

/**
 * Helper: Extract text from element
 */
function extractText(parent, selector) {
  try {
    const element = parent.querySelector(selector);
    return element ? element.textContent.trim() : '';
  } catch (error) {
    return '';
  }
}

/**
 * Helper: Extract number from element
 */
function extractNumber(parent, selector) {
  const text = extractText(parent, selector);
  const number = parseInt(text.replace(/[^0-9]/g, ''));
  return isNaN(number) ? 0 : number;
}

/**
 * Helper: Check if element has class
 */
function hasClass(element, classNames) {
  const classes = classNames.split(',').map(c => c.trim());
  return classes.some(className => element.classList.contains(className));
}

/**
 * Add Mat Ops floating UI
 */
function addMatOpsUI() {
  if (document.getElementById('matops-panel')) return; // Already added

  const panel = document.createElement('div');
  panel.id = 'matops-panel';
  panel.innerHTML = `
    <div class="matops-header">
      <img src="${chrome.runtime.getURL('icons/matops-48.png')}" alt="Mat Ops" width="24" height="24">
      <span>Mat Ops</span>
      <button id="matops-close">×</button>
    </div>
    <div class="matops-body">
      <div class="matops-stat">
        <span>Wrestlers:</span>
        <span id="matops-wrestler-count">0</span>
      </div>
      <div class="matops-stat">
        <span>Matches:</span>
        <span id="matops-match-count">0</span>
      </div>
      <div class="matops-stat">
        <span>Last Sync:</span>
        <span id="matops-last-sync">Never</span>
      </div>
      <button id="matops-extract" class="matops-btn">Extract Stats</button>
      <button id="matops-sync" class="matops-btn matops-btn-primary">Sync to Aether</button>
    </div>
  `;

  document.body.appendChild(panel);

  // Add event listeners
  document.getElementById('matops-close').addEventListener('click', () => {
    panel.style.display = 'none';
  });

  document.getElementById('matops-extract').addEventListener('click', () => {
    const pageType = detectPageType();
    extractDataFromPage(pageType);
  });

  document.getElementById('matops-sync').addEventListener('click', async () => {
    const syncBtn = document.getElementById('matops-sync');
    syncBtn.textContent = 'Syncing...';
    syncBtn.disabled = true;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'sync_to_aether'
      });

      if (response.success) {
        alert('Stats synced successfully to Aether!');
        updateMatOpsUI();
      } else {
        alert('Sync failed: ' + response.error);
      }
    } catch (error) {
      alert('Sync error: ' + error.message);
    } finally {
      syncBtn.textContent = 'Sync to Aether';
      syncBtn.disabled = false;
    }
  });
}

/**
 * Update Mat Ops UI with current stats
 */
function updateMatOpsUI() {
  const wrestlerCount = extractedData.wrestlers.length;
  const matchCount = extractedData.wrestlers.reduce((sum, w) => sum + (w.matches?.length || 0), 0);

  document.getElementById('matops-wrestler-count').textContent = wrestlerCount;
  document.getElementById('matops-match-count').textContent = matchCount;

  // Get last sync from background
  chrome.runtime.sendMessage({ action: 'get_stats_summary' }, (response) => {
    if (response.success && response.data.lastSync) {
      const lastSync = new Date(response.data.lastSync);
      document.getElementById('matops-last-sync').textContent = lastSync.toLocaleTimeString();
    }
  });
}

/**
 * Watch for page changes (Livewire dynamic content)
 */
function observePageChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if new wrestler/match data loaded
    const hasNewData = mutations.some(mutation =>
      mutation.addedNodes.length > 0 &&
      Array.from(mutation.addedNodes).some(node =>
        node.nodeType === 1 &&
        (node.matches && node.matches('[data-wrestler-id], .wrestler-row, .match-row'))
      )
    );

    if (hasNewData && MATOPS_CONFIG.autoExtract) {
      console.log('[Mat Ops] New data detected, re-extracting...');
      const pageType = detectPageType();
      extractDataFromPage(pageType);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMatOps);
} else {
  initMatOps();
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'stats_updated') {
    updateMatOpsUI();
  }
});

console.log('[Mat Ops] Content scraper loaded');
