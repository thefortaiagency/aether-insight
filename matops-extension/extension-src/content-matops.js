/**
 * Mat Ops Content Script
 * Sidebar with wrestler extraction + detailed match stats capture
 */

// Global storage for detailed match data
const detailedMatches = new Map(); // matchId -> detailed stats

// ========== MATCH DETAIL PARSER ==========

function parseMatchDetail(matchModal) {
  const detail = {
    takedowns: 0,
    escapes: 0,
    reversals: 0,
    nearfall2: 0,
    nearfall3: 0,
    nearfall4: 0,
    penalty1: 0,
    penalty2: 0,
    takedownsOpp: 0,
    escapesOpp: 0,
    reversalsOpp: 0,
    nearfall2Opp: 0,
    nearfall3Opp: 0,
    nearfall4Opp: 0,
    penalty1Opp: 0,
    penalty2Opp: 0,
    pin: false,
    pinOpp: false,
    periods: []
  };

  try {
    // DEBUG: Log what we're parsing
    console.log('[Mat Ops Parser] Starting parse, modal classes:', matchModal.className);
    console.log('[Mat Ops Parser] Modal HTML length:', matchModal.innerHTML.length);

    // DEBUG: Check if modal has period data
    const hasPeriodsInText = matchModal.textContent.includes('Period 1') ||
                             matchModal.textContent.includes('Period 2') ||
                             matchModal.textContent.includes('Period 3');
    console.log('[Mat Ops Parser] Modal contains period data:', hasPeriodsInText);

    if (!hasPeriodsInText && matchModal.innerHTML.length > 5000) {
      console.warn('[Mat Ops Parser] ⚠️ Modal is large but missing period data - might be wrong modal type');
      console.log('[Mat Ops Parser] First 500 chars:', matchModal.textContent.substring(0, 500));
    }

    // Parse period-by-period details
    const periodDivs = matchModal.querySelectorAll('div');
    console.log('[Mat Ops Parser] Found', periodDivs.length, 'divs total');

    let currentPeriod = 0;
    let moveCount = 0;

    periodDivs.forEach((div, index) => {
      const text = div.textContent.trim();
      const styleAttr = div.getAttribute('style') || '';

      // Detect period headers (only "Period 1", "Period 2", etc - not "Choice" or "Score")
      if (text.startsWith('Period ') && /Period \d/.test(text) && styleAttr.includes('background-color:#dddddd')) {
        currentPeriod++;
        detail.periods.push({ period: currentPeriod, events: [] });
        console.log('[Mat Ops Parser] Found period:', text);
      }

      // Parse scoring events (green = wrestler, red = opponent)
      const isWrestlerMove = styleAttr.includes('color:#007500');
      const isOpponentMove = styleAttr.includes('color:#FF0000');

      if (isWrestlerMove || isOpponentMove) {
        const moveMatch = text.match(/(.+?)\s*\((.+?)\)/);
        if (moveMatch) {
          const moveType = moveMatch[1].trim();
          const timestamp = moveMatch[2].trim();

          moveCount++;
          console.log(`[Mat Ops Parser] Move ${moveCount}: "${moveType}" (${isWrestlerMove ? 'WRESTLER' : 'OPPONENT'})`);

          // Record move in current period
          if (detail.periods[currentPeriod - 1]) {
            detail.periods[currentPeriod - 1].events.push({
              wrestler: isWrestlerMove ? 'self' : 'opponent',
              move: moveType,
              timestamp
            });
          }

          // Count stats
          if (isWrestlerMove) {
            if (moveType.includes('Takedown')) {
              detail.takedowns++;
              console.log('[Mat Ops Parser] ✅ Wrestler takedown counted:', detail.takedowns);
            }
            else if (moveType.includes('Escape')) {
              detail.escapes++;
              console.log('[Mat Ops Parser] ✅ Wrestler escape counted:', detail.escapes);
            }
            else if (moveType.includes('Reversal')) {
              detail.reversals++;
              console.log('[Mat Ops Parser] ✅ Wrestler reversal counted:', detail.reversals);
            }
            else if (moveType.includes('Nearfall 2')) detail.nearfall2++;
            else if (moveType.includes('Nearfall 3')) detail.nearfall3++;
            else if (moveType.includes('Nearfall 4')) {
              detail.nearfall4++;
              console.log('[Mat Ops Parser] ✅ Wrestler nearfall 4 counted:', detail.nearfall4);
            }
            else if (moveType.includes('Penalty 1')) detail.penalty1++;
            else if (moveType.includes('Penalty 2')) detail.penalty2++;
            else if (moveType.includes('Fall') || moveType.includes('Pin')) detail.pin = true;
          } else {
            if (moveType.includes('Takedown')) {
              detail.takedownsOpp++;
              console.log('[Mat Ops Parser] ✅ Opponent takedown counted:', detail.takedownsOpp);
            }
            else if (moveType.includes('Escape')) {
              detail.escapesOpp++;
              console.log('[Mat Ops Parser] ✅ Opponent escape counted:', detail.escapesOpp);
            }
            else if (moveType.includes('Reversal')) {
              detail.reversalsOpp++;
              console.log('[Mat Ops Parser] ✅ Opponent reversal counted:', detail.reversalsOpp);
            }
            else if (moveType.includes('Nearfall 2')) detail.nearfall2Opp++;
            else if (moveType.includes('Nearfall 3')) detail.nearfall3Opp++;
            else if (moveType.includes('Nearfall 4')) {
              detail.nearfall4Opp++;
              console.log('[Mat Ops Parser] ✅ Opponent nearfall 4 counted:', detail.nearfall4Opp);
            }
            else if (moveType.includes('Penalty 1')) detail.penalty1Opp++;
            else if (moveType.includes('Penalty 2')) detail.penalty2Opp++;
            else if (moveType.includes('Fall') || moveType.includes('Pin')) detail.pinOpp = true;
          }
        }
      }
    });

    console.log('[Mat Ops Parser] ✅ FINAL STATS:', {
      takedowns: detail.takedowns,
      escapes: detail.escapes,
      reversals: detail.reversals,
      takedownsOpp: detail.takedownsOpp,
      escapesOpp: detail.escapesOpp,
      reversalsOpp: detail.reversalsOpp,
      nearfall4: detail.nearfall4,
      nearfall4Opp: detail.nearfall4Opp,
      periods: detail.periods.length,
      totalMoves: moveCount
    });

    return detail;
  } catch (error) {
    console.error('[Mat Ops] Error parsing match detail:', error);
    return detail;
  }
}

