// Mat Ops Side Panel Script
// Handles UI and communication with content scripts

let extractedData = null;
let conversationHistory = [];
let currentMode = 'usa-bracketing'; // Default mode
let targetTabId = null; // Store the tab we're working with
let isAutoCapturing = false; // Track if auto-capture is in progress
let shouldPauseCapture = false; // Flag to pause auto-capture

// Mat Ops AI specific state
let matOpsConversationHistory = [];
let matOpsTeamData = null;

// Mat Ops API base URL
const MATOPS_API_BASE = 'https://insight.aethervtc.ai'; // Production Mat Ops URL

// DOM elements
const status = document.getElementById('status');
const wrestlerCount = document.getElementById('wrestlerCount');
const matchCount = document.getElementById('matchCount');
const winCount = document.getElementById('winCount');
const lossCount = document.getElementById('lossCount');
const messages = document.getElementById('messages');
const aiInput = document.getElementById('aiInput');
const sendButton = document.getElementById('sendButton');
const extractButton = document.getElementById('extractButton');
const expandButton = document.getElementById('expandButton');
const exportButton = document.getElementById('exportButton');
const clearButton = document.getElementById('clearButton');
const captureInstructions = document.getElementById('captureInstructions');
const capturedCount = document.getElementById('capturedCount');
const showStatsTableBtn = document.getElementById('showStatsTableBtn');
const autoCaptureButton = document.getElementById('autoCaptureButton');
const autoCaptureProgress = document.getElementById('autoCaptureProgress');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const modeTabs = document.querySelectorAll('.mode-tab');
const importWrestlersBtn = document.getElementById('importWrestlersBtn');

// Import state
let importResults = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupModeSwitcher();
  checkCurrentPage();
  loadConversationHistory();
});

// Setup event listeners
function setupEventListeners() {
  sendButton.addEventListener('click', sendAIMessage);
  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAIMessage();
  });

  extractButton.addEventListener('click', extractStats);
  expandButton.addEventListener('click', expandAllWeightClasses);
  autoCaptureButton.addEventListener('click', autoCaptureAllMatches);
  exportButton.addEventListener('click', exportData);
  clearButton.addEventListener('click', clearConversation);
  showStatsTableBtn.addEventListener('click', showStatsTable);

  // Import wrestlers button
  if (importWrestlersBtn) {
    importWrestlersBtn.addEventListener('click', openImportModal);
  }

  // Import modal close button
  const closeImportModal = document.getElementById('closeImportModal');
  if (closeImportModal) {
    closeImportModal.addEventListener('click', () => {
      document.getElementById('importModal').style.display = 'none';
    });
  }

  // Confirm import button
  const confirmImportBtn = document.getElementById('confirmImportBtn');
  if (confirmImportBtn) {
    confirmImportBtn.addEventListener('click', confirmImport);
  }

  // Import matches button
  const importMatchesBtn = document.getElementById('importMatchesBtn');
  if (importMatchesBtn) {
    importMatchesBtn.addEventListener('click', openMatchImportModal);
  }

  // Match import modal close button
  const closeMatchImportModal = document.getElementById('closeMatchImportModal');
  if (closeMatchImportModal) {
    closeMatchImportModal.addEventListener('click', () => {
      document.getElementById('matchImportModal').style.display = 'none';
    });
  }

  // Confirm match import button
  const confirmMatchImportBtn = document.getElementById('confirmMatchImportBtn');
  if (confirmMatchImportBtn) {
    confirmMatchImportBtn.addEventListener('click', confirmMatchImport);
  }

  // Detect date button
  const detectDateBtn = document.getElementById('detectDateBtn');
  if (detectDateBtn) {
    detectDateBtn.addEventListener('click', detectEventDate);
  }

  // Pause & Import button
  const pauseImportBtn = document.getElementById('pauseImportBtn');
  if (pauseImportBtn) {
    pauseImportBtn.addEventListener('click', pauseAndImport);
  }

  // Select all new matches checkbox
  const selectAllNewMatches = document.getElementById('selectAllNewMatches');
  if (selectAllNewMatches) {
    selectAllNewMatches.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.match-import-checkbox');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Poll for captured count every 2 seconds when instructions visible
  setInterval(updateCapturedCount, 2000);
}

// Setup mode switcher
function setupModeSwitcher() {
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;

      // Update active state
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update current mode
      currentMode = mode;

      // Update status text based on mode
      const modeLabels = {
        'usa-bracketing': 'USA Bracketing Mode',
        'flo-arena': 'Flo Arena Mode (Coming Soon)',
        'trackwrestling': 'TrackWrestling Mode (Coming Soon)',
        'mat-ops-ai': 'Mat Ops AI Coach'
      };

      updateStatus(`Ready • ${modeLabels[mode]}`);

      // Show/hide mode-specific UI sections
      handleModeChange(mode);

      console.log(`[Mat Ops] Switched to ${mode} mode`);
    });
  });
}

// Handle mode change - show/hide content sections
function handleModeChange(mode) {
  // Hide all content sections
  const contentSections = [
    'content-usa-bracketing',
    'content-flo-arena',
    'content-trackwrestling',
    'content-mat-ops-ai'
  ];

  contentSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
    }
  });

  // Show the selected mode's content
  const selectedContent = document.getElementById(`content-${mode}`);
  if (selectedContent) {
    selectedContent.style.display = 'flex';
  }

  // If switching to Mat Ops AI mode, initialize it
  if (mode === 'mat-ops-ai') {
    initMatOpsAI();
  }
}

// Check current page context
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = tab.id; // Store the tab we're working with
    console.log('[Mat Ops Panel] Target tab ID:', targetTabId, 'URL:', tab.url);

    if (tab.url.includes('usabracketing.com')) {
      updateStatus('On USABracketing - Ready to extract');
    } else if (tab.url.includes('aethervtc.ai') || tab.url.includes('wrestleai.com')) {
      updateStatus('On Aether - AI analysis ready');
    } else {
      updateStatus('Navigate to USABracketing or Aether');
    }
  } catch (error) {
    console.error('[Mat Ops] Error checking page:', error);
  }
}

// Extract stats from current page
async function extractStats() {
  updateStatus('Extracting stats...');
  extractButton.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to extract stats
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'extract_stats'
    });

    if (response && response.success) {
      extractedData = response.data;
      updateStats(response.data);
      updateStatus(`✅ Extracted ${response.data.length} wrestlers`);
      exportButton.disabled = false;
      showStatsTableBtn.disabled = false;
      if (importWrestlersBtn) importWrestlersBtn.disabled = false;
      const importMatchesBtn = document.getElementById('importMatchesBtn');
      if (importMatchesBtn) importMatchesBtn.disabled = false;
    } else {
      updateStatus('❌ Failed to extract stats');
    }
  } catch (error) {
    console.error('[Mat Ops] Error extracting:', error);
    if (error.message.includes('Could not establish connection')) {
      updateStatus('❌ Please refresh the page (Cmd+R) and try again');
    } else {
      updateStatus('❌ Error: Make sure you\'re on USABracketing');
    }
  } finally {
    extractButton.disabled = false;
  }
}

// Update stats display
function updateStats(data) {
  if (!data || data.length === 0) {
    wrestlerCount.textContent = '0';
    matchCount.textContent = '0';
    winCount.textContent = '0';
    lossCount.textContent = '0';
    return;
  }

  wrestlerCount.textContent = data.length;

  let totalMatches = 0;
  let wins = 0;
  let losses = 0;

  data.forEach(wrestler => {
    wrestler.weightClasses.forEach(wc => {
      totalMatches += wc.matches.length;
      wc.matches.forEach(match => {
        if (match.result === 'Win') wins++;
        if (match.result === 'Loss') losses++;
      });
    });
  });

  matchCount.textContent = totalMatches;
  winCount.textContent = wins;
  lossCount.textContent = losses;
}

// Show stats table button click handler
async function showStatsTable() {
  if (!extractedData) {
    addMessage('Please extract stats first!', 'error');
    return;
  }

  updateStatus('Generating stats table...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const detailedResponse = await chrome.tabs.sendMessage(tab.id, {
      action: 'get_detailed_stats'
    });

    const statsTable = await createDetailedStatsTable(extractedData, detailedResponse);
    addMessage(statsTable, 'assistant');
    updateStatus('Ready');
  } catch (error) {
    console.error('[Mat Ops] Error showing stats table:', error);
    addMessage('Error generating stats table. Try extracting stats again.', 'error');
    updateStatus('Error');
  }
}

