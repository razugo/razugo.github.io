(function(window, document) {
  window.PokerTracker = window.PokerTracker || {};
  const PT = window.PokerTracker;

  const DEFAULT_BASE = '/projects/poker_tracker';
  let initialized = false;
  let globalListenersBound = false;

  function getMarkup() {
    return `
      <div id="sessionSettingsModal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Session Settings</h3>
            <button class="modal-close" data-action="close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="session-form-grid session-form-grid-name-game">
              <div class="form-group" data-field="sessionName">
                <label for="modalSessionNameInput">Session Name</label>
                <input type="text" id="modalSessionNameInput" class="form-input" placeholder="Enter session name">
              </div>
              <div class="form-group">
                <label for="modalGameSelect">Game</label>
                <select id="modalGameSelect" class="form-input">
                  <option value="">Select Game</option>
                </select>
              </div>
            </div>
            <div class="session-form-grid session-form-grid-finance">
              <div class="form-group" data-field="buyIn">
                <label for="modalBuyInInput">Buy In</label>
                <input type="number" id="modalBuyInInput" class="form-input" placeholder="0.00" step="0.01" min="0">
              </div>
              <div class="form-group" data-field="cashOut">
                <label for="modalCashOutInput">Cash Out</label>
                <input type="number" id="modalCashOutInput" class="form-input" placeholder="0.00" step="0.01" min="0">
              </div>
            </div>
            <div class="session-form-grid session-form-grid-time">
              <div class="form-group">
                <label for="modalSessionDateInput">Session Date</label>
                <input type="text" id="modalSessionDateInput" class="form-input date-picker-input" placeholder="YYYY-MM-DD" autocomplete="off">
              </div>
              <div class="form-group">
                <label for="modalDurationInput">Duration (hrs)</label>
                <input type="number" id="modalDurationInput" class="form-input" placeholder="0" step="0.25" min="0">
              </div>
            </div>
            <div class="form-group">
              <label for="modalSessionNotes">Session Notes</label>
              <textarea id="modalSessionNotes" class="form-input" placeholder="Session notes..." style="min-height: 60px; resize: vertical;"></textarea>
            </div>
          </div>
          <div class="modal-footer session-modal-footer">
            <button class="btn btn-danger" data-action="end-session" id="modalEndSessionBtn">End Session</button>
          </div>
        </div>
      </div>
    `;
  }

  function ensureModalElement() {
    let modal = document.getElementById('sessionSettingsModal');
    if (modal) return modal;

    const host = document.querySelector('[data-component="session-settings-modal"]');
    if (host) {
      host.innerHTML = getMarkup();
      modal = host.querySelector('#sessionSettingsModal');
    } else {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = getMarkup();
      modal = wrapper.firstElementChild;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function getBasePath() {
    if (typeof PT.basePath === 'string') {
      return PT.basePath.replace(/\/$/, '');
    }
    const navHost = document.querySelector('[data-component="nav-bar"]');
    if (navHost && navHost.dataset.base) {
      return navHost.dataset.base.replace(/\/$/, '');
    }
    return DEFAULT_BASE;
  }

  const SessionModal = {
    currentSessionId: null,
    autoSaveListenersBound: false,

    ensure() {
      this.modal = ensureModalElement();

      const closeButton = this.modal.querySelector('[data-action="close"]');
      if (closeButton && !closeButton.dataset.bound) {
        closeButton.addEventListener('click', () => this.closeSessionSettingsModal());
        closeButton.dataset.bound = 'true';
      }

      const endButton = this.modal.querySelector('[data-action="end-session"]');
      if (endButton && !endButton.dataset.bound) {
        endButton.addEventListener('click', () => this.endSession());
        endButton.dataset.bound = 'true';
      }

      if (!globalListenersBound) {
        bindGlobalListeners();
        globalListenersBound = true;
      }

      if (!initialized) {
        this.initializeEnhancements();
        initialized = true;
      }
    },

    initializeEnhancements() {
      if (PT.Dropdowns && typeof PT.Dropdowns.init === 'function') {
        PT.Dropdowns.init('modalGameSelect', {
          placeholder: 'Select Game',
          placeholderText: 'Select Game',
          settings: {
            allowDeselect: true,
            showSearch: true,
            placeholderText: 'Select Game'
          }
        });
      }

      if (PT.DatePickers && typeof PT.DatePickers.initDateField === 'function') {
        PT.DatePickers.initDateField('modalSessionDateInput', {
          altInput: true,
          altFormat: 'M j, Y',
          altInputClass: 'form-input flatpickr-alt-input',
          clearLabel: 'Clear'
        });
      }

      this.ensureAutoSaveListeners();
    },

    showSessionSettingsModal(sessionId) {
      this.ensure();
      this.currentSessionId = sessionId || this.getCurrentSessionId();
      if (!this.currentSessionId) return;
      this.loadSessionData();
      this.modal.style.display = 'flex';
    },

    closeSessionSettingsModal() {
      this.ensure();
      this.modal.style.display = 'none';
      this.currentSessionId = null;
    },

    getCurrentSessionId() {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      if (sessionId) return sessionId;

      if (PT.DataStore) {
        const activeSession = PT.DataStore.getActiveSession();
        return activeSession ? activeSession.id : null;
      }
      return null;
    },

    loadSessionData() {
      if (!this.currentSessionId || !PT.DataStore) return;
      const session = PT.DataStore.getSession(this.currentSessionId);
      if (!session) return;

      const nameInput = document.getElementById('modalSessionNameInput');
      const buyInInput = document.getElementById('modalBuyInInput');
      const cashOutInput = document.getElementById('modalCashOutInput');
      const notesInput = document.getElementById('modalSessionNotes');
      const dateInput = document.getElementById('modalSessionDateInput');
      const durationInput = document.getElementById('modalDurationInput');

      if (nameInput) nameInput.value = session.name || '';
      if (buyInInput) buyInInput.value = session.buyIn || '';
      if (cashOutInput) cashOutInput.value = session.cashOut || '';
      if (notesInput) notesInput.value = session.notes || '';

      if (PT.DatePickers && PT.DatePickers.setDate) {
        const dateValue = session.sessionDate ? new Date(`${session.sessionDate}T00:00:00`) : null;
        PT.DatePickers.setDate('modalSessionDateInput', dateValue, false);
      } else if (dateInput) {
        dateInput.value = session.sessionDate || '';
      }

      if (durationInput) {
        const duration = typeof session.durationHours === 'number' && Number.isFinite(session.durationHours)
          ? session.durationHours
          : '';
        durationInput.value = duration === '' ? '' : duration;
      }

      this.populateGameSelect(session.gameId || '');

      const endBtn = document.getElementById('modalEndSessionBtn');
      if (endBtn && PT.DataStore) {
        const isActive = PT.DataStore.getActiveSession()?.id === this.currentSessionId;
        endBtn.style.display = isActive ? 'inline-block' : 'none';
      }
    },

    populateGameSelect(selectedValue) {
      const gameSelect = document.getElementById('modalGameSelect');
      if (!gameSelect || !PT.DataStore) return;

      const games = PT.DataStore.getAllGames();
      const options = [{ text: 'Select Game', value: '', placeholder: true }];

      games.forEach(game => {
        options.push({
          text: game.name,
          value: game.id
        });
      });

      if (PT.Dropdowns && PT.Dropdowns.setOptions) {
        PT.Dropdowns.setOptions('modalGameSelect', options, selectedValue);
      } else {
        gameSelect.innerHTML = '';
        options.forEach(option => {
          const opt = document.createElement('option');
          opt.value = option.value;
          opt.textContent = option.text;
          if (option.value === selectedValue) {
            opt.selected = true;
          }
          gameSelect.appendChild(opt);
        });
      }
    },

    parseNumericInput(value) {
      if (value === '' || value === null || typeof value === 'undefined') return 0;
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    },

    enforceCurrencyPrecision(input) {
      if (!input) return;
      input.addEventListener('input', function() {
        const current = this.value;
        const decimalIndex = current.indexOf('.');
        if (decimalIndex !== -1 && current.length - decimalIndex - 1 > 2) {
          const trimmed = current.slice(0, decimalIndex + 3);
          const caret = trimmed.length;
          this.value = trimmed;
          try {
            this.setSelectionRange(caret, caret);
          } catch (err) {
            // Ignore browsers that don't support setSelectionRange on number inputs
          }
        }
      });
    },

    ensureAutoSaveListeners() {
      if (this.autoSaveListenersBound) return;

      const fieldConfigs = [
        {
          id: 'modalSessionNameInput',
          event: 'input',
          getUpdates: element => ({ name: element.value.trim() })
        },
        {
          id: 'modalBuyInInput',
          event: 'input',
          getUpdates: element => ({ buyIn: this.parseNumericInput(element.value) })
        },
        {
          id: 'modalCashOutInput',
          event: 'input',
          getUpdates: element => ({ cashOut: this.parseNumericInput(element.value) })
        },
        {
          id: 'modalGameSelect',
          event: 'change',
          getUpdates: element => ({ gameId: element.value || null })
        },
        {
          id: 'modalSessionDateInput',
          event: 'change',
          getUpdates: element => {
            const value = element.value;
            return value ? { sessionDate: value } : { sessionDate: null };
          }
        },
        {
          id: 'modalDurationInput',
          event: 'input',
          getUpdates: element => {
            const value = parseFloat(element.value);
            if (Number.isNaN(value) || value < 0) {
              return { durationHours: null };
            }
            return { durationHours: Math.round(value * 100) / 100 };
          }
        },
        {
          id: 'modalSessionNotes',
          event: 'input',
          getUpdates: element => ({ notes: element.value })
        }
      ];

      fieldConfigs.forEach(config => {
        const element = document.getElementById(config.id);
        if (!element) return;

        if (config.id === 'modalBuyInInput' || config.id === 'modalCashOutInput') {
          this.enforceCurrencyPrecision(element);
        }

        element.addEventListener(config.event || 'input', () => {
          const updates = config.getUpdates(element) || {};
          this.handleFieldUpdates(updates);
        });
      });

      this.autoSaveListenersBound = true;
    },

    filterUnchangedUpdates(updates = {}) {
      if (!this.currentSessionId || !PT.DataStore) return updates;
      const session = PT.DataStore.getSession(this.currentSessionId);
      if (!session) return updates;

      const filtered = {};
      Object.keys(updates).forEach(key => {
        const incoming = updates[key];
        const existing = session[key];

        const bothNumbers = typeof incoming === 'number' && typeof existing === 'number';
        if (bothNumbers && incoming === existing) return;

        if ((incoming === null || incoming === '') && (existing === null || typeof existing === 'undefined' || existing === '')) {
          return;
        }

        if (incoming === existing) return;

        filtered[key] = incoming;
      });

      return filtered;
    },

    handleFieldUpdates(updates = {}) {
      if (!this.currentSessionId || !PT.DataStore) return;

      const filtered = this.filterUnchangedUpdates(updates);
      if (Object.keys(filtered).length === 0) {
        return;
      }

      PT.DataStore.updateSession(this.currentSessionId, filtered);
      this.refreshDependentViews();
    },

    refreshDependentViews() {
      if (typeof window.updateSessionStats === 'function') {
        window.updateSessionStats();
      }
      if (typeof window.updateLiveStats === 'function') {
        window.updateLiveStats();
      }
      if (typeof window.populateSessionsTable === 'function') {
        window.populateSessionsTable();
      }
      if (typeof window.checkActiveSession === 'function') {
        window.checkActiveSession();
      }
      if (typeof window.updateLiveSessionNavLink === 'function') {
        window.updateLiveSessionNavLink();
      }
    },

    saveSessionSettings() {
      if (!this.currentSessionId) return;

      const updates = {
        name: document.getElementById('modalSessionNameInput')?.value.trim() || '',
        buyIn: this.parseNumericInput(document.getElementById('modalBuyInInput')?.value),
        cashOut: this.parseNumericInput(document.getElementById('modalCashOutInput')?.value),
        gameId: document.getElementById('modalGameSelect')?.value || null,
        notes: document.getElementById('modalSessionNotes')?.value || ''
      };

      const sessionDateValue = document.getElementById('modalSessionDateInput')?.value;
      const durationValue = parseFloat(document.getElementById('modalDurationInput')?.value);

      updates.sessionDate = sessionDateValue || null;
      updates.durationHours = Number.isFinite(durationValue) && durationValue >= 0
        ? Math.round(durationValue * 100) / 100
        : null;

      this.handleFieldUpdates(updates);
    },

    endSession() {
      if (!this.currentSessionId || !PT.DataStore) return;

      if (!confirm('Are you sure you want to end this session?')) {
        return;
      }

      const durationInput = document.getElementById('modalDurationInput');
      const sessionDateField = document.getElementById('modalSessionDateInput');
      const state = PT.DataStore.appState || {};
      const activeSession = PT.DataStore.getActiveSession();
      const isLiveSession = activeSession && activeSession.id === this.currentSessionId;

      let durationHours = null;

      if (isLiveSession) {
        let suggested = null;
        if (state.liveSessionStart) {
          const liveStart = new Date(state.liveSessionStart);
          if (!Number.isNaN(liveStart.getTime())) {
            const minutes = Math.max(0, (Date.now() - liveStart.getTime()) / (1000 * 60));
            if (minutes > 0) {
              suggested = Math.round((minutes / 60) * 100) / 100;
            }
          }
        }

        const promptDefault = suggested !== null ? suggested.toFixed(2) : '';
        const input = prompt('Enter session duration in hours (e.g., 3.5). Leave blank to keep unset.', promptDefault);
        if (input === null) {
          return;
        }

        if (input.trim() !== '') {
          const parsed = parseFloat(input);
          if (!Number.isFinite(parsed) || parsed < 0) {
            alert('Please enter a valid non-negative number for duration.');
            return;
          }
          durationHours = Math.round(parsed * 100) / 100;
          if (durationInput) {
            durationInput.value = durationHours;
          }
        }
      } else if (durationInput) {
        const parsed = parseFloat(durationInput.value);
        if (Number.isFinite(parsed) && parsed >= 0) {
          durationHours = Math.round(parsed * 100) / 100;
        }
      }

      const updates = {};
      if (typeof durationHours === 'number') {
        updates.durationHours = durationHours;
      }
      if (sessionDateField && sessionDateField.value) {
        updates.sessionDate = sessionDateField.value;
      }

      if (Object.keys(updates).length > 0) {
        this.handleFieldUpdates(updates);
      }

      PT.DataStore.endActiveSession(this.currentSessionId, { durationHours });
      this.closeSessionSettingsModal();

      if (typeof window.updateLiveSessionNavLink === 'function') {
        window.updateLiveSessionNavLink();
      }

      const base = getBasePath();
      window.location.href = `${base}/sessions/`;
    }
  };

  function bindGlobalListeners() {
    document.addEventListener('click', event => {
      const modal = document.getElementById('sessionSettingsModal');
      if (modal && event.target === modal) {
        SessionModal.closeSessionSettingsModal();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        const modal = document.getElementById('sessionSettingsModal');
        if (modal && modal.style.display === 'flex') {
          SessionModal.closeSessionSettingsModal();
        }
      }
    });
  }

  PT.SessionModal = SessionModal;
  window.showSessionSettingsModal = function(sessionId) {
    SessionModal.showSessionSettingsModal(sessionId);
  };

  document.addEventListener('DOMContentLoaded', () => {
    SessionModal.ensure();
  });
})(window, document);