// ========== WRESTLER PARSER FUNCTIONS ==========

function parseWrestlerHeader(wrestlerDiv) {
  const wrestler = {
    name: '',
    team: '',
    state: '',
    athleteId: '',
    weightClasses: []
  };

  try {
    const header = wrestlerDiv.querySelector('.p-2.bg-gray-200.border-b.border-usa-blue a');
    if (header) {
      wrestler.name = header.textContent.trim();
      wrestler.athleteId = header.href.split('/').pop();

      const headerText = header.parentElement.textContent;
      const teamMatch = headerText.match(/\((.*?),\s*(\w+)\)/);
      if (teamMatch) {
        wrestler.team = teamMatch[1].trim();
        wrestler.state = teamMatch[2].trim();
      }
    }

    return wrestler;
  } catch (error) {
    console.error('[Mat Ops] Error parsing wrestler header:', error);
    return wrestler;
  }
}

function parseMatchLine(text, li) {
  try {
    const match = {
      mat: '',
      bout: '',
      round: '',
      opponent: '',
      opponentTeam: '',
      result: '',
      winType: '',
      score: '',
      wrestlerScore: 0,
      opponentScore: 0,
      matchId: '',
      videoUrl: '',
    };

    const matMatch = text.match(/Mat\s+(\d+)\s+-/);
    if (matMatch) match.mat = `Mat ${matMatch[1]}`;

    const boutMatch = text.match(/Bout\s+(\d+)/);
    if (boutMatch) match.bout = boutMatch[1];

    const roundMatch = text.match(/Bout\s+\d+\s+-\s+(.+?):/);
    if (roundMatch) match.round = roundMatch[1].trim();

    const athleteLinks = li.querySelectorAll('a[href*="/athletes/"]');
    if (athleteLinks.length >= 2) {
      const opponentLink = athleteLinks[athleteLinks.length - 1];
      match.opponent = opponentLink.textContent.trim();

      const opponentSpan = opponentLink.closest('span');
      if (opponentSpan) {
        const teamMatch = opponentSpan.parentElement.textContent.match(/,\s+([A-Z]+)\s/);
        if (teamMatch) match.opponentTeam = teamMatch[1];
      }
    }

    if (text.includes(' over ')) match.result = 'Win';
    else if (text.includes(' lost to ')) match.result = 'Loss';

    const scoreLink = li.querySelector('a[href*="fetchScoreSummary"]');
    if (scoreLink) {
      const scoreText = scoreLink.textContent.trim();
      match.matchId = scoreLink.getAttribute('href').match(/'(.+?)'/)?.[1] || '';

      if (scoreText === 'Bye') {
        match.winType = 'Forfeit';
      } else {
        if (scoreText.startsWith('Dec')) match.winType = 'Decision';
        else if (scoreText.startsWith('MD')) match.winType = 'Major Decision';
        else if (scoreText.startsWith('TF')) match.winType = 'Tech Fall';
        else if (scoreText.startsWith('F ')) match.winType = 'Pin';
        else if (scoreText.startsWith('Forf')) match.winType = 'Forfeit';

        const scoreMatch = scoreText.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
          if (match.result === 'Win') {
            match.wrestlerScore = parseInt(scoreMatch[1]);
            match.opponentScore = parseInt(scoreMatch[2]);
          } else {
            match.wrestlerScore = parseInt(scoreMatch[2]);
            match.opponentScore = parseInt(scoreMatch[1]);
          }
        }

        match.score = scoreText;
      }
    }

    const videoLink = li.querySelector('a[href*="youtube.com"], a[href*="classofx.com"]');
    if (videoLink) match.videoUrl = videoLink.href;

    return match;
  } catch (error) {
    console.error('[Mat Ops] Error parsing match line:', error);
    return null;
  }
}