// Send AI message
async function sendAIMessage() {
  const question = aiInput.value.trim();
  if (!question) return;

  if (!extractedData) {
    addMessage('Please extract stats first!', 'error');
    return;
  }

  // Add user message
  addMessage(question, 'user');
  aiInput.value = '';
  sendButton.disabled = true;

  // Check if asking for stats table display with detailed data
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.match(/\b(stats|statistics|show all|full stats|display stats|detailed stats|match stats)\b/)) {
    updateStatus('Generating stats table...');

    // Get detailed stats from content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const detailedResponse = await chrome.tabs.sendMessage(tab.id, {
        action: 'get_detailed_stats'
      });

      const statsTable = await createDetailedStatsTable(extractedData, detailedResponse);
      addMessage(statsTable, 'assistant');
      updateStatus('Ready');
      sendButton.disabled = false;
      return;
    } catch (error) {
      console.error('[Mat Ops] Error getting detailed stats:', error);
      // Fall through to regular AI if error
    }
  }

  updateStatus('AI thinking...');

  // Add thinking indicator
  const thinkingId = 'thinking-' + Date.now();
  addMessage('🤔 Thinking...', 'assistant', thinkingId);

  try {
    // Get detailed stats from content script (clicked matches)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const detailedResponse = await chrome.tabs.sendMessage(tab.id, {
      action: 'get_detailed_stats'
    });

    // Merge detailed stats into extractedData before creating context
    const dataWithDetails = JSON.parse(JSON.stringify(extractedData));

    if (detailedResponse && detailedResponse.success && detailedResponse.detailedStats) {
      console.log(`[Mat Ops AI] Merging ${detailedResponse.count} detailed stats for AI context`);

      // Create a map for quick lookup
      const detailsMap = new Map();
      detailedResponse.detailedStats.forEach(stat => {
        detailsMap.set(stat.id, stat);
      });

      // Merge into dataWithDetails
      dataWithDetails.forEach(wrestler => {
        wrestler.weightClasses.forEach(wc => {
          wc.matches.forEach(match => {
            if (match.matchId && detailsMap.has(match.matchId)) {
              const detail = detailsMap.get(match.matchId);
              Object.assign(match, detail);
            }
          });
        });
      });
    }

    // Create stats context from merged data
    const statsContext = createStatsContext(dataWithDetails);

    // Send to background script for AI processing
    const response = await chrome.runtime.sendMessage({
      action: 'ask_ai',
      question: question,
      statsContext: statsContext
    });

    // Remove thinking indicator
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    if (response.success) {
      addMessage(response.response, 'assistant', null, response.metadata);

      // Update conversation history
      conversationHistory.push({ role: 'user', content: question });
      conversationHistory.push({ role: 'assistant', content: response.response });
      saveConversationHistory();
    } else {
      addMessage(`❌ Error: ${response.error}`, 'error');
    }

    updateStatus('Ready');
  } catch (error) {
    console.error('[Mat Ops] AI error:', error);
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();
    addMessage(`❌ Error: ${error.message}`, 'error');
    updateStatus('Error');
  } finally {
    sendButton.disabled = false;
  }
}

// Add message to chat
function addMessage(text, type, id = null, metadata = null) {
  // Clear empty state if present
  const emptyState = messages.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const messageDiv = document.createElement('div');
  if (id) messageDiv.id = id;
  messageDiv.className = `message message-${type}`;

  // Format message with markdown support
  let formattedText = text
    .replace(/\n{2,}/g, '\n')
    .replace(/^##\s+(.+)$/gm, '<strong style="font-size: 16px; color: #dc2626;">$1</strong><br>')
    .replace(/^###\s+(.+)$/gm, '<strong style="font-size: 14px; color: #ea580c;">$1</strong><br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[HIGH\]/gi, '<span style="color: #dc2626; background: #fef2f2; padding: 2px 6px; border-radius: 3px; font-weight: 600;">[HIGH]</span>')
    .replace(/\[LOW\]/gi, '<span style="color: #ea580c; background: #fff7ed; padding: 2px 6px; border-radius: 3px; font-weight: 600;">[LOW]</span>')
    .replace(/\[GOOD\]/gi, '<span style="color: #059669; background: #f0fdf4; padding: 2px 6px; border-radius: 3px; font-weight: 600;">[GOOD]</span>')
    .replace(/\[PIN\]/gi, '<span style="color: #16a34a; background: #f0fdf4; padding: 3px 8px; border-radius: 4px; border: 1px solid #22c55e; font-weight: 700;">🏆 PIN</span>')
    .replace(/\[WIN\]/gi, '<span style="color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 3px; font-weight: 600;">✅ WIN</span>')
    .replace(/\[LOSS\]/gi, '<span style="color: #dc2626; background: #fef2f2; padding: 2px 6px; border-radius: 3px; font-weight: 600;">❌ LOSS</span>')
    .replace(/^[•\-\*]\s+(.+)$/gm, '<span style="display:block; margin-left: 12px;">• $1</span>')
    .replace(/\n/g, '<br>');

  messageDiv.innerHTML = formattedText;

  // Add token counter if metadata provided
  if (metadata && metadata.usage) {
    const tokenDiv = document.createElement('div');
    tokenDiv.style.cssText = 'margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 11px; color: #6b7280;';
    tokenDiv.innerHTML = `
      <strong>Tokens:</strong>
      In: ${metadata.usage.input_tokens.toLocaleString()} |
      Out: ${metadata.usage.output_tokens.toLocaleString()} |
      Total: ${(metadata.usage.input_tokens + metadata.usage.output_tokens).toLocaleString()}
    `;
    messageDiv.appendChild(tokenDiv);
  }

  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
}

// Create stats context for AI
function createStatsContext(data) {
  const wrestlers = data.map(w => {
    const matches = [];
    let wins = 0;
    let losses = 0;

    w.weightClasses.forEach(wc => {
      wc.matches.forEach(match => {
        const matchData = {
          opponent: match.opponent,
          result: match.result,
          winType: match.winType,
          score: match.score
        };

        // Include detailed stats if available (from clicked matches)
        if (match.takedowns !== undefined) {
          matchData.detailedStats = {
            takedowns: match.takedowns,
            escapes: match.escapes,
            reversals: match.reversals,
            nearfall2: match.nearfall2,
            nearfall3: match.nearfall3,
            nearfall4: match.nearfall4,
            penalties: match.penalties,
            ridingTime: match.ridingTime
          };
        }

        matches.push(matchData);
        if (match.result === 'Win') wins++;
        if (match.result === 'Loss') losses++;
      });
    });

    return {
      name: w.name,
      team: w.team,
      wins,
      losses,
      matchCount: matches.length,
      matches: matches
    };
  });

  const summary = {
    totalWrestlers: data.length,
    totalMatches: wrestlers.reduce((sum, w) => sum + w.matchCount, 0),
    totalWins: wrestlers.reduce((sum, w) => sum + w.wins, 0),
    totalLosses: wrestlers.reduce((sum, w) => sum + w.losses, 0)
  };

  return { wrestlers, summary };
}

// Create detailed stats table with takedowns, reversals, etc.
async function createDetailedStatsTable(data, detailedResponse) {
  if (!data || data.length === 0) {
    return 'No stats available. Please extract stats first.';
  }

  // Check if we have detailed stats from clicked matches
  const hasDetailedStats = detailedResponse && detailedResponse.success && detailedResponse.count > 0;

  if (!hasDetailedStats) {
    return `<div style="padding: 20px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; color: #92400e;"><div style="font-weight: 700; margin-bottom: 8px;">⚠️ No Detailed Stats Captured</div><div style="font-size: 12px; line-height: 1.6;">To see detailed stats (takedowns, reversals, escapes, nearfalls):<ol style="margin: 8px 0 0 20px;"><li>Click "Auto-Expand All"</li><li>Click on match scores (e.g., "Dec 9-6")</li><li>Extension will auto-capture detailed stats</li><li>Then type "stats" again</li></ol></div></div>`;
  }

  // Create map of detailed stats
  const detailsMap = new Map();
  detailedResponse.detailedStats.forEach(stat => {
    detailsMap.set(stat.id, stat);
  });

  // Build table rows with detailed stats
  let totalTakedowns = 0;
  let totalEscapes = 0;
  let totalReversals = 0;
  let totalNearfall2 = 0;
  let totalNearfall3 = 0;
  let totalNearfall4 = 0;
  let totalPenalty1 = 0;
  let totalPenalty2 = 0;
  let matchesWithDetails = 0;

  const rows = [];

  data.forEach(wrestler => {
    wrestler.weightClasses.forEach(wc => {
      wc.matches.forEach(match => {
        if (match.matchId && detailsMap.has(match.matchId)) {
          const detail = detailsMap.get(match.matchId);
          matchesWithDetails++;

          totalTakedowns += detail.takedowns || 0;
          totalEscapes += detail.escapes || 0;
          totalReversals += detail.reversals || 0;
          totalNearfall2 += detail.nearfall2 || 0;
          totalNearfall3 += detail.nearfall3 || 0;
          totalNearfall4 += detail.nearfall4 || 0;
          totalPenalty1 += detail.penalty1 || 0;
          totalPenalty2 += detail.penalty2 || 0;

          rows.push(`<tr><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; font-weight: 600; font-size: 11px;">${wrestler.name}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 11px;">${match.opponent || '-'}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 11px;">${match.result === 'Win' ? '<span style="color: #059669; font-weight: 600;">W</span>' : '<span style="color: #dc2626; font-weight: 600;">L</span>'}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 10px;">${match.score || '-'}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #3b82f6; font-size: 11px;">${detail.takedowns || 0}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #10b981; font-size: 11px;">${detail.escapes || 0}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #8b5cf6; font-size: 11px;">${detail.reversals || 0}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #f59e0b; font-size: 11px;">${detail.nearfall2 || 0}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #f59e0b; font-size: 11px;">${detail.nearfall3 || 0}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #f59e0b; font-size: 11px;">${detail.nearfall4 || 0}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #ef4444; font-size: 11px;">${detail.penalty1 || 0}</td><td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #ef4444; font-size: 11px;">${detail.penalty2 || 0}</td></tr>`);
        }
      });
    });
  });

  if (rows.length === 0) {
    return `<div style="padding: 20px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; color: #92400e;"><div style="font-weight: 700;">⚠️ No matches captured yet</div><div style="font-size: 12px; margin-top: 8px;">Click on match scores to capture detailed stats.</div></div>`;
  }

  return `<div style="overflow-x: auto;"><div style="margin-bottom: 8px; padding: 8px; background: #eff6ff; border-radius: 4px; font-size: 11px; color: #1e40af;"><strong>📊 Detailed Match Stats:</strong> ${matchesWithDetails} matches with detailed data</div><table style="width: 100%; border-collapse: collapse; font-size: 11px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;"><thead><tr style="background: #f9fafb;"><th style="padding: 8px 6px; text-align: left; font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Wrestler</th><th style="padding: 8px 6px; text-align: left; font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Opponent</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">W/L</th><th style="padding: 8px 6px; text-align: left; font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Score</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #3b82f6; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">TD</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">ESC</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #8b5cf6; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">REV</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #f59e0b; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">NF2</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #f59e0b; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">NF3</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #f59e0b; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">NF4</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #ef4444; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">P1</th><th style="padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; color: #ef4444; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">P2</th></tr></thead><tbody>${rows.join('')}</tbody><tfoot><tr style="background: #f9fafb; font-weight: 700;"><td colspan="4" style="padding: 8px 6px; border-top: 2px solid #e5e7eb; font-size: 10px;">TOTALS (${matchesWithDetails} matches)</td><td style="padding: 8px 6px; text-align: center; color: #3b82f6; border-top: 2px solid #e5e7eb; font-size: 11px;">${totalTakedowns}</td><td style="padding: 8px 6px; text-align: center; color: #10b981; border-top: 2px solid #e5e7eb; font-size: 11px;">${totalEscapes}</td><td style="padding: 8px 6px; text-align: center; color: #8b5cf6; border-top: 2px solid #e5e7eb; font-size: 11px;">${totalReversals}</td><td style="padding: 8px 6px; text-align: center; color: #f59e0b; border-top: 2px solid #e5e7eb; font-size: 11px;">${totalNearfall2}</td><td style="padding: 8px 6px; text-align: center; color: #f59e0b; border-top: 2px solid #e5e7eb; font-size: 11px;">${totalNearfall3}</td><td style="padding: 8px 6px; text-align: center; color: #f59e0b; border-top: 2px solid #e5e7eb; font-size: 11px;">${totalNearfall4}</td><td style="padding: 8px 6px; text-align: center; color: #ef4444; border-top: 2px solid #e5e7eb; font-size: 11px;">${totalPenalty1}</td><td style="padding: 8px 6px; text-align: center; color: #ef4444; border-top: 2px solid #e5e7eb; font-size: 11px;">${totalPenalty2}</td></tr></tfoot></table></div><div style="margin-top: 8px; font-size: 10px; color: #6b7280; font-style: italic;">💡 <strong>Legend:</strong> TD=Takedowns, ESC=Escapes, REV=Reversals, NF2/3/4=Nearfall Points (2/3/4 pts), P1/P2=Penalties (1/2 pts)</div>`;
}

// Expand all weight classes
async function expandAllWeightClasses() {
  updateStatus('Expanding weight classes...');
  expandButton.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'auto_expand'
    });

    if (response && response.success) {
      updateStatus('✅ All weight classes expanded - Click listeners attached!');
      // Show instructions for manual capture
      captureInstructions.style.display = 'block';
      // Enable auto-capture button
      autoCaptureButton.disabled = false;
      updateCapturedCount(); // Initial count update
    } else {
      updateStatus('❌ Failed to expand weight classes');
    }
  } catch (error) {
    console.error('[Mat Ops] Error expanding:', error);
    if (error.message.includes('Could not establish connection')) {
      updateStatus('❌ Please refresh the page (Cmd+R) and try again');
    } else {
      updateStatus('❌ Error expanding weight classes');
    }
  } finally {
    expandButton.disabled = false;
  }
}

