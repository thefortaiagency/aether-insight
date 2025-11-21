/**
 * Mat Ops Popup Controller
 */

// DOM Elements
const wrestlerCountEl = document.getElementById('wrestler-count');
const matchCountEl = document.getElementById('match-count');
const eventCountEl = document.getElementById('event-count');
const lastSyncEl = document.getElementById('last-sync');
const statusEl = document.getElementById('status-message');

const extractBtn = document.getElementById('extract-btn');
const syncBtn = document.getElementById('sync-btn');
const viewBtn = document.getElementById('view-btn');
const clearBtn = document.getElementById('clear-btn');

/**
 * Initialize popup
 */
async function initPopup() {
  await updateStats();

  // Event listeners
  extractBtn.addEventListener('click', handleExtract);
  syncBtn.addEventListener('click', handleSync);
  viewBtn.addEventListener('click', handleView);
  clearBtn.addEventListener('click', handleClear);
}

/**
 * Update stats display
 */
async function updateStats() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'get_stats_summary'
    });

    if (response.success) {
      wrestlerCountEl.textContent = response.data.wrestlerCount || 0;
      matchCountEl.textContent = response.data.matchCount || 0;
      eventCountEl.textContent = response.data.eventCount || 0;

      if (response.data.lastSync) {
        const lastSync = new Date(response.data.lastSync);
        lastSyncEl.textContent = formatTime(lastSync);
      } else {
        lastSyncEl.textContent = 'Never';
      }
    }
  } catch (error) {
    showStatus('Error loading stats', 'error');
  }
}

/**
 * Handle extract button click
 */
async function handleExtract() {
  extractBtn.disabled = true;
  extractBtn.textContent = '📊 Extracting...';

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: 'extract_stats'
    });

    showStatus('Stats extracted successfully!', 'success');
    setTimeout(updateStats, 500);
  } catch (error) {
    showStatus('Error: Make sure you\'re on USABracketing', 'error');
  } finally {
    extractBtn.disabled = false;
    extractBtn.textContent = '📊 Extract Stats from Page';
  }
}

/**
 * Handle sync button click
 */
async function handleSync() {
  syncBtn.disabled = true;
  syncBtn.textContent = '🔄 Syncing...';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'sync_to_aether'
    });

    if (response.success) {
      showStatus('Synced to Aether successfully!', 'success');
      await updateStats();
    } else {
      showStatus('Sync failed: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('Sync error: ' + error.message, 'error');
  } finally {
    syncBtn.disabled = false;
    syncBtn.textContent = '🔄 Sync to Aether';
  }
}

/**
 * Handle view button click
 */
function handleView() {
  // Open Aether stats page in new tab
  chrome.tabs.create({
    url: 'https://aethervtc.ai/matops/stats'
    // url: 'http://localhost:3000/matops/stats' // Development
  });
}

/**
 * Handle clear button click
 */
async function handleClear() {
  if (!confirm('Clear all cached wrestling stats? This will not delete synced data in Aether.')) {
    return;
  }

  clearBtn.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'clear_cache'
    });

    if (response.success) {
      showStatus('Cache cleared', 'success');
      await updateStats();
    }
  } catch (error) {
    showStatus('Error clearing cache', 'error');
  } finally {
    clearBtn.disabled = false;
  }
}

/**
 * Show status message
 */
function showStatus(message, type = 'success') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.classList.remove('hidden');

  setTimeout(() => {
    statusEl.classList.add('hidden');
  }, 3000);
}

/**
 * Format time for display
 */
function formatTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initPopup);
