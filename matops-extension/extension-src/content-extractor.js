// Mat Ops Content Extractor - USABracketing Data Extraction
// No UI injection - only responds to side panel requests

console.log('[Mat Ops] Content extractor loaded on USABracketing');

// Global storage for detailed match data
const detailedMatches = new Map(); // matchId -> detailed stats
let pendingMatchId = null;
let modalObserver = null;

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Mat Ops] Received message:', request.action);

  if (request.action === 'extract_stats') {
    try {
      const wrestlers = extractWrestlers();
      sendResponse({ success: true, data: wrestlers });
    } catch (error) {
      console.error('[Mat Ops] Extraction error:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }

  if (request.action === 'auto_expand') {
    expandAllWeightClasses()
      .then(() => {
        // After expanding, attach click listeners to all match score links
        attachMatchScoreListeners();
        sendResponse({ success: true });
      })
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'capture_detailed_stats') {
    captureAllMatchDetails()
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'get_detailed_stats') {
    const stats = Array.from(detailedMatches.entries()).map(([id, data]) => ({ id, ...data }));
    console.log('[Mat Ops Extractor] get_detailed_stats called, returning count:', detailedMatches.size);
    console.log('[Mat Ops Extractor] detailedMatches Map has keys:', Array.from(detailedMatches.keys()));
    sendResponse({ success: true, detailedStats: stats, count: detailedMatches.size });
    return true;
  }

  if (request.action === 'auto_capture') {
    autoCaptureAllMatches()
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// ========== EXTRACTION FUNCTIONS (from original content-matops.js) ==========

function extractWrestlers() {
  // Find all wrestler containers
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
      const weightClass = parseWeightClass(weightDiv, wrestler.name);
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

function parseWeightClass(weightDiv, wrestlerName) {
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

      const match = parseMatchLine(text, li, wrestlerName);
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

function parseMatchLine(text, li, wrestlerName) {
  const match = {
    mat: '',
    bout: '',
    round: '',
    opponent: '',
    opponentTeam: '',
    result: '',
    winType: '',
    score: '',
    wrestlerScore: null,
    opponentScore: null,
    matchId: '',
    videoUrl: ''
  };

  // Extract Mat and Bout
  const matMatch = text.match(/Mat\s*(\d+)\s*-\s*Bout\s*(\d+)/i);
  if (matMatch) {
    match.mat = `Mat ${matMatch[1]}`;
    match.bout = matMatch[2];
  }

  // Extract Round
  const roundMatch = text.match(/(Champ\.|Cons\.|Wrestleback|Cons|Champ)[^\n]*/i);
  if (roundMatch) {
    match.round = roundMatch[0].trim();
  }

  // Determine Win/Loss by checking which side of "over" the wrestler's name is on
  if (text.includes(' over ')) {
    const overIndex = text.indexOf(' over ');
    const beforeOver = text.substring(0, overIndex);
    const afterOver = text.substring(overIndex + 6); // +6 for " over "

    // Check if wrestler's name (or first name) appears before "over" = Win, after = Loss
    const firstNameMatch = wrestlerName.match(/^(\w+)/);
    const firstName = firstNameMatch ? firstNameMatch[1] : wrestlerName;

    if (beforeOver.includes(firstName) || beforeOver.includes(wrestlerName)) {
      // Wrestler is BEFORE "over" → WIN
      match.result = 'Win';
      const oppMatch = text.match(/over\s+([^,]+?),\s*([^(]+?)(?:\s*\(|\s*Dec|\s*Fall|\s*Tech|\s*Maj|\s*For|$)/i);
      if (oppMatch) {
        match.opponent = oppMatch[1].trim();
        match.opponentTeam = oppMatch[2].trim();
      }
    } else if (afterOver.includes(firstName) || afterOver.includes(wrestlerName)) {
      // Wrestler is AFTER "over" → LOSS
      match.result = 'Loss';
      const oppMatch = text.match(/([^:]+?),\s*([^o]+?)\s+over/i);
      if (oppMatch) {
        match.opponent = oppMatch[1].replace(/.*?-\s*/, '').trim(); // Remove round prefix
        match.opponentTeam = oppMatch[2].trim();
      }
    } else {
      // Can't determine - default to checking old logic
      match.result = 'Win';
      const oppMatch = text.match(/over\s+([^,]+?),\s*([^(]+?)(?:\s*\(|\s*Dec|\s*Fall|\s*Tech|\s*Maj|\s*For|$)/i);
      if (oppMatch) {
        match.opponent = oppMatch[1].trim();
        match.opponentTeam = oppMatch[2].trim();
      }
    }
  } else if (text.includes(' def. ')) {
    match.result = 'Win';
    const oppMatch = text.match(/def\.\s+([^(,]+?)(?:\s*\(([^)]+)\))?(?=\s*,|\s*-|\s*Dec|\s*Fall|\s*Tech|\s*Maj|\s*For|$)/i);
    if (oppMatch) {
      match.opponent = oppMatch[1].trim();
      if (oppMatch[2]) {
        match.opponentTeam = oppMatch[2].trim();
      }
    }
  } else if (text.includes('lost to')) {
    match.result = 'Loss';
    const oppMatch = text.match(/lost to\s+([^(,]+?)(?:\s*\(([^)]+)\))?(?=\s*,|\s*-|\s*Dec|\s*Fall|\s*Tech|\s*Maj|\s*For|$)/i);
    if (oppMatch) {
      match.opponent = oppMatch[1].trim();
      if (oppMatch[2]) {
        match.opponentTeam = oppMatch[2].trim();
      }
    }
  }

  // Extract Win Type and Score
  const decMatch = text.match(/Dec\s+([\d-]+)/i);
  const fallMatch = text.match(/Fall\s+([\d:]+)/i);
  const techMatch = text.match(/Tech\s+Fall\s+([\d-]+)/i);
  const majMatch = text.match(/Maj\s+([\d-]+)/i);
  const forMatch = text.match(/For\./i);

  if (decMatch) {
    match.winType = 'Decision';
    match.score = `Dec ${decMatch[1]}`;
    parseScore(decMatch[1], match);
  } else if (techMatch) {
    match.winType = 'Tech Fall';
    match.score = `Tech Fall ${techMatch[1]}`;
    parseScore(techMatch[1], match);
  } else if (majMatch) {
    match.winType = 'Major Decision';
    match.score = `Maj ${majMatch[1]}`;
    parseScore(majMatch[1], match);
  } else if (fallMatch) {
    match.winType = 'Fall';
    match.score = `Fall ${fallMatch[1]}`;
  } else if (forMatch) {
    match.winType = 'Forfeit';
    match.score = 'Forfeit';
  }

  // Extract match ID from score link
  const scoreLink = li.querySelector('a[href*="fetchScoreSummary"]');
  if (scoreLink) {
    const href = scoreLink.getAttribute('href');
    const idMatch = href.match(/fetchScoreSummary\('([^']+)'\)/);
    if (idMatch) {
      match.matchId = idMatch[1];
    }
  }

  // Extract video URL
  const videoLink = li.querySelector('a[href*="youtu"]');
  if (videoLink) {
    match.videoUrl = videoLink.getAttribute('href');
  }

  return match;
}

function parseScore(scoreText, match) {
  const scores = scoreText.split('-').map(s => s.trim());
  if (scores.length === 2) {
    if (match.result === 'Win') {
      match.wrestlerScore = parseInt(scores[0]);
      match.opponentScore = parseInt(scores[1]);
    } else {
      match.wrestlerScore = parseInt(scores[1]);
      match.opponentScore = parseInt(scores[0]);
    }
  }
}

// ========== DETAILED MATCH STATS FUNCTIONS ==========

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
    console.log('[Mat Ops Parser] Starting parse, modal classes:', matchModal.className);

    // Check if modal has color-coded moves or plain text moves
    const modalText = matchModal.textContent;
    const hasColoredMoves = modalText.includes('color:#007500') || modalText.includes('color:#FF0000');

    if (hasColoredMoves) {
      // METHOD 1: Parse color-coded moves (green/red)
      const periodDivs = matchModal.querySelectorAll('div');
      let currentPeriod = 0;

      periodDivs.forEach((div) => {
        const text = div.textContent.trim();
        const styleAttr = div.getAttribute('style') || '';

        // Detect period headers
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
              if (moveType.includes('Takedown')) detail.takedowns++;
              else if (moveType.includes('Escape')) detail.escapes++;
              else if (moveType.includes('Reversal')) detail.reversals++;
              else if (moveType.includes('Near Fall 2')) detail.nearfall2++;
              else if (moveType.includes('Near Fall 3')) detail.nearfall3++;
              else if (moveType.includes('Near Fall 4')) detail.nearfall4++;
              else if (moveType.includes('Penalty 1')) detail.penalty1++;
              else if (moveType.includes('Penalty 2')) detail.penalty2++;
              else if (moveType.includes('Pin') || moveType.includes('Fall')) detail.pin = true;
            } else {
              if (moveType.includes('Takedown')) detail.takedownsOpp++;
              else if (moveType.includes('Escape')) detail.escapesOpp++;
              else if (moveType.includes('Reversal')) detail.reversalsOpp++;
              else if (moveType.includes('Near Fall 2')) detail.nearfall2Opp++;
              else if (moveType.includes('Near Fall 3')) detail.nearfall3Opp++;
              else if (moveType.includes('Near Fall 4')) detail.nearfall4Opp++;
              else if (moveType.includes('Penalty 1')) detail.penalty1Opp++;
              else if (moveType.includes('Penalty 2')) detail.penalty2Opp++;
              else if (moveType.includes('Pin') || moveType.includes('Fall')) detail.pinOpp = true;
            }
          }
        }
      });
    } else {
      // METHOD 2: Parse plain text moves (no colors) - lopsided matches
      console.log('[Mat Ops Parser] Using plain text parsing (no color codes)');

      // Parse moves from modal text directly
      const lines = modalText.split('\n').map(l => l.trim()).filter(l => l);

      // Pattern: "Period 1Takedown (0:00)Escape (1:22)" or similar
      // All moves after "Period X" are by the wrestler (winner) until next period or "Score"
      lines.forEach(line => {
        // Match period headers
        const periodMatch = line.match(/Period (\d+)/);
        if (periodMatch) {
          const periodNum = parseInt(periodMatch[1]);
          detail.periods.push({ period: periodNum, events: [] });
        }

        // Extract all moves from the line (format: "MoveType (timestamp)")
        const moveRegex = /(Takedown|Escape|Reversal|Nearfall \d|Near Fall \d|Penalty \d|Stalling)\s*\(([^)]+)\)/g;
        let match;
        while ((match = moveRegex.exec(line)) !== null) {
          const moveType = match[1].trim();
          const timestamp = match[2].trim();

          // All moves are by the wrestler (since they won big)
          if (moveType.includes('Takedown')) detail.takedowns++;
          else if (moveType.includes('Escape')) detail.escapes++;
          else if (moveType.includes('Reversal')) detail.reversals++;
          else if (moveType.includes('Near Fall 2') || moveType.includes('Nearfall 2')) detail.nearfall2++;
          else if (moveType.includes('Near Fall 3') || moveType.includes('Nearfall 3')) detail.nearfall3++;
          else if (moveType.includes('Near Fall 4') || moveType.includes('Nearfall 4')) detail.nearfall4++;
          else if (moveType.includes('Penalty 1')) detail.penalty1++;
          else if (moveType.includes('Penalty 2')) detail.penalty2++;
        }
      });
    }

    const totalStats = detail.takedowns + detail.escapes + detail.reversals +
                       detail.nearfall2 + detail.nearfall3 + detail.nearfall4;
    console.log(`[Mat Ops Parser] ✅ Parsed ${totalStats} total moves for wrestler`);

    // Debug: If we got zeros, log the modal content
    if (totalStats === 0) {
      console.warn(`[Mat Ops Parser] ⚠️ Got zero stats! Modal text:`, matchModal.textContent.substring(0, 500));
      console.warn(`[Mat Ops Parser] ⚠️ Modal HTML:`, matchModal.innerHTML.substring(0, 500));
    }

    return detail;
  } catch (error) {
    console.error('[Mat Ops Parser] Error parsing match detail:', error);
    return detail;
  }
}

function captureMatchDetail(matchId, retryCount = 0) {
  console.log(`[Mat Ops] 🔍 Attempting to capture ${matchId} (retry ${retryCount}/3)`);

  // STRATEGY: Find modal that was JUST opened (has recent content update)
  // Look for Livewire wire:id attribute that might contain match context
  const allModals = document.querySelectorAll('.mx-auto.max-w-md.rounded.shadow-md, div[class*="modal"]');
  console.log(`[Mat Ops] Found ${allModals.length} potential modals`);

  // Find the modal that was most recently updated by checking z-index or position in DOM
  // Livewire adds new modals at the END of the body
  const bodyChildren = Array.from(document.body.children);
  const modalsInDOM = bodyChildren.filter(child =>
    child.matches('.mx-auto.max-w-md.rounded.shadow-md, div[class*="modal"]') ||
    child.querySelector('.mx-auto.max-w-md.rounded.shadow-md, div[class*="modal"]')
  );

  console.log(`[Mat Ops] Found ${modalsInDOM.length} modal containers in body`);

  // Get the LAST modal container in DOM (most recently added)
  let modal = null;
  if (modalsInDOM.length > 0) {
    const lastContainer = modalsInDOM[modalsInDOM.length - 1];
    modal = lastContainer.matches('.mx-auto.max-w-md.rounded.shadow-md')
      ? lastContainer
      : lastContainer.querySelector('.mx-auto.max-w-md.rounded.shadow-md, div[class*="modal"]');
  }

  if (!modal) {
    if (retryCount < 3) {
      console.log('[Mat Ops] ⚠️ No modal found yet, retrying...');
      setTimeout(() => captureMatchDetail(matchId, retryCount + 1), 500);
    } else {
      console.error('[Mat Ops] ❌ No modal found after 3 retries');
    }
    return;
  }

  console.log(`[Mat Ops] Using modal at position ${modalsInDOM.length} in DOM`);

  // Check if modal has content
  if (!modal.textContent || modal.textContent.trim().length < 50) {
    if (retryCount < 3) {
      console.log('[Mat Ops] ⚠️ Modal empty, retrying...');
      setTimeout(() => captureMatchDetail(matchId, retryCount + 1), 500);
    } else {
      console.error('[Mat Ops] ❌ Modal never loaded content');
    }
    return;
  }

  // Check if this is the RIGHT modal (has period data)
  const hasPeriodData = modal.textContent.includes('Period 1') ||
                        modal.textContent.includes('Period 2') ||
                        modal.textContent.includes('Period 3');

  if (!hasPeriodData) {
    if (retryCount < 3) {
      console.log('[Mat Ops] ⚠️ Modal missing period data, retrying...');
      setTimeout(() => captureMatchDetail(matchId, retryCount + 1), 500);
    } else {
      console.error('[Mat Ops] ❌ Modal never showed period data');
    }
    return;
  }

  const detail = parseMatchDetail(modal);
  detailedMatches.set(matchId, detail);

  const totalStats = detail.takedowns + detail.escapes + detail.reversals +
                     detail.nearfall2 + detail.nearfall3 + detail.nearfall4;

  console.log(`[Mat Ops] ✅ Captured ${matchId}: ${totalStats} total stats, stored in Map (size: ${detailedMatches.size})`);
}

async function captureAllMatchDetails() {
  // Find all match score links
  const scoreLinks = Array.from(document.querySelectorAll('a[href*="fetchScoreSummary"]'));
  const totalLinks = scoreLinks.length;

  if (totalLinks === 0) {
    throw new Error('No match score links found. Make sure weight classes are expanded.');
  }

  console.log(`[Mat Ops] 🎯 Starting auto-capture of ${totalLinks} matches`);

  let captured = 0;
  let failed = 0;

  for (let i = 0; i < scoreLinks.length; i++) {
    const link = scoreLinks[i];

    try {
      // Extract match ID from link
      const href = link.getAttribute('href');
      const matchIdMatch = href.match(/fetchScoreSummary\('([^']+)'\)/);

      if (!matchIdMatch) {
        console.warn(`[Mat Ops] ⚠️ Could not extract match ID from: ${href}`);
        failed++;
        continue;
      }

      const matchId = matchIdMatch[1];

      // Check if already captured
      if (detailedMatches.has(matchId)) {
        console.log(`[Mat Ops] ⏭️ Match ${i+1}/${totalLinks}: Already captured ${matchId}`);
        captured++;
        continue;
      }

      // Open modal by calling fetchScoreSummary in page context
      console.log(`[Mat Ops] 🎯 Opening modal for match ${i+1}/${totalLinks}: ${matchId}`);

      // Inject script to call fetchScoreSummary in page context
      const script = document.createElement('script');
      script.textContent = `fetchScoreSummary('${matchId}');`;
      document.head.appendChild(script);
      document.head.removeChild(script);

      // Wait for modal to load
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Capture the detail
      captureMatchDetail(matchId);

      // Wait a bit for capture to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check if it was captured successfully
      if (detailedMatches.has(matchId)) {
        captured++;
        console.log(`[Mat Ops] ✅ Captured match ${i+1}/${totalLinks}`);
      } else {
        failed++;
        console.error(`[Mat Ops] ❌ Failed to capture match ${i+1}/${totalLinks}`);
      }

      // Close modal (ESC key)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error(`[Mat Ops] Error capturing match ${i+1}:`, error);
      failed++;
    }
  }

  console.log(`[Mat Ops] 🏁 Capture complete: ${captured} captured, ${failed} failed`);
  return { captured, failed, total: totalLinks };
}

async function expandAllWeightClasses() {
  console.log('[Mat Ops] 🔄 Expanding all weight classes...');

  const weightHeaders = document.querySelectorAll('span[wire\\:click*="toggleMatches"]');
  console.log(`[Mat Ops] Found ${weightHeaders.length} weight class headers to expand`);

  if (weightHeaders.length === 0) {
    throw new Error('No weight class headers found');
  }

  for (const header of weightHeaders) {
    header.click();
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('[Mat Ops] ✅ All weight classes expanded');
}

// Auto-capture all match details
async function autoCaptureAllMatches() {
  // First, make sure listeners are attached
  attachMatchScoreListeners();

  const scoreLinks = Array.from(document.querySelectorAll('a[href*="fetchScoreSummary"]'));
  console.log(`[Mat Ops] 🤖 Auto-capturing ${scoreLinks.length} matches...`);

  if (scoreLinks.length === 0) {
    console.warn('[Mat Ops] ⚠️ No match score links found. Did you expand weight classes first?');
    return {
      total: 0,
      captured: 0,
      skipped: 0
    };
  }

  let captured = 0;
  let skipped = 0;

  for (let i = 0; i < scoreLinks.length; i++) {
    const link = scoreLinks[i];
    const href = link.getAttribute('href');
    const matchIdMatch = href.match(/fetchScoreSummary\('([^']+)'\)/);

    if (!matchIdMatch) {
      skipped++;
      continue;
    }

    const matchId = matchIdMatch[1];

    // Skip if already captured
    if (detailedMatches.has(matchId)) {
      console.log(`[Mat Ops] ⏭️ Skipping ${matchId} (already captured)`);
      skipped++;
      continue;
    }

    console.log(`[Mat Ops] 🎯 Auto-capturing match ${i + 1}/${scoreLinks.length}: ${matchId}`);
    console.log(`[Mat Ops] 🔍 Link element:`, link.outerHTML.substring(0, 200));
    console.log(`[Mat Ops] 🔍 Link visible:`, link.offsetParent !== null);
    console.log(`[Mat Ops] 🔍 Link onclick:`, link.onclick);

    // Send status: Clicking
    chrome.runtime.sendMessage({
      action: 'auto_capture_progress',
      progress: {
        current: i + 1,
        total: scoreLinks.length,
        captured: captured,
        skipped: skipped,
        status: 'clicking',
        matchId: matchId
      }
    });

    // Set pending match ID
    pendingMatchId = matchId;

    // Start watching for modal
    startModalWatch();

    // Call fetchScoreSummary via background script (runs in MAIN world to bypass CSP)
    console.log(`[Mat Ops] 📞 Calling fetchScoreSummary via background script`);

    try {
      await chrome.runtime.sendMessage({
        action: 'call_page_function',
        functionName: 'fetchScoreSummary',
        args: [matchId]
      });
      console.log(`[Mat Ops] ✅ Function called successfully`);
    } catch (error) {
      console.error(`[Mat Ops] ❌ Failed to call function:`, error);
    }

    // Wait for modal to appear
    await sleep(1000);

    // Send status: Waiting for modal
    chrome.runtime.sendMessage({
      action: 'auto_capture_progress',
      progress: {
        current: i + 1,
        total: scoreLinks.length,
        captured: captured,
        skipped: skipped,
        status: 'capturing',
        matchId: matchId
      }
    });

    // Wait for modal to appear and be captured (max 10 seconds)
    const captureSuccess = await waitForCapture(matchId, 10000);

    if (captureSuccess) {
      captured++;
      console.log(`[Mat Ops] ✅ Captured ${matchId} (${captured}/${scoreLinks.length})`);

      // Send status: Closing modal
      chrome.runtime.sendMessage({
        action: 'auto_capture_progress',
        progress: {
          current: i + 1,
          total: scoreLinks.length,
          captured: captured,
          skipped: skipped,
          status: 'closing',
          matchId: matchId
        }
      });

      // Close the modal
      await closeModal();

      // Wait longer before next click (let page breathe)
      await sleep(1000);
    } else {
      console.warn(`[Mat Ops] ⚠️ Failed to capture ${matchId}`);
      // Try to close modal anyway
      await closeModal();
      await sleep(800);
    }

    // Send progress update to side panel
    chrome.runtime.sendMessage({
      action: 'auto_capture_progress',
      progress: {
        current: i + 1,
        total: scoreLinks.length,
        captured: captured,
        skipped: skipped,
        status: 'ready'
      }
    });
  }

  console.log(`[Mat Ops] 🎉 Auto-capture complete! Captured: ${captured}, Skipped: ${skipped}, Total: ${scoreLinks.length}`);

  return {
    total: scoreLinks.length,
    captured: captured,
    skipped: skipped
  };
}

// Wait for a match to be captured
function waitForCapture(matchId, timeout = 3000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (detailedMatches.has(matchId)) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

// Close modal
async function closeModal() {
  // Find close button (X button on modal)
  const closeButtons = document.querySelectorAll('button[aria-label="Close"], button.close, button:has(svg.lucide-x), .modal button svg.lucide-x');

  for (const btn of closeButtons) {
    // Check if button or parent is visible
    const button = btn.tagName === 'BUTTON' ? btn : btn.closest('button');
    if (button && button.offsetParent !== null) {
      console.log('[Mat Ops] 🚪 Closing modal');
      button.click();
      await sleep(500); // Wait longer for modal to close
      return true;
    }
  }

  // Try ESC key as fallback
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27 }));
  await sleep(500); // Wait longer for modal to close
  return false;
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function attachMatchScoreListeners() {
  // Find all match score links
  const scoreLinks = document.querySelectorAll('a[href*="fetchScoreSummary"]');
  console.log(`[Mat Ops] 🎯 Found ${scoreLinks.length} match score links`);

  scoreLinks.forEach(link => {
    // Skip if already has listener
    if (link.hasAttribute('data-matops-listener')) return;
    link.setAttribute('data-matops-listener', 'true');

    // Add click listener with capture phase (fires before page's handler)
    link.addEventListener('click', (e) => {
      // Extract match ID from href: javascript:fetchScoreSummary('abc-123')
      const href = link.getAttribute('href');
      const matchIdMatch = href.match(/fetchScoreSummary\('([^']+)'\)/);

      if (matchIdMatch) {
        pendingMatchId = matchIdMatch[1];
        console.log(`[Mat Ops] 👆 User clicked match: ${pendingMatchId}`);

        // Start watching for modal updates
        startModalWatch();
      }
    }, true); // Use capture phase
  });

  console.log(`[Mat Ops] ✅ Listeners attached to ${scoreLinks.length} match score links`);
}

function startModalWatch() {
  // Stop any existing observer
  if (modalObserver) {
    modalObserver.disconnect();
  }

  // Watch for changes in the document body
  modalObserver = new MutationObserver((mutations) => {
    // Look for modal content updates
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        // Check if a modal with period data appeared
        const modals = document.querySelectorAll('.mx-auto.max-w-md.rounded.shadow-md');
        for (const modal of modals) {
          const hasPeriodData = modal.textContent.includes('Period 1') ||
                                modal.textContent.includes('Period 2') ||
                                modal.textContent.includes('Period 3');

          if (hasPeriodData && pendingMatchId) {
            console.log(`[Mat Ops] 🎯 Modal with period data detected for ${pendingMatchId}`);
            modalObserver.disconnect();

            // Capture this modal
            const detail = parseMatchDetail(modal);
            detailedMatches.set(pendingMatchId, detail);

            const totalStats = detail.takedowns + detail.escapes + detail.reversals +
                               detail.nearfall2 + detail.nearfall3 + detail.nearfall4;

            console.log(`[Mat Ops] ✅ Captured ${pendingMatchId}: ${totalStats} total stats, stored in Map (size: ${detailedMatches.size})`);

            pendingMatchId = null;
            return;
          }
        }
      }
    }
  });

  // Start observing
  modalObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Timeout after 10 seconds (increased for auto-capture)
  setTimeout(() => {
    if (modalObserver && pendingMatchId) {
      console.warn(`[Mat Ops] ⚠️ Modal watch timeout for ${pendingMatchId}`);
      modalObserver.disconnect();
      pendingMatchId = null;
    }
  }, 10000);
}