// Pause auto-capture and open import modal
async function pauseAndImport() {
  shouldPauseCapture = true;
  updateStatus('⏸️ Pausing capture...');

  // Update UI immediately
  const progressText = document.getElementById('progressText');
  if (progressText) {
    progressText.innerHTML = `<div style="font-weight: 700; color: #f59e0b;">⏸️ Paused - Opening import...</div>`;
  }

  // Send pause message to content script
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'pause_capture' });
  } catch (e) {
    console.log('[Mat Ops] Could not send pause message:', e);
  }

  // Small delay to let the capture loop notice the pause
  await new Promise(resolve => setTimeout(resolve, 500));

  // Hide progress and open import modal
  const autoCaptureProgress = document.getElementById('autoCaptureProgress');
  if (autoCaptureProgress) {
    autoCaptureProgress.style.display = 'none';
  }

  // Re-enable buttons
  isAutoCapturing = false;
  autoCaptureButton.disabled = false;
  const importBtn = document.getElementById('importMatchesBtn');
  if (importBtn) importBtn.disabled = false;

  // Open the import modal with current data
  await openMatchImportModal();

  // Reset pause flag
  shouldPauseCapture = false;
}

// Auto-capture all matches
async function autoCaptureAllMatches() {
  if (!extractedData) {
    updateStatus('❌ Please extract stats first');
    return;
  }

  updateStatus('🤖 Starting auto-capture...');
  isAutoCapturing = true;
  shouldPauseCapture = false; // Reset pause flag
  autoCaptureButton.disabled = true;
  // Disable import button while capturing
  const importBtn = document.getElementById('importMatchesBtn');
  if (importBtn) importBtn.disabled = true;
  autoCaptureProgress.style.display = 'block';
  progressText.innerHTML = '<div style="font-weight: 600;">🤖 Initializing auto-capture...</div>';
  progressBar.style.width = '0%';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = tab.id; // Store the tab we're working with
    console.log('[Mat Ops Panel] Starting auto-capture on tab:', targetTabId);

    // Set up progress listener
    const progressListener = (message) => {
      if (message.action === 'auto_capture_progress') {
        const { current, total, captured, skipped, status, matchId } = message.progress;

        let statusEmoji = '🤖';
        let statusText = '';

        switch (status) {
          case 'clicking':
            statusEmoji = '👆';
            statusText = `Opening match ${current}/${total}...`;
            break;
          case 'capturing':
            statusEmoji = '📊';
            statusText = `Capturing stats ${current}/${total}...`;
            break;
          case 'closing':
            statusEmoji = '🚪';
            statusText = `Closing ${current}/${total}...`;
            break;
          case 'skipping':
            statusEmoji = '⏭️';
            statusText = `Skipped bye/forfeit ${current}/${total}`;
            break;
          case 'ready':
            statusEmoji = '✅';
            statusText = `Match ${current}/${total} complete`;
            break;
          default:
            statusText = `Processing ${current}/${total}`;
        }

        // Calculate your team's match count from extracted data
        const teamMatchCount = extractedData ? extractedData.reduce((sum, w) => {
          return sum + w.weightClasses.reduce((wcSum, wc) => wcSum + wc.matches.length, 0);
        }, 0) : 0;

        progressText.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 4px;">${statusEmoji} ${statusText}</div>
          <div style="font-size: 10px; color: #6b7280;">Your team: ${teamMatchCount} matches | Captured: ${captured} details</div>
        `;

        // Update progress bar
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;

        // Update status bar too
        updateStatus(`🤖 Scanning page: ${current}/${total} (${captured} details captured)`);
      }
    };
    chrome.runtime.onMessage.addListener(progressListener);

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'auto_capture'
    });

    // Remove progress listener
    chrome.runtime.onMessage.removeListener(progressListener);

    if (response && response.success) {
      const { total, captured, skipped } = response;

      // Check if no matches were found
      if (total === 0) {
        updateStatus('⚠️ No matches found. Click "Auto-Expand All" first!');
        progressText.innerHTML = `
          <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px;">⚠️ No matches found</div>
          <div style="font-size: 10px; color: #374151;">Click "Auto-Expand All" to show matches first</div>
        `;
        setTimeout(() => {
          autoCaptureProgress.style.display = 'none';
        }, 3000);
        return;
      }

      updateStatus(`✅ Auto-capture complete! Captured: ${captured}, Skipped: ${skipped}, Total: ${total}`);

      // Update progress to 100% and show completion
      progressBar.style.width = '100%';
      progressText.innerHTML = `
        <div style="font-weight: 700; color: #059669; margin-bottom: 4px;">🎉 Complete!</div>
        <div style="font-size: 10px; color: #374151;">Captured: ${captured} new | Skipped: ${skipped} | Total: ${total}</div>
      `;

      // Enable auto-capture button after completion
      autoCaptureButton.disabled = false;

      // Update the captured count display
      updateCapturedCount();

      // Auto-hide progress after 5 seconds
      setTimeout(() => {
        autoCaptureProgress.style.display = 'none';
      }, 5000);
    } else {
      updateStatus('❌ Auto-capture failed');
      autoCaptureProgress.style.display = 'none';
    }
  } catch (error) {
    console.error('[Mat Ops] Error auto-capturing:', error);
    if (error.message.includes('Could not establish connection')) {
      updateStatus('❌ Please refresh the page (Cmd+R) and try again');
    } else {
      updateStatus('❌ Error during auto-capture');
    }
    autoCaptureProgress.style.display = 'none';
  } finally {
    isAutoCapturing = false;
    autoCaptureButton.disabled = false;
    // Re-enable import button
    const importBtn = document.getElementById('importMatchesBtn');
    if (importBtn) importBtn.disabled = false;
  }
}

// Update captured count from content script
async function updateCapturedCount() {
  if (captureInstructions.style.display === 'none') return;

  try {
    // Use stored tab ID, or fall back to active tab
    let tabId = targetTabId;
    if (!tabId) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      tabId = tab.id;
    }

    console.log('[Mat Ops Panel] updateCapturedCount querying tab:', tabId);

    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'get_detailed_stats'
    });

    console.log('[Mat Ops Panel] get_detailed_stats response:', response);

    if (response && response.success) {
      capturedCount.textContent = `Captured: ${response.count} matches`;
      if (response.count > 0) {
        capturedCount.style.color = '#22c55e'; // Green
      }
    }
  } catch (error) {
    // Silently ignore connection errors - expected on non-supported pages
    if (!error.message?.includes('Could not establish connection')) {
      console.error('[Mat Ops Panel] updateCapturedCount error:', error);
    }
  }
}

// Export data
async function exportData() {
  if (!extractedData) return;

  updateStatus('Preparing export...');

  try {
    // Get detailed stats from content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'get_detailed_stats'
    });

    // Merge detailed stats into export data
    const exportData = JSON.parse(JSON.stringify(extractedData));
    let detailedCount = 0;

    if (response && response.success && response.detailedStats) {
      console.log(`[Mat Ops Export] Merging ${response.count} detailed stats`);

      // Create a map for quick lookup
      const detailsMap = new Map();
      response.detailedStats.forEach(stat => {
        detailsMap.set(stat.id, stat);
      });

      // Merge into exportData
      exportData.forEach(wrestler => {
        wrestler.weightClasses.forEach(wc => {
          wc.matches.forEach(match => {
            if (match.matchId && detailsMap.has(match.matchId)) {
              const detail = detailsMap.get(match.matchId);
              Object.assign(match, detail);
              detailedCount++;
            }
          });
        });
      });
    }

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matops-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const totalMatches = exportData.reduce((sum, w) =>
      sum + w.weightClasses.reduce((wSum, wc) => wSum + wc.matches.length, 0), 0
    );

    updateStatus(`✅ Exported ${exportData.length} wrestlers (${detailedCount}/${totalMatches} with detailed stats)`);
  } catch (error) {
    console.error('[Mat Ops Export] Error:', error);
    // Fallback to basic export
    const json = JSON.stringify(extractedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matops-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    updateStatus('✅ Exported (basic stats only)');
  }
}

// Clear conversation
function clearConversation() {
  conversationHistory = [];
  saveConversationHistory();
  messages.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📊</div>
      <p>Conversation cleared. Ready for new analysis!</p>
    </div>
  `;
}

// Update status
function updateStatus(text) {
  status.textContent = text;
}

// Save conversation history
function saveConversationHistory() {
  chrome.storage.local.set({ conversationHistory });
}

// Load conversation history
async function loadConversationHistory() {
  try {
    const result = await chrome.storage.local.get(['conversationHistory']);
    if (result.conversationHistory) {
      conversationHistory = result.conversationHistory;
    }
  } catch (error) {
    console.error('[Mat Ops] Error loading history:', error);
  }
}

// =============================================
// MAT OPS AI MODE FUNCTIONALITY
// =============================================

// Wrestling knowledge system prompt (same as web app)
const WRESTLING_KNOWLEDGE = `You are Mat Ops AI, a wrestling coaching assistant. You have expertise in:
- Wrestling techniques (takedowns, escapes, reversals, pins)
- Practice planning and drill recommendations
- Match strategy and opponent analysis
- Weight management guidance
- Team building and motivation
- Wrestling rules and scoring
- Conditioning and injury prevention

Always be encouraging but realistic. Use wrestling terminology appropriately.
When discussing stats, be specific about what the numbers mean for the wrestler's development.
Suggest actionable improvements based on the data.`;

// Initialize Mat Ops AI mode
async function initMatOpsAI() {
  console.log('[Mat Ops AI] Initializing...');

  // Setup event listeners for Mat Ops AI
  setupMatOpsAIListeners();

  // Try to load team data
  await loadMatOpsTeamData();

  // Load conversation history
  await loadMatOpsConversationHistory();
}

// Setup Mat Ops AI event listeners
function setupMatOpsAIListeners() {
  const matOpsInput = document.getElementById('matops-ai-input');
  const matOpsSendBtn = document.getElementById('matops-send-btn');
  const openMatOpsSiteBtn = document.getElementById('open-matops-site');
  const quickActionBtns = document.querySelectorAll('.matops-quick-action');

  if (matOpsSendBtn && !matOpsSendBtn.hasAttribute('data-listener-attached')) {
    matOpsSendBtn.setAttribute('data-listener-attached', 'true');
    matOpsSendBtn.addEventListener('click', sendMatOpsAIMessage);
  }

  if (matOpsInput && !matOpsInput.hasAttribute('data-listener-attached')) {
    matOpsInput.setAttribute('data-listener-attached', 'true');
    matOpsInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMatOpsAIMessage();
    });
  }

  if (openMatOpsSiteBtn && !openMatOpsSiteBtn.hasAttribute('data-listener-attached')) {
    openMatOpsSiteBtn.setAttribute('data-listener-attached', 'true');
    openMatOpsSiteBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: MATOPS_API_BASE });
    });
  }

  quickActionBtns.forEach(btn => {
    if (!btn.hasAttribute('data-listener-attached')) {
      btn.setAttribute('data-listener-attached', 'true');
      btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        if (prompt) {
          const matOpsInput = document.getElementById('matops-ai-input');
          if (matOpsInput) {
            matOpsInput.value = prompt;
            sendMatOpsAIMessage();
          }
        }
      });
    }
  });
}

