/**
 * Mat Ops Wrestler Parser
 * Parses USABracketing wrestler list and match data
 */

/**
 * Parse wrestler header div
 */
export function parseWrestlerHeader(wrestlerDiv) {
  const wrestler = {
    name: '',
    team: '',
    state: '',
    athleteId: '',
    weightClasses: []
  };

  try {
    // Find wrestler name and team in header
    // Format: "Braxtyn Bauer (Warrior RTC, IN)"
    const header = wrestlerDiv.querySelector('.p-2.bg-gray-200.border-b.border-usa-blue a');
    if (header) {
      wrestler.name = header.textContent.trim();
      wrestler.athleteId = header.href.split('/').pop();

      // Extract team and state from parent text
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

/**
 * Parse weight class section
 */
export function parseWeightClass(weightDiv) {
  const weightClass = {
    division: '',
    weight: 0,
    placement: '',
    matches: []
  };

  try {
    // Parse weight header
    // Format: "High School - 129 - (DNP)"
    const weightHeader = weightDiv.querySelector('.text-usa-blue.underline.cursor-pointer');
    if (weightHeader) {
      const headerText = weightHeader.textContent.trim();
      const parts = headerText.split('-').map(p => p.trim());

      if (parts.length >= 2) {
        weightClass.division = parts[0]; // "High School"
        weightClass.weight = parseInt(parts[1]); // "129"
        if (parts.length >= 3) {
          weightClass.placement = parts[2].replace(/[()]/g, '').trim(); // "DNP"
        }
      }
    }

    // Parse all match <li> elements
    const matchItems = weightDiv.querySelectorAll('ul li');

    matchItems.forEach(li => {
      const text = li.textContent.trim();

      // Skip section headers
      if (text === 'Completed' || text === 'Upcoming' || text.includes('Refresh')) {
        return;
      }

      const match = parseMatchLine(text, li);
      if (match) {
        weightClass.matches.push(match);
      }
    });

    return weightClass;
  } catch (error) {
    console.error('[Mat Ops] Error parsing weight class:', error);
    return weightClass;
  }
}

/**
 * Parse individual match line
 */
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

    // Extract mat assignment
    // Format: "Mat 2 - Bout 3011 - Champ. Rd of 128: ..."
    const matMatch = text.match(/Mat\s+(\d+)\s+-/);
    if (matMatch) {
      match.mat = `Mat ${matMatch[1]}`;
    }

    // Extract bout number
    const boutMatch = text.match(/Bout\s+(\d+)/);
    if (boutMatch) {
      match.bout = boutMatch[1];
    }

    // Extract round
    // Examples: "Champ. Rd of 128", "Cons. Rd of 64", "Cons. Sub-Rd of 32"
    const roundMatch = text.match(/Bout\s+\d+\s+-\s+(.+?):/);
    if (roundMatch) {
      match.round = roundMatch[1].trim();
    }

    // Extract opponent name and team
    // Find all athlete links in the match line
    const athleteLinks = li.querySelectorAll('a[href*="/athletes/"]');
    if (athleteLinks.length >= 2) {
      // Last link should be opponent
      const opponentLink = athleteLinks[athleteLinks.length - 1];
      match.opponent = opponentLink.textContent.trim();

      // Extract team abbreviation (e.g., "WART", "MHS", etc.)
      const opponentSpan = opponentLink.closest('span');
      if (opponentSpan) {
        const teamMatch = opponentSpan.parentElement.textContent.match(/,\s+([A-Z]+)\s/);
        if (teamMatch) {
          match.opponentTeam = teamMatch[1];
        }
      }
    }

    // Determine win/loss
    if (text.includes(' over ')) {
      match.result = 'Win';
    } else if (text.includes(' lost to ')) {
      match.result = 'Loss';
    }

    // Extract score and win type
    // Format examples: "Dec 2-0", "F 3:37", "TF 22-4", "MD 12-3", "Bye"
    const scoreLink = li.querySelector('a[href*="fetchScoreSummary"]');
    if (scoreLink) {
      const scoreText = scoreLink.textContent.trim();
      match.matchId = scoreLink.getAttribute('href').match(/'(.+?)'/)?.[1] || '';

      if (scoreText === 'Bye') {
        match.winType = 'Forfeit';
        match.wrestlerScore = 0;
        match.opponentScore = 0;
      } else {
        // Parse win type
        if (scoreText.startsWith('Dec')) {
          match.winType = 'Decision';
        } else if (scoreText.startsWith('MD')) {
          match.winType = 'Major Decision';
        } else if (scoreText.startsWith('TF')) {
          match.winType = 'Tech Fall';
        } else if (scoreText.startsWith('F ')) {
          match.winType = 'Pin';
        } else if (scoreText.startsWith('Forf')) {
          match.winType = 'Forfeit';
        }

        // Parse score
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

    // Extract video URL
    const videoLink = li.querySelector('a[href*="youtube.com"], a[href*="classofx.com"]');
    if (videoLink) {
      match.videoUrl = videoLink.href;
    }

    return match;
  } catch (error) {
    console.error('[Mat Ops] Error parsing match line:', error);
    return null;
  }
}

/**
 * Extract all wrestlers from the My Wrestlers page
 */
export function extractWrestlers() {
  // Find all wrestler divs (wire:id divs with wrestler data)
  const wrestlerDivs = document.querySelectorAll('div[wire\\:id][class*="mb-2"]');

  const wrestlers = [];

  wrestlerDivs.forEach(div => {
    const wrestler = parseWrestlerHeader(div);
    if (!wrestler.name) return; // Skip if no name found

    // Find all weight class sections within this wrestler
    const weightDivs = div.querySelectorAll('.bg-gray-50.p-4.rounded-lg.shadow-sm.border');

    weightDivs.forEach(weightDiv => {
      const weightClass = parseWeightClass(weightDiv);
      if (weightClass.weight > 0) {
        wrestler.weightClasses.push(weightClass);
      }
    });

    wrestlers.push(wrestler);
  });

  return wrestlers;
}

/**
 * Convert wrestler data to match format for sync
 */
export function wrestlersToMatches(wrestlers, eventInfo) {
  const allMatches = [];

  wrestlers.forEach(wrestler => {
    wrestler.weightClasses.forEach(weightClass => {
      weightClass.matches.forEach(match => {
        allMatches.push({
          wrestlerName: wrestler.name,
          weightClass: weightClass.weight,
          matchDate: eventInfo?.date || new Date().toISOString().split('T')[0],
          opponent: match.opponent,
          opponentTeam: match.opponentTeam,
          result: match.result,
          winType: match.winType,
          wrestlerScore: match.wrestlerScore,
          opponentScore: match.opponentScore,
          round: match.round,
          matchNumber: match.bout,
          placement: weightClass.placement,
          sourceId: match.matchId,
          notes: `${match.mat} - Bout ${match.bout} - ${match.round}`,
          videoUrl: match.videoUrl,

          // Stats will be populated when clicking "fetchScoreSummary"
          // For now, defaults
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
          pin: match.winType === 'Pin' && match.result === 'Win',
          pinOpp: match.winType === 'Pin' && match.result === 'Loss',
          forfeit: match.winType === 'Forfeit',
        });
      });
    });
  });

  return allMatches;
}
