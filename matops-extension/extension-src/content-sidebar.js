/**
 * Mat Ops Sidebar Panel
 * Similar to AImpact IDE and Yoo Direct sidebars
 */

import { extractWrestlers } from './wrestler-parser.js';

class MatOpsSidebar {
  constructor() {
    this.isOpen = true;
    this.extractedData = null;
    this.panel = null;
    this.init();
  }

  init() {
    // Check if we're on USABracketing
    if (!window.location.hostname.includes('usabracketing.com')) {
      return;
    }

    // Create sidebar panel
    this.createPanel();

    // Auto-extract on page load (after delay for Livewire)
    setTimeout(() => {
      this.extractStats();
    }, 2000);

    // Watch for page changes (Livewire)
    this.observePageChanges();
  }

  createPanel() {
    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'matops-sidebar';
    panel.className = 'matops-sidebar';
    panel.innerHTML = `
      <div class="matops-sidebar-header">
        <div class="matops-header-content">
          <div class="matops-logo">
            <span class="matops-icon">🤼</span>
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
        <!-- Stats Summary -->
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

        <!-- Wrestlers List -->
        <div class="matops-section">
          <div class="matops-section-title">Wrestlers</div>
          <div id="matops-wrestlers-list" class="matops-wrestlers-list">
            <div class="matops-empty-state">
              <span class="matops-empty-icon">📊</span>
              <p>Click "Extract Stats" to begin</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="matops-section matops-actions">
          <button class="matops-btn matops-btn-primary" id="matops-extract">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
            Extract Stats
          </button>
          <button class="matops-btn matops-btn-secondary" id="matops-export" disabled>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Export JSON
          </button>
        </div>

        <!-- Status -->
        <div id="matops-status" class="matops-status"></div>
      </div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;

    // Event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Toggle sidebar
    document.getElementById('matops-toggle').addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Refresh/extract
    document.getElementById('matops-refresh').addEventListener('click', () => {
      this.extractStats();
    });

    document.getElementById('matops-extract').addEventListener('click', () => {
      this.extractStats();
    });

    // Export
    document.getElementById('matops-export').addEventListener('click', () => {
      this.exportData();
    });
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('matops-sidebar-collapsed', !this.isOpen);

    const icon = document.querySelector('#matops-toggle svg');
    if (this.isOpen) {
      icon.innerHTML = '<path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>';
    } else {
      icon.innerHTML = '<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>';
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

        this.updateUI();
        this.showStatus(`✅ Extracted ${this.extractedData.length} wrestlers`, 'success');

        // Enable export button
        document.getElementById('matops-export').disabled = false;

        console.log('[Mat Ops] Extracted data:', this.extractedData);
      } catch (error) {
        console.error('[Mat Ops] Extraction error:', error);
        this.showStatus('Error extracting stats. Check console.', 'error');
      }
    }, 100);
  }

  updateUI() {
    if (!this.extractedData) return;

    // Calculate stats
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

    // Update stat cards
    document.getElementById('matops-wrestler-count').textContent = wrestlerCount;
    document.getElementById('matops-match-count').textContent = matchCount;
    document.getElementById('matops-win-count').textContent = winCount;
    document.getElementById('matops-loss-count').textContent = lossCount;

    // Update wrestlers list
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

    const json = JSON.stringify(this.extractedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matops-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showStatus('✅ Exported to JSON file', 'success');
  }

  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
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
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MatOpsSidebar();
  });
} else {
  new MatOpsSidebar();
}

console.log('[Mat Ops] Sidebar loaded');
