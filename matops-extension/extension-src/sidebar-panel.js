// Mat Ops Side Panel Script
// Handles UI and communication with content scripts

let extractedData = null;
let conversationHistory = [];
let currentMode = 'usa-bracketing'; // Default mode
let targetTabId = null; // Store the tab we're working with

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
        'mat-ops-ai': 'Mat Ops AI Coach Mode (Coming Soon)'
      };

      updateStatus(`Ready • ${modeLabels[mode]}`);

      // Future: Show/hide mode-specific UI sections
      // handleModeChange(mode);

      console.log(`[Mat Ops] Switched to ${mode} mode`);
    });
  });
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

// Auto-capture all matches
async function autoCaptureAllMatches() {
  if (!extractedData) {
    updateStatus('❌ Please extract stats first');
    return;
  }

  updateStatus('🤖 Starting auto-capture...');
  autoCaptureButton.disabled = true;
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
            statusText = `Clicking match ${current}/${total}...`;
            break;
          case 'capturing':
            statusEmoji = '📊';
            statusText = `Capturing data from match ${current}/${total}...`;
            break;
          case 'closing':
            statusEmoji = '🚪';
            statusText = `Closing modal for match ${current}/${total}...`;
            break;
          case 'ready':
            statusEmoji = '✅';
            statusText = `Match ${current}/${total} complete`;
            break;
          default:
            statusText = `Processing ${current}/${total}`;
        }

        progressText.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 4px;">${statusEmoji} ${statusText}</div>
          <div style="font-size: 10px; color: #6b7280;">Captured: ${captured} | Skipped: ${skipped}</div>
        `;

        // Update progress bar
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;

        // Update status bar too
        updateStatus(`🤖 Auto-capturing: ${current}/${total} (${captured} captured)`);
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
    autoCaptureButton.disabled = false;
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
    console.error('[Mat Ops Panel] updateCapturedCount error:', error);
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

console.log('[Mat Ops] Side panel loaded ✅');
