/**
 * Mat Ops Match Parser
 * Parses USABracketing match HTML structure
 */

/**
 * Parse a match card (the complete match HTML div)
 */
export function parseMatchCard(matchDiv) {
  const match = {
    wrestlerName: '',
    opponent: '',
    result: '',
    winType: '',
    wrestlerScore: 0,
    opponentScore: 0,
    matchDate: new Date().toISOString().split('T')[0], // Default to today
    weightClass: 0,

    // Detailed stats
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
    forfeit: false,
    notes: '',
    periods: []
  };

  try {
    // Parse header (wrestler names and result)
    const header = matchDiv.querySelector('div[style*="font-weight:bold"][style*="font-size:1.1em"]');
    if (header) {
      const headerText = header.textContent;

      // Extract names and result
      // Format: "Hunter Douglas, TFH over Braxton Shines, SBWC (TF 22-4 (2:59))"
      const overMatch = headerText.match(/(.+?)\s+over\s+(.+?)\s+\((.+?)\)/);
      if (overMatch) {
        match.wrestlerName = overMatch[1].split(',')[0].trim();
        match.opponent = overMatch[2].split(',')[0].trim();

        const resultPart = overMatch[3]; // "TF 22-4 (2:59)"

        // Extract win type
        if (resultPart.includes('TF')) {
          match.winType = 'Tech Fall';
          match.result = 'Win';
        } else if (resultPart.includes('Fall')) {
          match.winType = 'Pin';
          match.result = 'Win';
          match.pin = true;
        } else if (resultPart.includes('MD')) {
          match.winType = 'Major Decision';
          match.result = 'Win';
        } else if (resultPart.includes('Dec')) {
          match.winType = 'Decision';
          match.result = 'Win';
        } else if (resultPart.includes('Forf')) {
          match.winType = 'Forfeit';
          match.result = 'Win';
          match.forfeit = true;
        }

        // Extract score
        const scoreMatch = resultPart.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
          match.wrestlerScore = parseInt(scoreMatch[1]);
          match.opponentScore = parseInt(scoreMatch[2]);
        }
      }

      // Alternative format: "lost to" instead of "over"
      const lostMatch = headerText.match(/(.+?)\s+lost to\s+(.+?)\s+\((.+?)\)/);
      if (lostMatch) {
        match.wrestlerName = lostMatch[1].split(',')[0].trim();
        match.opponent = lostMatch[2].split(',')[0].trim();
        match.result = 'Loss';

        const resultPart = lostMatch[3];

        // Extract loss type
        if (resultPart.includes('Fall')) {
          match.winType = 'Pin';
          match.pinOpp = true;
        } else if (resultPart.includes('TF')) {
          match.winType = 'Tech Fall';
        } else if (resultPart.includes('MD')) {
          match.winType = 'Major Decision';
        } else if (resultPart.includes('Dec')) {
          match.winType = 'Decision';
        }

        // Extract score (reversed for losses)
        const scoreMatch = resultPart.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
          match.wrestlerScore = parseInt(scoreMatch[2]);
          match.opponentScore = parseInt(scoreMatch[1]);
        }
      }
    }

    // Parse athlete names from table headers
    const nameHeaders = matchDiv.querySelectorAll('table td div[style*="background-color: #007500"], table td div[style*="background-color: #FF0000"]');
    if (nameHeaders.length === 2) {
      // Green is winner, red is loser
      const wrestlerHeader = nameHeaders[0];
      const opponentHeader = nameHeaders[1];

      const wrestlerLink = wrestlerHeader.querySelector('a');
      const opponentLink = opponentHeader.querySelector('a');

      if (wrestlerLink) {
        const fullName = wrestlerHeader.textContent.trim();
        match.wrestlerName = fullName.replace(wrestlerLink.textContent, '').trim() + ' ' + wrestlerLink.textContent;
        match.wrestlerName = match.wrestlerName.trim();
      }

      if (opponentLink) {
        const fullName = opponentHeader.textContent.trim();
        match.opponent = fullName.replace(opponentLink.textContent, '').trim() + ' ' + opponentLink.textContent;
        match.opponent = match.opponent.trim();
      }
    }

    // Parse period-by-period details
    const periodDivs = matchDiv.querySelectorAll('div');
    let currentPeriod = 0;

    periodDivs.forEach(div => {
      const text = div.textContent.trim();
      const styleAttr = div.getAttribute('style') || '';

      // Detect period headers
      if (text.includes('Period') && styleAttr.includes('background-color:#dddddd')) {
        currentPeriod++;
        match.periods.push({ period: currentPeriod, events: [] });
      }

      // Parse scoring events
      const isWrestlerMove = styleAttr.includes('color:#007500');
      const isOpponentMove = styleAttr.includes('color:#FF0000');

      if (isWrestlerMove || isOpponentMove) {
        // Extract move type and timestamp
        const moveMatch = text.match(/(.+?)\s*\((.+?)\)/);
        if (moveMatch) {
          const moveType = moveMatch[1].trim();
          const timestamp = moveMatch[2].trim();

          // Record move in current period
          if (match.periods[currentPeriod - 1]) {
            match.periods[currentPeriod - 1].events.push({
              wrestler: isWrestlerMove ? 'self' : 'opponent',
              move: moveType,
              timestamp
            });
          }

          // Count stats
          if (isWrestlerMove) {
            if (moveType.includes('Takedown')) match.takedowns++;
            else if (moveType.includes('Escape')) match.escapes++;
            else if (moveType.includes('Reversal')) match.reversals++;
            else if (moveType.includes('Nearfall 2')) match.nearfall2++;
            else if (moveType.includes('Nearfall 3')) match.nearfall3++;
            else if (moveType.includes('Nearfall 4')) match.nearfall4++;
            else if (moveType.includes('Penalty 1')) match.penalty1++;
            else if (moveType.includes('Penalty 2')) match.penalty2++;
          } else {
            if (moveType.includes('Takedown')) match.takedownsOpp++;
            else if (moveType.includes('Escape')) match.escapesOpp++;
            else if (moveType.includes('Reversal')) match.reversalsOpp++;
            else if (moveType.includes('Nearfall 2')) match.nearfall2Opp++;
            else if (moveType.includes('Nearfall 3')) match.nearfall3Opp++;
            else if (moveType.includes('Nearfall 4')) match.nearfall4Opp++;
            else if (moveType.includes('Penalty 1')) match.penalty1Opp++;
            else if (moveType.includes('Penalty 2')) match.penalty2Opp++;
          }
        }
      }
    });

    // Parse final score table
    const scoreDivs = matchDiv.querySelectorAll('div[style*="font-weight:bold"][style*="font-size:1.1em"]');
    scoreDivs.forEach(div => {
      const styleAttr = div.getAttribute('style') || '';
      const text = div.textContent.trim();

      if (styleAttr.includes('color:#007500') && /^\d+$/.test(text)) {
        match.wrestlerScore = parseInt(text);
      } else if (styleAttr.includes('color:#FF0000') && /^\d+$/.test(text)) {
        match.opponentScore = parseInt(text);
      }
    });

    return match;
  } catch (error) {
    console.error('[Mat Ops] Error parsing match card:', error);
    return match;
  }
}

/**
 * Find all match cards on the page
 */
export function findMatchCards() {
  // Match cards are divs with class "mx-auto w-full md:w-auto my-2 p-2 max-w-md rounded overflow-hidden shadow-md text-sm"
  const matchDivs = document.querySelectorAll('.mx-auto.max-w-md.rounded.shadow-md');
  return Array.from(matchDivs);
}

/**
 * Extract all matches from the current page
 */
export function extractAllMatches() {
  const matchCards = findMatchCards();
  console.log(`[Mat Ops] Found ${matchCards.length} match cards`);

  const matches = matchCards.map(card => parseMatchCard(card));
  return matches.filter(m => m.wrestlerName && m.opponent); // Filter out invalid matches
}