// Load team data from Mat Ops
async function loadMatOpsTeamData() {
  try {
    // Try to get session from content script (if on Mat Ops site)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.includes('aethervtc.ai') || tab.url.includes('wrestleai.com') || tab.url.includes('localhost:3000')) {
      // Try to get session data from the page
      try {
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const session = localStorage.getItem('aether-session');
            return session ? JSON.parse(session) : null;
          }
        });

        if (result && result[0] && result[0].result) {
          const session = result[0].result;
          if (session.team) {
            // Fetch wrestlers from API
            const response = await fetch(`${MATOPS_API_BASE}/api/extension/wrestlers?teamId=${session.team.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.wrestlers) {
                matOpsTeamData = processTeamData(session.team, data.wrestlers);
                updateMatOpsTeamDisplay();
                console.log('[Mat Ops AI] Team data loaded:', matOpsTeamData);
                return;
              }
            }
          }
        }
      } catch (e) {
        console.log('[Mat Ops AI] Could not get session from page:', e);
      }
    }

    // Try loading from storage
    const stored = await chrome.storage.local.get(['matOpsTeamData']);
    if (stored.matOpsTeamData) {
      matOpsTeamData = stored.matOpsTeamData;
      updateMatOpsTeamDisplay();
      console.log('[Mat Ops AI] Team data loaded from storage');
      return;
    }

    // No team data available
    showMatOpsNotLoggedIn();
  } catch (error) {
    console.error('[Mat Ops AI] Error loading team data:', error);
    showMatOpsNotLoggedIn();
  }
}

// Process team data for AI context
function processTeamData(team, wrestlers) {
  const totalWins = wrestlers.reduce((sum, w) => sum + (w.wins || 0), 0);
  const totalLosses = wrestlers.reduce((sum, w) => sum + (w.losses || 0), 0);
  const totalPins = wrestlers.reduce((sum, w) => sum + (w.pins || 0), 0);
  const totalTechFalls = wrestlers.reduce((sum, w) => sum + (w.tech_falls || 0), 0);
  const totalMajors = wrestlers.reduce((sum, w) => sum + (w.major_decisions || 0), 0);
  const totalTakedowns = wrestlers.reduce((sum, w) => sum + (w.takedowns || 0), 0);
  const totalEscapes = wrestlers.reduce((sum, w) => sum + (w.escapes || 0), 0);
  const totalReversals = wrestlers.reduce((sum, w) => sum + (w.reversals || 0), 0);

  return {
    teamName: team.name,
    wrestlers,
    wrestlerCount: wrestlers.length,
    totalWins,
    totalLosses,
    winPercentage: totalWins + totalLosses > 0
      ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1)
      : 0,
    totalPins,
    totalTechFalls,
    totalMajors,
    totalTakedowns,
    totalEscapes,
    totalReversals
  };
}

// Update Mat Ops team display (data loaded for AI context)
function updateMatOpsTeamDisplay() {
  // Team data is now only used for AI context, no UI display needed
  console.log('[Mat Ops AI] Team data loaded for AI context');
}

// Show not logged in message
function showMatOpsNotLoggedIn() {
  // No longer showing a UI message, team data is optional for AI
  console.log('[Mat Ops AI] No team data available - AI will work without team context');
}

// Send Mat Ops AI message
async function sendMatOpsAIMessage() {
  const matOpsInput = document.getElementById('matops-ai-input');
  const matOpsMessages = document.getElementById('matops-messages');
  const matOpsSendBtn = document.getElementById('matops-send-btn');

  const question = matOpsInput.value.trim();
  if (!question) return;

  // Add user message
  addMatOpsMessage(question, 'user');
  matOpsInput.value = '';
  matOpsSendBtn.disabled = true;

  updateStatus('Mat Ops AI thinking...');

  // Add thinking indicator
  const thinkingId = 'matops-thinking-' + Date.now();
  addMatOpsMessage('🤔 Thinking...', 'assistant', thinkingId);

  try {
    // Build context with team data
    let context = WRESTLING_KNOWLEDGE;
    if (matOpsTeamData && matOpsTeamData.wrestlers?.length > 0) {
      context += buildTeamContext(matOpsTeamData);
    }

    // Call Mat Ops AI API
    const response = await fetch(`${MATOPS_API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: context },
          ...matOpsConversationHistory.map(m => ({
            role: m.role,
            content: m.content
          })),
          { role: 'user', content: question }
        ]
      })
    });

    // Remove thinking indicator
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    if (response.ok) {
      const data = await response.json();
      const assistantMessage = data.message || data.content || 'Sorry, I had trouble processing that.';

      addMatOpsMessage(assistantMessage, 'assistant');

      // Update conversation history
      matOpsConversationHistory.push({ role: 'user', content: question });
      matOpsConversationHistory.push({ role: 'assistant', content: assistantMessage });
      saveMatOpsConversationHistory();
    } else {
      throw new Error('API request failed');
    }

    updateStatus('Ready • Mat Ops AI Coach');
  } catch (error) {
    console.error('[Mat Ops AI] Error:', error);

    // Remove thinking indicator
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    // Fallback response
    const fallbackResponse = generateMatOpsFallbackResponse(question, matOpsTeamData);
    addMatOpsMessage(fallbackResponse, 'assistant');

    updateStatus('Ready • Mat Ops AI Coach (offline)');
  } finally {
    matOpsSendBtn.disabled = false;
  }
}

