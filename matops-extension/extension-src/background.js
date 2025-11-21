/**
 * Mat Ops Background Service Worker
 * Coordinates stat extraction and syncing to Aether
 */

// Configuration
const CONFIG = {
  // Mat Ops Platform URL (aether-insight)
  matopsApiUrl: 'https://aether-insight.vercel.app/api/matops',
  localApiUrl: 'http://localhost:3000/api/matops',
  syncInterval: 60000, // 1 minute
  isDevelopment: true, // Set to false for production
  defaultTeamId: null, // Will be set by user or detected
  // Note: Anthropic API key should be set by user in extension settings
  // For development, set in Chrome DevTools Console: chrome.storage.local.set({anthropicApiKey: 'your-key'})
  anthropicApiKey: null // Set by user via settings
};

// In-memory storage for extracted data
const statsCache = {
  wrestlers: new Map(),
  matches: new Map(),
  events: new Map(),
  lastSync: null
};

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Mat Ops] Background received message:', message);

  switch (message.action) {
    case 'extract_wrestlers':
      handleWrestlerExtraction(message.data, sender.tab);
      sendResponse({ success: true });
      break;

    case 'extract_matches':
      handleMatchExtraction(message.data, sender.tab);
      sendResponse({ success: true });
      break;

    case 'sync_to_aether':
      syncToAether()
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response

    case 'get_stats_summary':
      sendResponse({
        success: true,
        data: {
          wrestlerCount: statsCache.wrestlers.size,
          matchCount: statsCache.matches.size,
          eventCount: statsCache.events.size,
          lastSync: statsCache.lastSync
        }
      });
      break;

    case 'clear_cache':
      clearStatsCache();
      sendResponse({ success: true });
      break;

    case 'ask_ai':
      askAI(message.question, message.statsContext)
        .then(result => sendResponse({ success: true, response: result.response, metadata: result.metadata }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response

    case 'call_page_function':
      // Execute function in page context (MAIN world) to bypass CSP
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        world: 'MAIN',
        func: (funcName, ...args) => {
          if (window[funcName] && typeof window[funcName] === 'function') {
            window[funcName](...args);
          }
        },
        args: [message.functionName, ...message.args]
      })
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

/**
 * Handle wrestler data extraction
 */
function handleWrestlerExtraction(wrestlers, tab) {
  console.log(`[Mat Ops] Extracted ${wrestlers.length} wrestlers from tab ${tab.id}`);

  wrestlers.forEach(wrestler => {
    statsCache.wrestlers.set(wrestler.id || wrestler.name, {
      ...wrestler,
      extractedAt: new Date().toISOString(),
      source: 'usabracketing',
      tabId: tab.id
    });
  });

  // Notify popup of new data
  chrome.runtime.sendMessage({
    action: 'stats_updated',
    data: { wrestlerCount: statsCache.wrestlers.size }
  });
}

/**
 * Handle match data extraction
 */
function handleMatchExtraction(matches, tab) {
  console.log(`[Mat Ops] Extracted ${matches.length} matches from tab ${tab.id}`);

  matches.forEach(match => {
    const matchId = `${match.wrestlerName}_${match.opponent}_${match.matchDate}`;
    statsCache.matches.set(matchId, {
      ...match,
      extractedAt: new Date().toISOString(),
      source: 'usabracketing',
      tabId: tab.id
    });
  });

  // Notify popup of new data
  chrome.runtime.sendMessage({
    action: 'stats_updated',
    data: { matchCount: statsCache.matches.size }
  });
}

/**
 * Sync all cached stats to Mat Ops Platform (aether-insight)
 */
async function syncToAether() {
  const apiUrl = CONFIG.isDevelopment ? CONFIG.localApiUrl : CONFIG.matopsApiUrl;

  console.log('[Mat Ops] Syncing to Mat Ops Platform:', apiUrl);

  // Get team ID from storage or use default
  const storage = await chrome.storage.local.get('teamId');
  const teamId = storage.teamId || CONFIG.defaultTeamId;

  if (!teamId) {
    throw new Error('Team ID not configured. Please set team ID in extension settings.');
  }

  const payload = {
    source: 'USABracketing',
    teamId: teamId,
    version: chrome.runtime.getManifest().version,
    wrestlers: Array.from(statsCache.wrestlers.values()),
    syncedAt: new Date().toISOString()
  };

  try {
    const response = await fetch(`${apiUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync failed: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    statsCache.lastSync = new Date().toISOString();

    console.log('[Mat Ops] Sync successful:', result);

    // Notify user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/matops-icon-128.png',
      title: 'Mat Ops - Sync Complete',
      message: `Synced ${result.wrestlers} wrestlers and ${result.matches} matches!`
    });

    return result;
  } catch (error) {
    console.error('[Mat Ops] Sync error:', error);

    // Notify user of error
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/matops-icon-128.png',
      title: 'Mat Ops - Sync Failed',
      message: error.message
    });

    throw error;
  }
}

/**
 * Ask AI about wrestling stats
 */
async function askAI(question, statsContext) {
  console.log('[Mat Ops] AI question:', question);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.openaiApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are a wrestling statistics analyst. Answer questions about the wrestling stats below concisely and accurately.

WRESTLING STATS DATA:
${JSON.stringify(statsContext, null, 2)}

USER QUESTION: ${question}

Provide a clear, direct answer with specific numbers and wrestler names when relevant.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    console.log('[Mat Ops] AI response:', aiResponse);
    console.log('[Mat Ops] Token usage:', data.usage);

    // Return response with metadata (token usage)
    return {
      response: aiResponse,
      metadata: {
        usage: data.usage  // Anthropic returns: { input_tokens, output_tokens }
      }
    };
  } catch (error) {
    console.error('[Mat Ops] AI error:', error);
    throw error;
  }
}

/**
 * Clear stats cache
 */
function clearStatsCache() {
  statsCache.wrestlers.clear();
  statsCache.matches.clear();
  statsCache.events.clear();
  statsCache.lastSync = null;
  console.log('[Mat Ops] Stats cache cleared');
}

/**
 * Auto-sync on interval (if enabled)
 */
function startAutoSync() {
  setInterval(async () => {
    if (statsCache.matches.size > 0 || statsCache.wrestlers.size > 0) {
      console.log('[Mat Ops] Auto-syncing stats...');
      try {
        await syncToAether();
      } catch (error) {
        console.error('[Mat Ops] Auto-sync failed:', error);
      }
    }
  }, CONFIG.syncInterval);
}

// Initialize
console.log('[Mat Ops] Background service worker initialized');
// startAutoSync(); // Uncomment to enable auto-sync