function parseWeightClass(weightDiv) {
  const weightClass = {
    division: '',
    weight: 0,
    placement: '',
    matches: []
  };

  try {
    const weightHeader = weightDiv.querySelector('.text-usa-blue.underline.cursor-pointer, span[wire\\:click*="toggleMatches"]');
    if (weightHeader) {
      const headerText = weightHeader.textContent.trim();
      const parts = headerText.split('-').map(p => p.trim());

      if (parts.length >= 2) {
        weightClass.division = parts[0];
        weightClass.weight = parseInt(parts[1]);
        if (parts.length >= 3) {
          weightClass.placement = parts[2].replace(/[()]/g, '').trim();
        }
      }
    }

    // Find the specific match list <ul class="divide-y divide-gray-200">
    const matchList = weightDiv.querySelector('ul.divide-y.divide-gray-200, ul.divide-y');
    if (!matchList) {
      console.log('[Mat Ops] No match list found in weight class');
      return weightClass;
    }

    // Get only <li class="p-2"> elements (skip headers like "Completed")
    const matchItems = matchList.querySelectorAll('li.p-2');
    console.log(`[Mat Ops] Found ${matchItems.length} match items`);

    matchItems.forEach(li => {
      const text = li.textContent.trim();

      // Additional safety check
      if (!text.includes('Bout') && !text.includes('over') && !text.includes('lost to')) {
        return;
      }

      const match = parseMatchLine(text, li);
      if (match && (match.bout || match.opponent)) {
        weightClass.matches.push(match);
      }
    });

    return weightClass;
  } catch (error) {
    console.error('[Mat Ops] Error parsing weight class:', error);
    return weightClass;
  }
}

function extractWrestlers() {
  // Find all wrestler containers - they have wire:id and class="mb-2"
  const wrestlerDivs = document.querySelectorAll('div[wire\\:id].mb-2, div[wire\\:id][class*="mb-2"]');
  console.log(`[Mat Ops] Found ${wrestlerDivs.length} wrestler containers`);

  const wrestlers = [];

  wrestlerDivs.forEach(div => {
    const wrestler = parseWrestlerHeader(div);
    if (!wrestler.name) return;

    // Find weight class sections - more flexible selector
    const weightDivs = div.querySelectorAll('.bg-gray-50.p-4.rounded-lg, .bg-gray-50.p-4');
    console.log(`[Mat Ops] Found ${weightDivs.length} weight classes for ${wrestler.name}`);

    weightDivs.forEach(weightDiv => {
      const weightClass = parseWeightClass(weightDiv);
      if (weightClass.weight > 0) {
        console.log(`[Mat Ops] ${wrestler.name} - ${weightClass.weight} lbs - ${weightClass.matches.length} matches`);
        wrestler.weightClasses.push(weightClass);
      }
    });

    wrestlers.push(wrestler);
  });

  console.log(`[Mat Ops] Total extracted: ${wrestlers.length} wrestlers`);
  return wrestlers;
}

// ========== SIDEBAR CLASS ==========

class MatOpsSidebar {
  constructor() {
    this.isOpen = false; // Start collapsed - user clicks tab to open!
    this.extractedData = null;
    this.panel = null;
    this.init();
  }