// Build team context for AI
function buildTeamContext(teamData) {
  return `

=== TEAM DATA: ${teamData.teamName} ===

TEAM OVERVIEW:
- Roster Size: ${teamData.wrestlerCount} wrestlers
- Season Record: ${teamData.totalWins}-${teamData.totalLosses} (${teamData.winPercentage}% win rate)
- Total Pins: ${teamData.totalPins} | Tech Falls: ${teamData.totalTechFalls} | Major Decisions: ${teamData.totalMajors}
- Total Takedowns: ${teamData.totalTakedowns} | Escapes: ${teamData.totalEscapes} | Reversals: ${teamData.totalReversals}

FULL ROSTER (by weight class):
${teamData.wrestlers.map(w => {
  const matches = (w.wins || 0) + (w.losses || 0);
  const winPct = matches > 0 ? ((w.wins / matches) * 100).toFixed(0) : 'N/A';
  return `- ${w.first_name} ${w.last_name} | ${w.weight_class || '?'}lbs | Grade ${w.grade || '?'} | ${w.wins || 0}-${w.losses || 0} (${winPct}%) | ${w.pins || 0} pins | TD: ${w.takedowns || 0} | E: ${w.escapes || 0} | R: ${w.reversals || 0}`;
}).join('\n')}

When answering questions about specific wrestlers, reference their actual stats. Be specific with names and numbers.`;
}

