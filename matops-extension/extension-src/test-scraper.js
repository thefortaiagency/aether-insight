/**
 * Mat Ops Test Scraper
 * Test data extraction without database sync
 * Run this in browser console on USABracketing "My Wrestlers" page
 */

// Copy wrestler-parser.js functions inline for standalone testing

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
    console.error('Error parsing wrestler header:', error);
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

    // Extract mat
    const matMatch = text.match(/Mat\s+(\d+)\s+-/);
    if (matMatch) {
      match.mat = `Mat ${matMatch[1]}`;
    }

    // Extract bout
    const boutMatch = text.match(/Bout\s+(\d+)/);
    if (boutMatch) {
      match.bout = boutMatch[1];
    }

    // Extract round
    const roundMatch = text.match(/Bout\s+\d+\s+-\s+(.+?):/);
    if (roundMatch) {
      match.round = roundMatch[1].trim();
    }

    // Extract opponent
    const athleteLinks = li.querySelectorAll('a[href*="/athletes/"]');
    if (athleteLinks.length >= 2) {
      const opponentLink = athleteLinks[athleteLinks.length - 1];
      match.opponent = opponentLink.textContent.trim();

      const opponentSpan = opponentLink.closest('span');
      if (opponentSpan) {
        const teamMatch = opponentSpan.parentElement.textContent.match(/,\s+([A-Z]+)\s/);
        if (teamMatch) {
          match.opponentTeam = teamMatch[1];
        }
      }
    }

    // Win/Loss
    if (text.includes(' over ')) {
      match.result = 'Win';
    } else if (text.includes(' lost to ')) {
      match.result = 'Loss';
    }

    // Score
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

    // Video
    const videoLink = li.querySelector('a[href*="youtube.com"], a[href*="classofx.com"]');
    if (videoLink) {
      match.videoUrl = videoLink.href;
    }

    return match;
  } catch (error) {
    console.error('Error parsing match line:', error);
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
    const weightHeader = weightDiv.querySelector('.text-usa-blue.underline.cursor-pointer');
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

    const matchItems = weightDiv.querySelectorAll('ul li');

    matchItems.forEach(li => {
      const text = li.textContent.trim();

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
    console.error('Error parsing weight class:', error);
    return weightClass;
  }
}

function extractWrestlers() {
  const wrestlerDivs = document.querySelectorAll('div[wire\\:id][class*="mb-2"]');

  const wrestlers = [];

  wrestlerDivs.forEach(div => {
    const wrestler = parseWrestlerHeader(div);
    if (!wrestler.name) return;

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

// ========== TEST FUNCTIONS ==========

console.log('%c🤼 Mat Ops Test Scraper', 'font-size: 20px; font-weight: bold; color: #1e3a8a;');
console.log('%cExtracting data from USABracketing...', 'font-size: 14px; color: #3b82f6;');

const wrestlers = extractWrestlers();

console.log('\n' + '='.repeat(80));
console.log(`✅ Found ${wrestlers.length} wrestlers`);
console.log('='.repeat(80) + '\n');

wrestlers.forEach((wrestler, index) => {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📍 WRESTLER #${index + 1}: ${wrestler.name}`);
  console.log(`   Team: ${wrestler.team}, ${wrestler.state}`);
  console.log(`   Athlete ID: ${wrestler.athleteId}`);
  console.log(`${'─'.repeat(80)}`);

  wrestler.weightClasses.forEach((wc, wcIndex) => {
    console.log(`\n  ⚖️  Weight Class ${wcIndex + 1}: ${wc.division} - ${wc.weight} lbs`);
    console.log(`      Placement: ${wc.placement || 'N/A'}`);
    console.log(`      Matches: ${wc.matches.length}`);

    if (wc.matches.length > 0) {
      console.log('\n      Match Details:');
      wc.matches.forEach((match, matchIndex) => {
        const resultEmoji = match.result === 'Win' ? '✅' : '❌';
        console.log(`      ${matchIndex + 1}. ${resultEmoji} ${match.result} - ${match.winType}`);
        console.log(`         Opponent: ${match.opponent} (${match.opponentTeam})`);
        console.log(`         Score: ${match.wrestlerScore}-${match.opponentScore}`);
        console.log(`         Round: ${match.round}`);
        console.log(`         ${match.mat} - Bout ${match.bout}`);
        if (match.videoUrl) {
          console.log(`         📹 Video: ${match.videoUrl}`);
        }
      });
    }
  });
});

console.log('\n' + '='.repeat(80));
console.log('📊 SUMMARY');
console.log('='.repeat(80));
console.log(`Total Wrestlers: ${wrestlers.length}`);
const totalMatches = wrestlers.reduce((sum, w) =>
  sum + w.weightClasses.reduce((wsum, wc) => wsum + wc.matches.length, 0), 0
);
console.log(`Total Matches: ${totalMatches}`);

const totalWins = wrestlers.reduce((sum, w) =>
  sum + w.weightClasses.reduce((wsum, wc) =>
    wsum + wc.matches.filter(m => m.result === 'Win').length, 0
  ), 0
);
console.log(`Total Wins: ${totalWins}`);
console.log(`Total Losses: ${totalMatches - totalWins}`);

console.log('\n' + '='.repeat(80));
console.log('💾 Extracted Data Object:');
console.log('='.repeat(80));
console.log('Copy this data if you want to save it:');
console.log(JSON.stringify(wrestlers, null, 2));

// Make data available globally for inspection
window.matOpsTestData = wrestlers;
console.log('\n✅ Data saved to: window.matOpsTestData');
console.log('   You can inspect it in console or export it!');