  init() {
    // Works on both USABracketing AND Aether platforms!
    const isUSABracketing = window.location.hostname.includes('usabracketing.com');
    const isAether = window.location.hostname.includes('aethervtc.ai') ||
                     window.location.hostname.includes('wrestleai.com') ||
                     window.location.hostname.includes('localhost');

    if (!isUSABracketing && !isAether) {
      return; // Only load on wrestling-related sites
    }

    this.createPanel();

    // Auto-expand all weight classes and extract on page load
    setTimeout(() => {
      this.expandAllWeightClasses();
    }, 3000); // Increased from 2000ms to 3000ms - give Livewire more time to initialize

    this.observePageChanges();
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'matops-sidebar';
    panel.className = 'matops-sidebar';
    panel.innerHTML = `
      <div class="matops-sidebar-header">
        <div class="matops-header-content">
          <div class="matops-logo">
            <img src="${chrome.runtime.getURL('icons/aether-48.png')}" alt="Aether" style="width: 32px; height: 32px; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));">
            <span class="matops-title">Mat Ops</span>
          </div>
          <div class="matops-header-actions">
            <button class="matops-btn-icon" id="matops-refresh" title="Refresh">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
              </svg>
            </button>
            <button class="matops-btn-icon" id="matops-toggle" title="Toggle sidebar">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="matops-sidebar-content">
        <div class="matops-section">
          <div class="matops-section-title">Stats Summary</div>
          <div class="matops-stats-grid">
            <div class="matops-stat-card">
              <div class="matops-stat-value" id="matops-wrestler-count">-</div>
              <div class="matops-stat-label">Wrestlers</div>
            </div>
            <div class="matops-stat-card">
              <div class="matops-stat-value" id="matops-match-count">-</div>
              <div class="matops-stat-label">Matches</div>
            </div>
            <div class="matops-stat-card">
              <div class="matops-stat-value" id="matops-win-count">-</div>
              <div class="matops-stat-label">Wins</div>
            </div>
            <div class="matops-stat-card">
              <div class="matops-stat-value" id="matops-loss-count">-</div>
              <div class="matops-stat-label">Losses</div>
            </div>
          </div>
        </div>

        <div class="matops-section">
          <div class="matops-section-title">Wrestlers</div>
          <div id="matops-wrestlers-list" class="matops-wrestlers-list">
            <div class="matops-empty-state">
              <span class="matops-empty-icon">📊</span>
              <p>Extracting stats...</p>
            </div>
          </div>
        </div>

        <div class="matops-section">
          <div class="matops-section-title">Detailed Stats Capture</div>
          <div style="padding: 8px; font-size: 12px; color: #64748b; line-height: 1.5;">
            <strong>How to capture:</strong><br>
            1. Click any match score (e.g., "Dec 9-6")<br>
            2. Extension auto-captures when modal opens<br>
            3. Close modal and click next match<br>
            4. Progress shows below
          </div>
        </div>

        <div class="matops-section">
          <div class="matops-section-title">🤖 Ask AI About Stats</div>
          <div id="matops-ai-messages" style="max-height: 200px; overflow-y: auto; margin-bottom: 8px; padding: 8px; background: #f8fafc; border-radius: 6px; font-size: 12px;">
            <div style="color: #94a3b8; text-align: center; padding: 20px;">
              Ask questions about the wrestling stats.<br>
              Example: "What's Braxtyn's takedown percentage?"
            </div>
          </div>

          <!-- Suggested Questions (Quick Actions) -->
          <div id="matops-suggested-questions" style="display: none; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px;">
            <strong style="font-size: 11px; color: rgba(255,255,255,0.8); width: 100%; margin-bottom: 4px;">Quick Questions:</strong>
            <button class="matops-prompt-btn" data-prompt="Give me a summary of all wrestlers and their records">📊 Team Summary</button>
            <button class="matops-prompt-btn" data-prompt="Who has the most takedowns?">🥇 Top Takedowns</button>
            <button class="matops-prompt-btn" data-prompt="Which wrestlers need to work on escapes?">⚠️ Needs Work</button>
            <button class="matops-prompt-btn" data-prompt="What's our team's win percentage breakdown?">📈 Win % Breakdown</button>
          </div>

          <div style="display: flex; gap: 8px;">
            <input
              type="text"
              id="matops-ai-input"
              placeholder="Ask about stats..."
              style="flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;"
            />
            <button class="matops-btn matops-btn-primary" id="matops-ask-ai" style="padding: 8px 16px;">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
              </svg>
              Ask
            </button>
          </div>
        </div>

        <div class="matops-section matops-actions">
          <button class="matops-btn matops-btn-primary" id="matops-expand-all">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8zM7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10z"/>
            </svg>
            Expand All & Extract
          </button>
          <button class="matops-btn matops-btn-secondary" id="matops-extract">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
              <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
            </svg>
            Refresh Stats
          </button>
          <button class="matops-btn matops-btn-secondary" id="matops-export" disabled>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Export JSON
          </button>
        </div>

        <div id="matops-status" class="matops-status"></div>
      </div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;

    // Start collapsed - add the collapsed class
    if (!this.isOpen) {
      this.panel.classList.add('matops-sidebar-collapsed');
    }

    this.createToggleTab();
    this.attachEventListeners();
  }

  createToggleTab() {
    // Create a clickable tab that shows when sidebar is collapsed
    const tab = document.createElement('div');
    tab.id = 'matops-toggle-tab';
    tab.className = 'matops-toggle-tab';

    // Use Aether logo for toggle tab
    const logo = document.createElement('img');
    logo.src = chrome.runtime.getURL('icons/aether-48.png');
    logo.alt = 'Mat Ops';
    logo.style.cssText = 'width: 28px; height: 28px; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));';
    tab.appendChild(logo);

    // Visible by default (sidebar starts collapsed) - user clicks to open!
    tab.style.display = this.isOpen ? 'none' : 'flex';

    // Add click handler
    tab.addEventListener('click', () => {
      this.toggleSidebar();
    });

    document.body.appendChild(tab);
  }

  attachEventListeners() {
    document.getElementById('matops-toggle').addEventListener('click', () => {
      this.toggleSidebar();
    });

    document.getElementById('matops-refresh').addEventListener('click', () => {
      this.extractStats();
    });

    document.getElementById('matops-expand-all').addEventListener('click', () => {
      this.expandAllWeightClasses();
    });

    document.getElementById('matops-extract').addEventListener('click', () => {
      this.extractStats();
    });

    document.getElementById('matops-export').addEventListener('click', () => {
      this.exportData();
    });

    // AI Chat listeners
    document.getElementById('matops-ask-ai').addEventListener('click', () => {
      this.askAI();
    });

    document.getElementById('matops-ai-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.askAI();
      }
    });

    // Suggested question buttons
    this.attachPromptButtonListeners();
  }

  attachPromptButtonListeners() {
    const promptButtons = document.querySelectorAll('.matops-prompt-btn');
    promptButtons.forEach(button => {
      button.addEventListener('click', () => {
        const prompt = button.getAttribute('data-prompt');
        if (prompt) {
          const input = document.getElementById('matops-ai-input');
          input.value = prompt;
          this.askAI();
        }
      });
    });
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('matops-sidebar-collapsed', !this.isOpen);

    const icon = document.querySelector('#matops-toggle svg');
    const tab = document.getElementById('matops-toggle-tab');

    if (this.isOpen) {
      // Show collapse icon (arrow right)
      icon.innerHTML = '<path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>';
      // Hide tab
      if (tab) tab.style.display = 'none';
    } else {
      // Show expand icon (arrow left)
      icon.innerHTML = '<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>';
      // Show tab
      if (tab) tab.style.display = 'flex';
    }
  }

  extractStats() {
    this.showStatus('Extracting stats...', 'loading');

    setTimeout(() => {
      try {
        this.extractedData = extractWrestlers();

        if (this.extractedData.length === 0) {
          this.showStatus('No wrestlers found. Make sure you\'re on "My Wrestlers" page.', 'error');
          return;
        }

        // Check if we got any matches
        const totalMatches = this.extractedData.reduce((sum, w) =>
          sum + w.weightClasses.reduce((s, wc) => s + wc.matches.length, 0), 0);

        if (totalMatches === 0) {
          // No matches found - offer to expand weight classes
          this.showStatus('No matches found. Click "Expand All" to load matches.', 'error');
        } else {
          this.showStatus(`✅ Extracted ${this.extractedData.length} wrestlers, ${totalMatches} matches. Click match scores to capture details.`, 'success');

          // CRITICAL: Re-attach click listeners after matches load
          console.log('[Mat Ops] Re-attaching click listeners to newly loaded matches...');
          this.attachMatchScoreListeners();

          // Show suggested questions now that we have data!
          const suggestedQuestions = document.getElementById('matops-suggested-questions');
          if (suggestedQuestions) {
            suggestedQuestions.style.display = 'flex';
          }
        }

        this.updateUI();
        document.getElementById('matops-export').disabled = false;

        console.log('[Mat Ops] Extracted data:', this.extractedData);
      } catch (error) {
        console.error('[Mat Ops] Extraction error:', error);
        this.showStatus('Error extracting stats. Check console.', 'error');
      }
    }, 100);
  }

  async captureAllMatchDetails() {
    // Find all match score links
    const scoreLinks = Array.from(document.querySelectorAll('a[href*="fetchScoreSummary"]'));
    const totalLinks = scoreLinks.length;

    if (totalLinks === 0) {
      this.showStatus('No matches found to capture', 'error');
      return;
    }

    console.log(`[Mat Ops] 🚀 Starting automatic capture of ${totalLinks} matches...`);
    this.showStatus(`🚀 Capturing all details: 0/${totalLinks}...`, 'loading');

    // Disable buttons during capture
    const captureBtn = document.getElementById('matops-capture-all');
    const expandBtn = document.getElementById('matops-expand-all');
    const extractBtn = document.getElementById('matops-extract');

    captureBtn.disabled = true;
    expandBtn.disabled = true;
    extractBtn.disabled = true;
    captureBtn.textContent = 'Capturing...';

    let captured = 0;
    let failed = 0;

    for (let i = 0; i < scoreLinks.length; i++) {
      const link = scoreLinks[i];

      try {
        // Extract match ID from link
        const href = link.getAttribute('href');
        const matchIdMatch = href.match(/fetchScoreSummary\('([^']+)'\)/);

        if (!matchIdMatch) {
          console.log(`[Mat Ops] ⚠️ Skipping link ${i+1}: No match ID found`);
          failed++;
          continue;
        }

        const matchId = matchIdMatch[1];

        // Check if already captured
        if (detailedMatches.has(matchId)) {
          console.log(`[Mat Ops] ⏭️ Match ${i+1}/${totalLinks}: Already captured ${matchId}`);
          captured++;
          this.showStatus(`🚀 Capturing: ${captured}/${totalLinks} (${failed} skipped)`, 'loading');
          continue;
        }

        // Open modal by calling fetchScoreSummary in page context
        console.log(`[Mat Ops] 🎯 Opening modal for match ${i+1}/${totalLinks}: ${matchId}`);

        // Store match ID globally so captureMatchDetail can use it
        window.matopsActiveMatchId = matchId;

        // Inject script to call fetchScoreSummary in page context (not isolated world)
        const script = document.createElement('script');
        script.textContent = `fetchScoreSummary('${matchId}');`;
        document.head.appendChild(script);
        document.head.removeChild(script);

        // Wait for modal to load
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Use the SAME capture method as manual clicks (has retry logic)
        this.captureMatchDetail(matchId);

        // Check if it was captured successfully
        if (detailedMatches.has(matchId)) {
          captured++;
          console.log(`[Mat Ops] ✅ Captured match ${i+1}/${totalLinks}`);
        } else {
          failed++;
          console.log(`[Mat Ops] ⚠️ Match ${i+1}/${totalLinks}: Failed to capture`);
        }

        // Close modal (ESC key)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
        await new Promise(resolve => setTimeout(resolve, 300));

        // Update progress
        this.showStatus(`🚀 Capturing: ${captured}/${totalLinks} (${failed} failed)`, 'loading');

      } catch (error) {
        console.error(`[Mat Ops] Error capturing match ${i+1}:`, error);
        failed++;
      }
    }

    // Re-enable buttons
    captureBtn.disabled = false;
    expandBtn.disabled = false;
    extractBtn.disabled = false;
    captureBtn.innerHTML = `
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
      </svg>
      Capture All Details
    `;

    // Final status
    console.log(`[Mat Ops] 🎉 Capture complete! Captured: ${captured}, Failed: ${failed}`);
    this.showStatus(
      `🎉 Captured ${captured}/${totalLinks} matches (${failed} failed)`,
      captured > 0 ? 'success' : 'error'
    );
  }

  async expandAllWeightClasses() {
    this.showStatus('Expanding all weight classes...', 'loading');

    // Find all weight class headers with wire:click toggle
    const weightHeaders = document.querySelectorAll('span[wire\\:click*="toggleMatches"]');
    console.log(`[Mat Ops] Found ${weightHeaders.length} weight class headers to expand`);

    if (weightHeaders.length === 0) {
      this.showStatus('No weight classes found to expand', 'error');
      return;
    }

    // Click headers SEQUENTIALLY to give Livewire time to process each one
    console.log(`[Mat Ops] Clicking headers sequentially (this will take ~${weightHeaders.length * 0.3}s)...`);

    for (let i = 0; i < weightHeaders.length; i++) {
      const header = weightHeaders[i];

      try {
        // Dispatch a proper click event (not just .click())
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        header.dispatchEvent(clickEvent);

        console.log(`[Mat Ops] Clicked header ${i + 1}/${weightHeaders.length}`);

        // Wait 300ms between clicks to give Livewire time to respond
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`[Mat Ops] Error clicking header ${i + 1}:`, error);
      }
    }

    console.log(`[Mat Ops] ✅ Finished clicking all ${weightHeaders.length} headers`);

    // Wait for final Livewire requests to complete, then extract
    this.showStatus('Loading matches...', 'loading');

    setTimeout(() => {
      console.log('[Mat Ops] Starting extraction after Livewire loads...');
      this.extractStats();
    }, 2000); // Wait 2 more seconds after all clicks
  }

  updateUI() {
    if (!this.extractedData) return;

    const wrestlerCount = this.extractedData.length;
    let matchCount = 0;
    let winCount = 0;
    let lossCount = 0;

    this.extractedData.forEach(wrestler => {
      wrestler.weightClasses.forEach(wc => {
        matchCount += wc.matches.length;
        winCount += wc.matches.filter(m => m.result === 'Win').length;
        lossCount += wc.matches.filter(m => m.result === 'Loss').length;
      });
    });

    document.getElementById('matops-wrestler-count').textContent = wrestlerCount;
    document.getElementById('matops-match-count').textContent = matchCount;
    document.getElementById('matops-win-count').textContent = winCount;
    document.getElementById('matops-loss-count').textContent = lossCount;

    const listEl = document.getElementById('matops-wrestlers-list');
    listEl.innerHTML = this.extractedData.map(wrestler => this.renderWrestler(wrestler)).join('');
  }

  renderWrestler(wrestler) {
    const totalMatches = wrestler.weightClasses.reduce((sum, wc) => sum + wc.matches.length, 0);
    const totalWins = wrestler.weightClasses.reduce((sum, wc) =>
      sum + wc.matches.filter(m => m.result === 'Win').length, 0
    );
    const totalLosses = totalMatches - totalWins;

    return `
      <div class="matops-wrestler-card">
        <div class="matops-wrestler-header">
          <div class="matops-wrestler-name">${wrestler.name}</div>
          <div class="matops-wrestler-team">${wrestler.team}</div>
        </div>
        <div class="matops-wrestler-stats">
          <span class="matops-record">
            <span class="matops-wins">${totalWins}W</span>
            <span class="matops-losses">${totalLosses}L</span>
          </span>
          <span class="matops-matches">${totalMatches} matches</span>
        </div>
        ${wrestler.weightClasses.map(wc => `
          <div class="matops-weight-class">
            <span class="matops-weight">${wc.weight} lbs</span>
            <span class="matops-placement">${wc.placement || 'N/A'}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  showStatus(message, type = 'info') {
    const statusEl = document.getElementById('matops-status');
    statusEl.textContent = message;
    statusEl.className = `matops-status matops-status-${type}`;

    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'matops-status';
      }, 3000);
    }
  }

  exportData() {
    if (!this.extractedData) return;

    console.log('[Mat Ops Export] Starting export...');
    console.log('[Mat Ops Export] detailedMatches Map size:', detailedMatches.size);
    console.log('[Mat Ops Export] detailedMatches keys:', Array.from(detailedMatches.keys()));

    // Merge detailed match stats into export data
    const exportData = JSON.parse(JSON.stringify(this.extractedData));
    let detailedCount = 0;
    let totalMatches = 0;

    exportData.forEach(wrestler => {
      wrestler.weightClasses.forEach(wc => {
        wc.matches.forEach(match => {
          totalMatches++;
          console.log(`[Mat Ops Export] Checking match ${match.matchId}:`, detailedMatches.has(match.matchId));

          if (match.matchId && detailedMatches.has(match.matchId)) {
            const detail = detailedMatches.get(match.matchId);
            console.log('[Mat Ops Export] Merging detail:', detail);
            Object.assign(match, detail);
            detailedCount++;
          }
        });
      });
    });

    console.log(`[Mat Ops Export] Merged ${detailedCount}/${totalMatches} matches with detailed stats`);

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matops-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showStatus(
      `✅ Exported ${exportData.length} wrestlers (${detailedCount}/${totalMatches} matches with detailed stats)`,
      'success'
    );
  }

  async askAI() {
    const input = document.getElementById('matops-ai-input');
    const messagesDiv = document.getElementById('matops-ai-messages');
    const question = input.value.trim();

    if (!question) return;

    console.log('[Mat Ops] Asking AI:', question);

    // Clear input
    input.value = '';

    // Add user message to chat
    this.addAIMessage('user', question);

    // Show thinking indicator
    const thinkingId = 'thinking-' + Date.now();
    this.addAIMessage('assistant', '🤔 Thinking...', thinkingId);

    try {
      // Create stats context from extracted data
      const statsContext = this.createStatsContext();

      // Send to background script
      const response = await chrome.runtime.sendMessage({
        action: 'ask_ai',
        question: question,
        statsContext: statsContext
      });

      // Remove thinking indicator
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) thinkingEl.remove();

      if (response.success) {
        // Pass metadata (including token usage) to display token counter
        this.addAIMessage('assistant', response.response, null, response.metadata);
      } else {
        this.addAIMessage('assistant', `❌ Error: ${response.error}`);
      }
    } catch (error) {
      console.error('[Mat Ops] AI error:', error);
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) thinkingEl.remove();
      this.addAIMessage('assistant', `❌ Error: ${error.message}`);
    }

    // Auto-scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  addAIMessage(role, content, id = null, metadata = null) {
    const messagesDiv = document.getElementById('matops-ai-messages');

    // Clear placeholder if exists
    const placeholder = messagesDiv.querySelector('[style*="text-align: center"]');
    if (placeholder) placeholder.remove();

    const messageDiv = document.createElement('div');
    if (id) messageDiv.id = id;
    messageDiv.className = `matops-message matops-message-${role}`;

    // Convert markdown to professional HTML formatting (like aiimpact-health!)
    let formattedContent = content
      // Remove excessive blank lines (2+ consecutive newlines → 1)
      .replace(/\n{2,}/g, '\n')
      // Section headers (## Header) - large wrestling-themed headers
      .replace(/^##\s+(.+)$/gm, '<span class="matops-section-header">$1</span>')
      // Subsection headers (### Header) - medium headers
      .replace(/^###\s+(.+)$/gm, '<span class="matops-subsection-header">$1</span>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Highlight stats: [HIGH], [LOW], [GOOD], [WEAK]
      .replace(/\[HIGH\]/gi, '<span class="matops-value-high">[HIGH]</span>')
      .replace(/\[LOW\]/gi, '<span class="matops-value-low">[LOW]</span>')
      .replace(/\[GOOD\]/gi, '<span class="matops-value-good">[GOOD]</span>')
      .replace(/\[WEAK\]/gi, '<span class="matops-value-weak">[WEAK]</span>')
      .replace(/\[STRONG\]/gi, '<span class="matops-value-strong">[STRONG]</span>')
      // Wrestling-specific highlights
      .replace(/\[PIN\]/gi, '<span class="matops-value-pin">🏆 PIN</span>')
      .replace(/\[WIN\]/gi, '<span class="matops-value-win">✅ WIN</span>')
      .replace(/\[LOSS\]/gi, '<span class="matops-value-loss">❌ LOSS</span>')
      // Bullet points with indentation
      .replace(/^[•\-\*]\s+(.+)$/gm, '<span style="display:block; margin-left: 12px;">• $1</span>')
      // Line breaks
      .replace(/\n/g, '<br>');

    messageDiv.innerHTML = formattedContent;

    // Add token counter if metadata provided (for AI responses)
    if (metadata && metadata.usage) {
      const tokenInfo = document.createElement('div');
      tokenInfo.className = 'matops-token-counter';
      tokenInfo.innerHTML = `
        <span class="matops-token-label">Tokens:</span>
        <span class="matops-token-stat">In: ${metadata.usage.input_tokens.toLocaleString()}</span>
        <span class="matops-token-stat">Out: ${metadata.usage.output_tokens.toLocaleString()}</span>
        <span class="matops-token-stat">Total: ${(metadata.usage.input_tokens + metadata.usage.output_tokens).toLocaleString()}</span>
      `;
      messageDiv.appendChild(tokenInfo);
    }

    messagesDiv.appendChild(messageDiv);
  }

  createStatsContext() {
    if (!this.extractedData) {
      return { wrestlers: [], summary: { totalWrestlers: 0, totalMatches: 0, totalWins: 0, totalLosses: 0 } };
    }

    // Create condensed stats context for AI
    const wrestlers = this.extractedData.map(w => {
      const matches = [];
      let wins = 0;
      let losses = 0;

      w.weightClasses.forEach(wc => {
        wc.matches.forEach(match => {
          matches.push({
            opponent: match.opponent,
            result: match.result,
            winType: match.winType,
            score: match.score,
            ...detailedMatches.has(match.matchId) ? detailedMatches.get(match.matchId) : {}
          });

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
      totalWrestlers: this.extractedData.length,
      totalMatches: wrestlers.reduce((sum, w) => sum + w.matchCount, 0),
      totalWins: wrestlers.reduce((sum, w) => sum + w.wins, 0),
      totalLosses: wrestlers.reduce((sum, w) => sum + w.losses, 0)
    };

    return { wrestlers, summary };
  }

  observePageChanges() {
    // Watch for wrestler list updates
    const pageObserver = new MutationObserver((mutations) => {
      const hasNewData = mutations.some(mutation =>
        mutation.addedNodes.length > 0 &&
        Array.from(mutation.addedNodes).some(node =>
          node.nodeType === 1 && node.querySelector &&
          node.querySelector('div[wire\\:id]')
        )
      );

      if (hasNewData) {
        console.log('[Mat Ops] Page updated, auto-extracting...');
        this.extractStats();
        // Re-attach click listeners to new match score links
        this.attachMatchScoreListeners();
      }
    });

    pageObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Attach click listeners to match score links
    this.attachMatchScoreListeners();

    // NOTE: MutationObserver DISABLED - was conflicting with click listeners
    // The observer was finding the wrong matchId from page HTML
    // Click listeners handle all captures now
  }

  attachMatchScoreListeners() {
    // Find all match score links
    const scoreLinks = document.querySelectorAll('a[href*="fetchScoreSummary"]');
    console.log(`[Mat Ops] Found ${scoreLinks.length} match score links`);

    scoreLinks.forEach(link => {
      // Skip if already has listener
      if (link.hasAttribute('data-matops-listener')) return;

      link.setAttribute('data-matops-listener', 'true');

      link.addEventListener('click', (e) => {
        // Extract match ID from href: javascript:fetchScoreSummary('match-id-here')
        const href = link.getAttribute('href');
        const matchIdMatch = href.match(/fetchScoreSummary\('([^']+)'\)/);

        if (matchIdMatch) {
          const matchId = matchIdMatch[1];
          console.log(`[Mat Ops] 🎯 Match score clicked: ${matchId}`);

          // Store the active match ID
          window.matopsActiveMatchId = matchId;

          // Wait for modal to appear/update, then capture
          setTimeout(() => {
            this.captureMatchDetail(matchId);
          }, 800);
        }
      });
    });
  }

  captureMatchDetail(matchId, retryCount = 0) {
    try {
      console.log(`[Mat Ops] 🔍 Attempting to capture ${matchId} (retry ${retryCount}/3)`);

      // Find the modal - it might be anywhere in the body
      const modals = document.querySelectorAll('.mx-auto.max-w-md.rounded.shadow-md, div[class*="modal"]');
      console.log(`[Mat Ops] Found ${modals.length} potential modals`);

      if (modals.length === 0) {
        if (retryCount < 3) {
          console.log('[Mat Ops] ⚠️ No modal found yet, retrying...');
          setTimeout(() => this.captureMatchDetail(matchId, retryCount + 1), 500);
        } else {
          console.error('[Mat Ops] ❌ No modal found after 3 retries');
        }
        return;
      }

      // Use the last modal (most recently updated)
      const modal = modals[modals.length - 1];

      // Check if modal has content (not empty)
      if (!modal.textContent || modal.textContent.trim().length < 50) {
        if (retryCount < 3) {
          console.log('[Mat Ops] ⚠️ Modal empty, retrying...');
          setTimeout(() => this.captureMatchDetail(matchId, retryCount + 1), 500);
        } else {
          console.error('[Mat Ops] ❌ Modal still empty after 3 retries');
        }
        return;
      }

      // Check if this is the RIGHT modal (has period data, not wrestler profile)
      const hasPeriodData = modal.textContent.includes('Period 1') ||
                            modal.textContent.includes('Period 2') ||
                            modal.textContent.includes('Period 3');
      console.log(`[Mat Ops] Modal has period data: ${hasPeriodData}`);

      if (!hasPeriodData) {
        if (retryCount < 3) {
          console.warn('[Mat Ops] ⚠️ Modal is open but missing period data, retrying...');
          setTimeout(() => this.captureMatchDetail(matchId, retryCount + 1), 500);
        } else {
          console.error('[Mat Ops] ❌ Modal never showed period data - might be wrong modal type');
        }
        return;
      }

      const detail = parseMatchDetail(modal);

      console.log(`[Mat Ops] 💾 About to store match ${matchId} in detailedMatches Map`);
      console.log(`[Mat Ops] 💾 Map size before: ${detailedMatches.size}`);
      detailedMatches.set(matchId, detail);
      console.log(`[Mat Ops] 💾 Map size after: ${detailedMatches.size}`);
      console.log(`[Mat Ops] 💾 Map now contains:`, Array.from(detailedMatches.keys()));

      const totalStats = detail.takedowns + detail.escapes + detail.reversals +
                         detail.nearfall2 + detail.nearfall3 + detail.nearfall4;

      console.log(`[Mat Ops] 📊 ✅ SUCCESS! Captured match detail for ${matchId}:`, {
        takedowns: detail.takedowns,
        escapes: detail.escapes,
        reversals: detail.reversals,
        nearfalls: detail.nearfall2 + detail.nearfall3 + detail.nearfall4,
        periods: detail.periods.length,
        totalStats
      });

      // Update sidebar status
      this.showStatus(
        `📊 Captured detailed stats (${detailedMatches.size} matches)`,
        'success'
      );
    } catch (error) {
      console.error('[Mat Ops] Error capturing match detail:', error);
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MatOpsSidebar();
  });
} else {
  new MatOpsSidebar();
}

console.log('[Mat Ops] Sidebar loaded ✅');