// Add message to Mat Ops AI chat
function addMatOpsMessage(text, type, id = null) {
  const matOpsMessages = document.getElementById('matops-messages');
  if (!matOpsMessages) return;

  // Clear empty state if present
  const emptyState = matOpsMessages.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const messageDiv = document.createElement('div');
  if (id) messageDiv.id = id;
  messageDiv.className = `message message-${type}`;

  // Format message with markdown support
  let formattedText = text
    .replace(/\n{2,}/g, '\n')
    .replace(/^##\s+(.+)$/gm, '<strong style="font-size: 16px; color: #d4af37;">$1</strong><br>')
    .replace(/^###\s+(.+)$/gm, '<strong style="font-size: 14px; color: #f59e0b;">$1</strong><br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[•\-\*]\s+(.+)$/gm, '<span style="display:block; margin-left: 12px;">• $1</span>')
    .replace(/\n/g, '<br>');

  messageDiv.innerHTML = formattedText;
  matOpsMessages.appendChild(messageDiv);
  matOpsMessages.scrollTop = matOpsMessages.scrollHeight;
}

// Generate fallback response when API is not available
function generateMatOpsFallbackResponse(input, teamData) {
  const lower = input.toLowerCase();

  if (lower.includes('practice') || lower.includes('drill')) {
    return `**Practice Plan Suggestion:**

**Warm-up (15 min)**
- Light jog, dynamic stretching
- Stance and motion drills

**Technique Block (30 min)**
- Focus on one takedown (single leg chain)
- Partner drilling with resistance progression

**Live Wrestling (25 min)**
- Situation wrestling from various positions
- Full 6-minute matches

**Conditioning (10 min)**
- Buddy carries, sprawl sprints

**Cool Down (10 min)**
- Static stretching, team huddle

Want me to elaborate on any specific drill?`;
  }

  if (lower.includes('weight') || lower.includes('cut')) {
    return `**Weight Management Tips:**

• **Gradual cuts** - Max 2-3 lbs per week safely
• **Hydration tracking** - Monitor urine color
• **Smart eating** - Lean proteins, complex carbs
• **Avoid drastic measures** - No saunas right before weigh-ins

What specific weight class are you concerned about?`;
  }

  if (lower.includes('season') || lower.includes('performance') || lower.includes('overview')) {
    if (teamData) {
      return `**${teamData.teamName} Season Overview**

📊 **Record**: ${teamData.totalWins}-${teamData.totalLosses} (${teamData.winPercentage}%)
👥 **Roster Size**: ${teamData.wrestlerCount} wrestlers
🏆 **Pins**: ${teamData.totalPins} | Tech Falls: ${teamData.totalTechFalls}

Focus areas to improve:
• Increase pin rate for bonus points
• Work on escape percentage from bottom
• Develop depth at key weight classes

Want me to analyze specific wrestlers?`;
    }
    return `I'd love to give you a season overview! Log in to Mat Ops to see your team data.`;
  }

  // Default response
  return `Great question, Coach! 🤼

I'm here to help with:
• **Practice planning** - Drills, workouts, technique focus
• **Team analysis** - Performance trends, roster evaluation
• **Match strategy** - Preparation and game plans
• **Wrestling knowledge** - Rules, techniques, best practices

${teamData ? `I have your ${teamData.teamName} data loaded with ${teamData.wrestlerCount} wrestlers.` : 'Log in to Mat Ops to access your team data.'}

What specific area would you like to explore?`;
}

// Save Mat Ops conversation history
function saveMatOpsConversationHistory() {
  chrome.storage.local.set({ matOpsConversationHistory });
}

// Load Mat Ops conversation history
async function loadMatOpsConversationHistory() {
  try {
    const result = await chrome.storage.local.get(['matOpsConversationHistory']);
    if (result.matOpsConversationHistory) {
      matOpsConversationHistory = result.matOpsConversationHistory;
    }
  } catch (error) {
    console.error('[Mat Ops AI] Error loading history:', error);
  }
}

// =============================================
// WRESTLER IMPORT FUNCTIONALITY
// =============================================

// Open import modal and match wrestlers
async function openImportModal() {
  if (!extractedData || extractedData.length === 0) {
    updateStatus('❌ Please extract stats first');
    return;
  }

  // Show modal
  const modal = document.getElementById('importModal');
  const loading = document.getElementById('importLoading');
  const results = document.getElementById('importResults');
  const error = document.getElementById('importError');

  modal.style.display = 'block';
  loading.style.display = 'block';
  results.style.display = 'none';
  error.style.display = 'none';

  try {
    // Get team ID from session (try to get from Mat Ops tab or storage)
    const teamId = await getTeamId();

    if (!teamId) {
      showImportError('Please log in to Mat Ops first to import wrestlers');
      return;
    }

    // Prepare wrestlers for import
    const wrestlers = extractedData.map(w => {
      // Get the primary weight class
      const weightClass = w.weightClasses && w.weightClasses.length > 0
        ? w.weightClasses[0].weight
        : null;

      // Count wins/losses
      let wins = 0, losses = 0;
      if (w.weightClasses) {
        w.weightClasses.forEach(wc => {
          wc.matches.forEach(m => {
            if (m.result === 'Win') wins++;
            if (m.result === 'Loss') losses++;
          });
        });
      }

      return {
        name: w.name,
        team: w.team,
        state: w.state,
        athleteId: w.athleteId,
        weightClass,
        wins,
        losses
      };
    });

    // Call import API
    const response = await fetch(`${MATOPS_API_BASE}/api/extension/import-wrestlers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, wrestlers })
    });

    if (!response.ok) {
      throw new Error('Failed to match wrestlers');
    }

    importResults = await response.json();
    console.log('[Mat Ops Import] Results:', importResults);

    // Show results
    renderImportResults(importResults);

  } catch (err) {
    console.error('[Mat Ops Import] Error:', err);
    showImportError(err.message || 'Failed to match wrestlers');
  }
}

// Get team ID from various sources
async function getTeamId() {
  // Try to get from current tab if on Mat Ops
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url && (tab.url.includes('aethervtc.ai') || tab.url.includes('wrestleai.com') || tab.url.includes('localhost:3000'))) {
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const session = localStorage.getItem('aether-session');
          return session ? JSON.parse(session) : null;
        }
      });

      if (result && result[0] && result[0].result && result[0].result.team) {
        // Save for later use
        await chrome.storage.local.set({ matOpsTeamId: result[0].result.team.id });
        return result[0].result.team.id;
      }
    }
  } catch (e) {
    console.log('[Mat Ops Import] Could not get session from tab:', e);
  }

  // Try to get from storage
  const stored = await chrome.storage.local.get(['matOpsTeamId']);
  if (stored.matOpsTeamId) {
    return stored.matOpsTeamId;
  }

  return null;
}

// Render import results
function renderImportResults(data) {
  const loading = document.getElementById('importLoading');
  const results = document.getElementById('importResults');

  loading.style.display = 'none';
  results.style.display = 'block';

  // Update summary counts
  document.getElementById('matchedCount').textContent = data.summary.matched;
  document.getElementById('reviewCount').textContent = data.summary.needsReview;
  document.getElementById('newCount').textContent = data.summary.new;

  // Render matched section
  const matchedSection = document.getElementById('matchedSection');
  const matchedList = document.getElementById('matchedList');
  document.getElementById('matchedTotal').textContent = data.summary.matched;

  if (data.results.matched.length > 0) {
    matchedSection.style.display = 'block';
    matchedList.innerHTML = data.results.matched.map(r =>
      `<div style="padding: 4px 0; border-bottom: 1px solid #d1fae5;">
        ✓ <strong>${r.imported.name}</strong> → ${r.matched.first_name} ${r.matched.last_name}
        ${r.imported.weightClass ? `(${r.imported.weightClass}lbs)` : ''}
      </div>`
    ).join('');
  } else {
    matchedSection.style.display = 'none';
  }

  // Render needs review section
  const reviewSection = document.getElementById('reviewSection');
  const reviewList = document.getElementById('reviewList');
  document.getElementById('reviewTotal').textContent = data.summary.needsReview;

  if (data.results.needsReview.length > 0) {
    reviewSection.style.display = 'block';
    reviewList.innerHTML = data.results.needsReview.map((r, idx) => {
      const options = r.potentialMatches.map(pm =>
        `<option value="${pm.id}">${pm.first_name} ${pm.last_name} (${pm.weight_class || '?'}lbs) - ${Math.round(pm.similarity * 100)}% match</option>`
      ).join('');

      return `<div style="padding: 8px; margin-bottom: 8px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 4px;">
        <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">${r.imported.name} ${r.imported.weightClass ? `(${r.imported.weightClass}lbs)` : ''}</div>
        <div style="margin-bottom: 4px;">
          <label style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <input type="radio" name="review_${idx}" value="link" checked data-idx="${idx}">
            Link to existing:
          </label>
          <select id="review_select_${idx}" style="width: 100%; padding: 4px; font-size: 11px; border: 1px solid #d1d5db; border-radius: 4px;">
            ${options}
          </select>
        </div>
        <label style="display: flex; align-items: center; gap: 4px;">
          <input type="radio" name="review_${idx}" value="new" data-idx="${idx}">
          Add as new wrestler
        </label>
        <label style="display: flex; align-items: center; gap: 4px;">
          <input type="radio" name="review_${idx}" value="skip" data-idx="${idx}">
          Skip this wrestler
        </label>
      </div>`;
    }).join('');
  } else {
    reviewSection.style.display = 'none';
  }

  // Render new wrestlers section
  const newSection = document.getElementById('newSection');
  const newList = document.getElementById('newList');
  document.getElementById('newTotal').textContent = data.summary.new;

  if (data.results.newWrestlers.length > 0) {
    newSection.style.display = 'block';
    newList.innerHTML = data.results.newWrestlers.map((r, idx) =>
      `<div style="padding: 8px; margin-bottom: 8px; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 4px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="new_${idx}" checked>
          <div>
            <div style="font-weight: 600; color: #1e40af;">${r.imported.name}</div>
            <div style="font-size: 10px; color: #6b7280;">${r.imported.weightClass ? `${r.imported.weightClass}lbs` : 'No weight'} • ${r.imported.wins || 0}W-${r.imported.losses || 0}L</div>
          </div>
        </label>
        <div style="margin-top: 4px;">
          <input type="text" id="new_name_${idx}" value="${r.imported.name}" placeholder="Correct name if needed" style="width: 100%; padding: 4px; font-size: 11px; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>
      </div>`
    ).join('');
  } else {
    newSection.style.display = 'none';
  }
}

// Show import error
function showImportError(message) {
  const loading = document.getElementById('importLoading');
  const results = document.getElementById('importResults');
  const error = document.getElementById('importError');

  loading.style.display = 'none';
  results.style.display = 'none';
  error.style.display = 'block';
  document.getElementById('importErrorText').textContent = message;
}

// Confirm and execute import
async function confirmImport() {
  if (!importResults) return;

  const confirmBtn = document.getElementById('confirmImportBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '⏳ Importing...';

  try {
    const teamId = await getTeamId();
    if (!teamId) {
      throw new Error('No team ID found');
    }

    const wrestlersToAdd = [];

    // Process review selections
    importResults.results.needsReview.forEach((r, idx) => {
      const selected = document.querySelector(`input[name="review_${idx}"]:checked`);
      if (selected) {
        if (selected.value === 'new') {
          wrestlersToAdd.push({
            name: r.imported.name,
            weightClass: r.imported.weightClass
          });
        } else if (selected.value === 'link') {
          const selectEl = document.getElementById(`review_select_${idx}`);
          if (selectEl && selectEl.value) {
            wrestlersToAdd.push({
              name: r.imported.name,
              weightClass: r.imported.weightClass,
              linkToExisting: selectEl.value
            });
          }
        }
        // 'skip' does nothing
      }
    });

    // Process new wrestler selections
    importResults.results.newWrestlers.forEach((r, idx) => {
      const checkbox = document.getElementById(`new_${idx}`);
      if (checkbox && checkbox.checked) {
        const nameInput = document.getElementById(`new_name_${idx}`);
        const name = nameInput ? nameInput.value.trim() : r.imported.name;
        wrestlersToAdd.push({
          name,
          weightClass: r.imported.weightClass
        });
      }
    });

    if (wrestlersToAdd.length === 0) {
      updateStatus('No wrestlers selected to import');
      document.getElementById('importModal').style.display = 'none';
      return;
    }

    // Call API to add wrestlers
    const response = await fetch(`${MATOPS_API_BASE}/api/extension/import-wrestlers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, wrestlers: wrestlersToAdd })
    });

    if (!response.ok) {
      throw new Error('Failed to add wrestlers');
    }

    const result = await response.json();
    console.log('[Mat Ops Import] Add result:', result);

    // Close modal and show success
    document.getElementById('importModal').style.display = 'none';
    updateStatus(`✅ Added ${result.added.length} wrestlers to roster`);

    if (result.errors && result.errors.length > 0) {
      console.warn('[Mat Ops Import] Errors:', result.errors);
    }

  } catch (err) {
    console.error('[Mat Ops Import] Confirm error:', err);
    showImportError(err.message || 'Failed to add wrestlers');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = '✓ Add Selected to Roster';
  }
}

