// NEW APPROACH: Use MutationObserver to detect modal updates

let pendingMatchId = null;
let modalObserver = null;

function attachMatchScoreListeners() {
  const scoreLinks = document.querySelectorAll('a[href*="fetchScoreSummary"]');
  console.log(`[Mat Ops] 🎯 Attaching listeners to ${scoreLinks.length} match score links`);

  scoreLinks.forEach(link => {
    if (link.hasAttribute('data-matops-listener')) return;
    link.setAttribute('data-matops-listener', 'true');

    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const matchIdMatch = href.match(/fetchScoreSummary\('([^']+)'\)/);

      if (matchIdMatch) {
        pendingMatchId = matchIdMatch[1];
        console.log(`[Mat Ops] 👆 User clicked match: ${pendingMatchId}`);

        // Start watching for modal updates
        startModalWatch();
      }
    });
  });

  console.log(`[Mat Ops] ✅ Listeners attached!`);
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

  // Timeout after 3 seconds
  setTimeout(() => {
    if (modalObserver && pendingMatchId) {
      console.warn(`[Mat Ops] ⚠️ Modal watch timeout for ${pendingMatchId}`);
      modalObserver.disconnect();
      pendingMatchId = null;
    }
  }, 3000);
}