// ========== MATCH IMPORT FUNCTIONS ==========

let matchImportResults = null;
let detectedEventDate = null;

// Detect event date from page
async function detectEventDate() {
  const eventDateInput = document.getElementById('eventDateInput');
  const eventDateStatus = document.getElementById('eventDateStatus');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'get_event_date'
    });

    if (response && response.success && response.eventDate) {
      detectedEventDate = response.eventDate;
      eventDateInput.value = response.eventDate;
      eventDateStatus.textContent = `✅ Date detected from page: ${response.eventDate}`;
      eventDateStatus.style.color = '#34d399';
      console.log('[Mat Ops Import] Detected event date:', response.eventDate);
    } else {
      eventDateStatus.textContent = '⚠️ Could not detect date - please enter manually';
      eventDateStatus.style.color = '#fbbf24';
    }
  } catch (error) {
    console.error('[Mat Ops Import] Error detecting date:', error);
    eventDateStatus.textContent = '⚠️ Could not detect date - please enter manually';
    eventDateStatus.style.color = '#fbbf24';
  }
}

// Open match import modal
async function openMatchImportModal() {
  if (!extractedData || extractedData.length === 0) {
    updateStatus('No data to import');
    return;
  }

  // Check if auto-capture is still in progress
  if (isAutoCapturing) {
    updateStatus('⏳ Please wait for auto-capture to complete before importing');
    return;
  }

  // Show modal with loading state
  document.getElementById('matchImportModal').style.display = 'block';
  document.getElementById('matchImportLoading').style.display = 'block';
  document.getElementById('matchImportResults').style.display = 'none';
  document.getElementById('matchImportError').style.display = 'none';

  // Reset date input
  const eventDateInput = document.getElementById('eventDateInput');
  const eventDateStatus = document.getElementById('eventDateStatus');
  if (eventDateInput) {
    eventDateInput.value = '';
    detectedEventDate = null;
  }
  if (eventDateStatus) {
    eventDateStatus.textContent = 'Detecting event date...';
    eventDateStatus.style.color = '#6b7280';
  }

  try {
    const teamId = await getTeamId();
    if (!teamId) {
      showMatchImportError('Please log in to Mat Ops first');
      return;
    }

    // Get detailed stats for match data (optional - may not be available)
    let detailedResponse = null;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        detailedResponse = await chrome.tabs.sendMessage(tab.id, {
          action: 'get_detailed_stats'
        });
      }
    } catch (e) {
      console.log('[Mat Ops Import] Could not get detailed stats, continuing without:', e.message);
    }

    // Build matches array from extracted data
    const matches = [];

    // Debug: Log what we have
    const detailedStatsMap = new Map();
    if (detailedResponse && detailedResponse.detailedStats) {
      console.log('[Mat Ops Import] Detailed stats available:', detailedResponse.detailedStats.length);
      detailedResponse.detailedStats.forEach(ds => {
        detailedStatsMap.set(ds.id, ds);
        console.log('[Mat Ops Import] Detailed stat ID:', ds.id, 'TD:', ds.takedowns, 'ESC:', ds.escapes);
      });
    } else {
      console.log('[Mat Ops Import] NO detailed stats available');
    }

    extractedData.forEach(wrestler => {
      wrestler.weightClasses.forEach(wc => {
        wc.matches.forEach(match => {
          // Find detailed stats for this match if available
          let detailedStats = null;
          if (match.matchId) {
            detailedStats = detailedStatsMap.get(match.matchId);
            if (detailedStats) {
              console.log('[Mat Ops Import] MATCHED:', match.matchId, '→ TD:', detailedStats.takedowns);
            } else {
              console.log('[Mat Ops Import] NO MATCH for matchId:', match.matchId);
            }
          } else {
            console.log('[Mat Ops Import] Match has NO matchId:', wrestler.name, 'vs', match.opponent);
          }

          // Debug: Log full match object
          console.log(`[Mat Ops Import] Match data for ${wrestler.name} vs ${match.opponent}:`, {
            score: match.score,
            wrestlerScore: match.wrestlerScore,
            opponentScore: match.opponentScore,
            winType: match.winType,
            weightClass: wc.weight
          });

          // Parse scores from score string if not already parsed
          let wrestlerScore = match.wrestlerScore;
          let opponentScore = match.opponentScore;

          // Always try to parse from score string if available (in case wrestlerScore is 0 or NaN)
          if (match.score) {
            // Try to extract score from score string like "Dec 8-4" or "Maj 12-3"
            const scoreMatch = match.score.match(/(\d+)-(\d+)/);
            if (scoreMatch) {
              const score1 = parseInt(scoreMatch[1]);
              const score2 = parseInt(scoreMatch[2]);
              if (!isNaN(score1) && !isNaN(score2)) {
                if (match.result === 'Win' || match.result === 'win') {
                  wrestlerScore = Math.max(score1, score2);
                  opponentScore = Math.min(score1, score2);
                } else {
                  wrestlerScore = Math.min(score1, score2);
                  opponentScore = Math.max(score1, score2);
                }
                console.log(`[Mat Ops Import] Parsed score from "${match.score}": ${wrestlerScore}-${opponentScore}`);
              }
            }
          }

          // If we still don't have scores, try to use calculated scores from detailed stats
          if ((!wrestlerScore || wrestlerScore === 0) && detailedStats) {
            if (detailedStats.finalScore !== undefined) {
              wrestlerScore = detailedStats.finalScore;
              opponentScore = detailedStats.finalScoreOpp || 0;
              console.log(`[Mat Ops Import] Using calculated scores from detailed stats: ${wrestlerScore}-${opponentScore}`);
            }
          }

          // Ensure we have valid numbers
          wrestlerScore = Number.isFinite(wrestlerScore) ? wrestlerScore : 0;
          opponentScore = Number.isFinite(opponentScore) ? opponentScore : 0;

          matches.push({
            wrestlerName: wrestler.name,
            opponent: match.opponent || 'Unknown',
            opponentTeam: match.opponentTeam || '',
            result: match.result || 'Win',
            winType: match.winType || 'Decision',
            score: match.score || '',
            wrestlerScore: wrestlerScore || 0,
            opponentScore: opponentScore || 0,
            weightClass: wc.weight,
            round: match.round || '',
            // Stats for wrestler
            takedowns: detailedStats?.takedowns || 0,
            escapes: detailedStats?.escapes || 0,
            reversals: detailedStats?.reversals || 0,
            nearfall2: detailedStats?.nearfall2 || 0,
            nearfall3: detailedStats?.nearfall3 || 0,
            nearfall4: detailedStats?.nearfall4 || 0,
            penalties: (detailedStats?.penalty1 || 0) + (detailedStats?.penalty2 || 0),
            // Stats against (opponent's moves)
            takedownsAgainst: detailedStats?.takedownsOpp || 0,
            escapesAgainst: detailedStats?.escapesOpp || 0,
            reversalsAgainst: detailedStats?.reversalsOpp || 0,
            nearfall2Against: detailedStats?.nearfall2Opp || 0,
            nearfall3Against: detailedStats?.nearfall3Opp || 0,
            nearfall4Against: detailedStats?.nearfall4Opp || 0,
            penaltiesAgainst: (detailedStats?.penalty1Opp || 0) + (detailedStats?.penalty2Opp || 0)
          });
        });
      });
    });

    if (matches.length === 0) {
      showMatchImportError('No matches found in extracted data');
      return;
    }

    console.log('[Mat Ops Import] Sending', matches.length, 'matches for preview');

    // Call API to check for duplicates
    const response = await fetch(`${MATOPS_API_BASE}/api/extension/import-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, matches })
    });

    if (!response.ok) {
      throw new Error('Failed to check matches');
    }

    matchImportResults = await response.json();
    console.log('[Mat Ops Import] Match results:', matchImportResults);

    renderMatchImportResults(matchImportResults);

    // Auto-detect event date from page
    await detectEventDate();

  } catch (err) {
    console.error('[Mat Ops Import] Error:', err);
    showMatchImportError(err.message || 'Failed to check matches');
  }
}

// Render match import results
function renderMatchImportResults(results) {
  document.getElementById('matchImportLoading').style.display = 'none';
  document.getElementById('matchImportResults').style.display = 'block';

  // Update summary counts
  document.getElementById('newMatchCount').textContent = results.summary.new;
  document.getElementById('duplicateMatchCount').textContent = results.summary.duplicates;
  document.getElementById('notFoundMatchCount').textContent = results.summary.wrestlerNotFound;

  // New matches section
  const newSection = document.getElementById('newMatchesSection');
  const newList = document.getElementById('newMatchesList');
  if (results.results.newMatches.length > 0) {
    newSection.style.display = 'block';
    document.getElementById('newMatchesTotal').textContent = results.results.newMatches.length;
    newList.innerHTML = results.results.newMatches.map((r, idx) => `
      <div style="padding: 6px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px;">
        <input type="checkbox" class="match-import-checkbox" id="match_${idx}" data-index="${idx}" checked>
        <label for="match_${idx}" style="flex: 1;">
          <strong>${r.wrestler?.first_name} ${r.wrestler?.last_name}</strong> vs ${r.imported.opponent}
          <span style="color: ${r.imported.result === 'Win' ? '#059669' : '#dc2626'};">(${r.imported.result})</span>
          <br><span style="color: #6b7280; font-size: 10px;">${r.imported.winType} ${r.imported.score} • ${r.imported.weightClass} lbs</span>
        </label>
      </div>
    `).join('');
  } else {
    newSection.style.display = 'none';
  }

  // Duplicate matches section
  const dupSection = document.getElementById('duplicateMatchesSection');
  const dupList = document.getElementById('duplicateMatchesList');
  if (results.results.duplicates.length > 0) {
    dupSection.style.display = 'block';
    document.getElementById('duplicateMatchesTotal').textContent = results.results.duplicates.length;
    dupList.innerHTML = results.results.duplicates.map(r => `
      <div style="padding: 4px 0; border-bottom: 1px solid #fcd34d;">
        <strong>${r.wrestler?.first_name} ${r.wrestler?.last_name}</strong> vs ${r.imported.opponent}
        <span style="color: #92400e;">(Already imported)</span>
      </div>
    `).join('');
  } else {
    dupSection.style.display = 'none';
  }

  // Wrestler not found section
  const notFoundSection = document.getElementById('notFoundMatchesSection');
  const notFoundList = document.getElementById('notFoundMatchesList');
  if (results.results.wrestlerNotFound.length > 0) {
    notFoundSection.style.display = 'block';
    document.getElementById('notFoundMatchesTotal').textContent = results.results.wrestlerNotFound.length;
    notFoundList.innerHTML = results.results.wrestlerNotFound.map(r => `
      <div style="padding: 4px 0; border-bottom: 1px solid #fca5a5;">
        <strong>${r.imported.wrestlerName}</strong> vs ${r.imported.opponent}
        <span style="color: #dc2626;">(Wrestler not in roster)</span>
      </div>
    `).join('');
  } else {
    notFoundSection.style.display = 'none';
  }
}

// Show match import error
function showMatchImportError(message) {
  document.getElementById('matchImportLoading').style.display = 'none';
  document.getElementById('matchImportResults').style.display = 'none';
  document.getElementById('matchImportError').style.display = 'block';
  document.getElementById('matchImportErrorText').textContent = message;
}

// Confirm and execute match import
async function confirmMatchImport() {
  if (!matchImportResults) return;

  const confirmBtn = document.getElementById('confirmMatchImportBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '⏳ Importing...';

  try {
    const teamId = await getTeamId();
    if (!teamId) {
      throw new Error('No team ID found');
    }

    const matchesToAdd = [];
    const matchesToUpdate = [];

    // Get the event date from input (user may have edited it)
    const eventDateInput = document.getElementById('eventDateInput');
    const eventDate = eventDateInput?.value || detectedEventDate || null;
    console.log('[Mat Ops Import] Using event date:', eventDate);

    // Helper to build match object
    const buildMatchObject = (r, existingMatchId = null) => ({
      existingMatchId, // For updates
      wrestlerId: r.wrestler.id,
      opponent: r.imported.opponent,
      opponentTeam: r.imported.opponentTeam,
      result: r.imported.result,
      winType: r.imported.winType,
      score: r.imported.score,
      wrestlerScore: r.imported.wrestlerScore,
      opponentScore: r.imported.opponentScore,
      weightClass: r.imported.weightClass,
      round: r.imported.round,
      matchDate: eventDate, // Include event date
      // Stats for wrestler
      takedowns: r.imported.takedowns,
      escapes: r.imported.escapes,
      reversals: r.imported.reversals,
      nearfall2: r.imported.nearfall2,
      nearfall3: r.imported.nearfall3,
      nearfall4: r.imported.nearfall4,
      penalties: r.imported.penalties,
      // Stats against
      takedownsAgainst: r.imported.takedownsAgainst,
      escapesAgainst: r.imported.escapesAgainst,
      reversalsAgainst: r.imported.reversalsAgainst,
      nearfall2Against: r.imported.nearfall2Against,
      nearfall3Against: r.imported.nearfall3Against,
      nearfall4Against: r.imported.nearfall4Against,
      penaltiesAgainst: r.imported.penaltiesAgainst
    });

    // Get selected NEW matches
    matchImportResults.results.newMatches.forEach((r, idx) => {
      const checkbox = document.getElementById(`match_${idx}`);
      if (checkbox && checkbox.checked && r.wrestler) {
        matchesToAdd.push(buildMatchObject(r));
      }
    });

    // Check if we should update duplicates
    const updateDuplicatesCheckbox = document.getElementById('updateDuplicates');
    if (updateDuplicatesCheckbox && updateDuplicatesCheckbox.checked) {
      matchImportResults.results.duplicates.forEach((r) => {
        if (r.wrestler && r.duplicate) {
          matchesToUpdate.push(buildMatchObject(r, r.duplicate.id));
        }
      });
    }

    if (matchesToAdd.length === 0 && matchesToUpdate.length === 0) {
      updateStatus('No matches selected to import or update');
      document.getElementById('matchImportModal').style.display = 'none';
      return;
    }

    // Call API to add/update matches
    const response = await fetch(`${MATOPS_API_BASE}/api/extension/import-matches`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, matches: matchesToAdd, updates: matchesToUpdate })
    });

    if (!response.ok) {
      throw new Error('Failed to add matches');
    }

    const result = await response.json();
    console.log('[Mat Ops Import] Match add result:', result);

    // Close modal and show success
    document.getElementById('matchImportModal').style.display = 'none';
    const addedCount = result.added?.length || 0;
    const updatedCount = result.updated?.length || 0;
    let statusMsg = `✅ Imported ${addedCount} matches`;
    if (updatedCount > 0) {
      statusMsg += `, updated ${updatedCount} matches`;
    }
    updateStatus(statusMsg);

    if (result.errors && result.errors.length > 0) {
      console.warn('[Mat Ops Import] Match errors:', result.errors);
    }

  } catch (err) {
    console.error('[Mat Ops Import] Match confirm error:', err);
    showMatchImportError(err.message || 'Failed to add matches');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = '✓ Import Selected Matches';
  }
}

console.log('[Mat Ops] Side panel loaded ✅');
