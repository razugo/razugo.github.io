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
            <div class="form-group">
              <label for="modalLocationSelect">Location</label>
              <select id="modalLocationSelect" class="form-input">
                <option value="">Select location...</option>
              </select>
              <input type="text" id="modalLocationInput" class="form-input" placeholder="Enter new location" style="display: none;" autocomplete="off" autocorrect="off" autocapitalize="words" spellcheck="false">
            </div>
            <div class="session-form-grid session-form-grid-stakes">
              <div class="form-group">
                <label for="modalSmallBlindInput">Small Blind ($)</label>
                <input type="number" id="modalSmallBlindInput" class="form-input" placeholder="0.00" step="0.01" min="0">
              </div>
              <div class="form-group">
                <label for="modalBigBlindInput">Big Blind ($)</label>
                <input type="number" id="modalBigBlindInput" class="form-input" placeholder="0.00" step="0.01" min="0">
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
                <label for="modalStartTimeInput">Start Time</label>
                <div class="datetime-display-wrapper">
                  <div class="datetime-display" id="modalStartTimeDisplay" onclick="document.getElementById('modalStartTimeInput').click()"></div>
                  <input type="datetime-local" id="modalStartTimeInput" class="form-input datetime-picker-input" style="display: none;">
                </div>
              </div>
              <div class="form-group">
                <label for="modalEndTimeInput">End Time</label>
                <div class="datetime-display-wrapper">
                  <div class="datetime-display" id="modalEndTimeDisplay" onclick="document.getElementById('modalEndTimeInput').click()"></div>
                  <input type="datetime-local" id="modalEndTimeInput" class="form-input datetime-picker-input" style="display: none;">
                </div>
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
      this.ensureAutoSaveListeners();
      this.populateLocationDropdown();

      // Initialize custom datetime pickers for modal inputs
      if (window.PokerTracker && window.PokerTracker.DateTimePicker) {
        PokerTracker.DateTimePicker.attachToInput('#modalStartTimeInput', { includeTime: true });
        PokerTracker.DateTimePicker.attachToInput('#modalEndTimeInput', { includeTime: true });
      }
    },

    populateLocationDropdown() {
      if (!PT.DataStore || !PT.Dropdowns) return;

      // Get all unique locations from existing sessions
      const sessions = PT.DataStore.getSessions();
      const locations = new Set();

      sessions.forEach(session => {
        if (session.location && session.location.trim()) {
          locations.add(session.location.trim());
        }
      });

      // Create options array for SlimSelect
      const options = [
        { value: '', text: 'Select location...', placeholder: true },
        { value: '+ Location', text: '+ Location' }
      ];

      // Add existing locations in alphabetical order
      const sortedLocations = Array.from(locations).sort();
      sortedLocations.forEach(location => {
        options.push({ value: location, text: location });
      });

      // Initialize or update SlimSelect
      PT.Dropdowns.setOptions('modalLocationSelect', options);
      if (!PT.Dropdowns.get('modalLocationSelect')) {
        PT.Dropdowns.init('modalLocationSelect', {
          placeholder: 'Select location...',
          settings: {
            allowDeselect: true,
            showSearch: false
          }
        });
      }
    },

    handleLocationChange() {
      const locationSelect = document.getElementById('modalLocationSelect');
      const locationInput = document.getElementById('modalLocationInput');

      if (!locationSelect || !locationInput) return;

      if (locationSelect.value === '+ Location') {
        // Show input for new location
        const slimInstance = PT.Dropdowns.get('modalLocationSelect');
        if (slimInstance && slimInstance.container) {
          slimInstance.container.style.display = 'none';
        }
        locationInput.style.display = 'block';
        locationInput.value = '';

        // iOS-specific focus handling
        setTimeout(() => {
          locationInput.focus();
          // Double-focus for iOS Safari
          setTimeout(() => {
            if (document.activeElement !== locationInput) {
              locationInput.focus();
            }
          }, 50);
        }, 100);
      } else {
        // Use selected location
        locationInput.style.display = 'none';
        const slimInstance = PT.Dropdowns.get('modalLocationSelect');
        if (slimInstance && slimInstance.container) {
          slimInstance.container.style.display = 'block';
        }

        // Update the session with selected location
        if (this.currentSessionId) {
          const location = locationSelect.value || null;
          this.handleFieldUpdates({ location });
        }
      }
    },

    handleLocationInputBlur() {
      const locationSelect = document.getElementById('modalLocationSelect');
      const locationInput = document.getElementById('modalLocationInput');

      if (!locationSelect || !locationInput) return;

      // Longer delay for iOS to handle virtual keyboard and focus properly
      setTimeout(() => {
        // Check if the input is still focused (user might have tapped back into it)
        if (document.activeElement === locationInput) return;

        // Additional check for iOS - make sure we're not in the middle of text input
        if (locationInput.value !== locationInput.defaultValue && document.activeElement !== locationInput) {
          // User is actively typing, don't close yet
          return;
        }

        const newLocation = locationInput.value.trim();

        if (newLocation) {
          // Add new location to dropdown and select it
          this.populateLocationDropdown();
          PT.Dropdowns.setValue('modalLocationSelect', newLocation);

          // Update the session
          if (this.currentSessionId) {
            this.handleFieldUpdates({ location: newLocation });
          }
        } else {
          // No location entered, reset to empty selection
          PT.Dropdowns.setValue('modalLocationSelect', '');

          // Update the session to clear location
          if (this.currentSessionId) {
            this.handleFieldUpdates({ location: null });
          }
        }

        // Switch back to dropdown
        locationInput.style.display = 'none';
        const slimInstance = PT.Dropdowns.get('modalLocationSelect');
        if (slimInstance && slimInstance.container) {
          slimInstance.container.style.display = 'block';
        }
      }, 300);
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

      const locationSelect = document.getElementById('modalLocationSelect');
      const locationInput = document.getElementById('modalLocationInput');
      const smallBlindInput = document.getElementById('modalSmallBlindInput');
      const bigBlindInput = document.getElementById('modalBigBlindInput');
      const buyInInput = document.getElementById('modalBuyInInput');
      const cashOutInput = document.getElementById('modalCashOutInput');
      const notesInput = document.getElementById('modalSessionNotes');
      const startTimeInput = document.getElementById('modalStartTimeInput');
      const endTimeInput = document.getElementById('modalEndTimeInput');

      // Handle location dropdown/input
      if (locationSelect && locationInput) {
        this.populateLocationDropdown();
        if (session.location) {
          PT.Dropdowns.setValue('modalLocationSelect', session.location);
        } else {
          PT.Dropdowns.setValue('modalLocationSelect', '');
        }
        locationInput.style.display = 'none';
        const slimInstance = PT.Dropdowns.get('modalLocationSelect');
        if (slimInstance && slimInstance.container) {
          slimInstance.container.style.display = 'block';
        }
      }

      if (smallBlindInput) smallBlindInput.value = session.smallBlind ?? '';
      if (bigBlindInput) bigBlindInput.value = session.bigBlind ?? '';
      if (buyInInput) buyInInput.value = session.buyIn || '';
      if (cashOutInput) cashOutInput.value = session.cashOut || '';
      if (notesInput) notesInput.value = session.notes || '';

      if (startTimeInput) {
        startTimeInput.value = this.formatDateTimeForInput(session.startTime);
        this.updateDateTimeDisplay('modalStartTimeInput', 'modalStartTimeDisplay');
      }
      if (endTimeInput) {
        endTimeInput.value = this.formatDateTimeForInput(session.endTime);
        this.updateDateTimeDisplay('modalEndTimeInput', 'modalEndTimeDisplay');
      }

      const endBtn = document.getElementById('modalEndSessionBtn');
      if (endBtn && PT.DataStore) {
        const isActive = PT.DataStore.getActiveSession()?.id === this.currentSessionId;
        endBtn.style.display = isActive ? 'inline-block' : 'none';
      }
    },

    parseNumericInput(value) {
      if (value === '' || value === null || typeof value === 'undefined') return 0;
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    },

    parseStakeInput(value) {
      if (value === '' || value === null || typeof value === 'undefined') return null;
      const parsed = parseFloat(value);
      if (!Number.isFinite(parsed) || parsed <= 0) return null;
      return Math.round(parsed * 100) / 100;
    },

    formatDateTimeForInput(value) {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const pad = num => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    },

    formatDateTimeForDisplay(value) {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';

      const isMobile = window.innerWidth < 768;
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      if (hours === 0) hours = 12;

      const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}${ampm}`;

      if (isMobile) {
        return `${month}/${day} ${timeStr}`;
      } else {
        return `${month}/${day}/${year} ${timeStr}`;
      }
    },

    updateDateTimeDisplay(inputId, displayId) {
      const input = document.getElementById(inputId);
      const display = document.getElementById(displayId);

      if (!input || !display) return;

      if (input.value) {
        display.textContent = this.formatDateTimeForDisplay(input.value);
        display.classList.remove('empty');
      } else {
        display.textContent = 'Select date & time';
        display.classList.add('empty');
      }
    },

    normalizeDateTimeInput(value) {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString();
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

      // Add location dropdown change listener
      const locationSelect = document.getElementById('modalLocationSelect');
      if (locationSelect) {
        locationSelect.addEventListener('change', () => this.handleLocationChange());
      }

      // Add location input blur listener
      const locationInput = document.getElementById('modalLocationInput');
      if (locationInput) {
        // Use focusout instead of blur for better iOS compatibility
        locationInput.addEventListener('focusout', () => this.handleLocationInputBlur());

        // Add input event to track active typing
        locationInput.addEventListener('input', () => {
          locationInput.defaultValue = locationInput.value;
        });

        locationInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            locationInput.blur();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            locationInput.value = '';
            locationInput.blur();
          }
        });

        // iOS-specific touch event to ensure input can receive focus
        locationInput.addEventListener('touchstart', (event) => {
          event.stopPropagation();
        });
      }

      const fieldConfigs = [
        {
          id: 'modalSmallBlindInput',
          event: 'input',
          getUpdates: element => ({ smallBlind: this.parseStakeInput(element.value) })
        },
        {
          id: 'modalBigBlindInput',
          event: 'input',
          getUpdates: element => ({ bigBlind: this.parseStakeInput(element.value) })
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
          id: 'modalStartTimeInput',
          event: 'change',
          getUpdates: element => {
            this.updateDateTimeDisplay('modalStartTimeInput', 'modalStartTimeDisplay');
            return { startTime: this.normalizeDateTimeInput(element.value) };
          }
        },
        {
          id: 'modalEndTimeInput',
          event: 'change',
          getUpdates: element => {
            this.updateDateTimeDisplay('modalEndTimeInput', 'modalEndTimeDisplay');
            return { endTime: this.normalizeDateTimeInput(element.value) };
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

        if (config.id === 'modalBuyInInput' || config.id === 'modalCashOutInput' || config.id === 'modalSmallBlindInput' || config.id === 'modalBigBlindInput') {
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

      // Get location from dropdown or input
      const locationSelect = document.getElementById('modalLocationSelect');
      const locationInput = document.getElementById('modalLocationInput');
      let location = null;

      // Check SlimSelect dropdown first
      const slimInstance = PT.Dropdowns.get('modalLocationSelect');
      if (slimInstance && slimInstance.container && slimInstance.container.style.display !== 'none') {
        const selectedValue = locationSelect.value;
        location = selectedValue && selectedValue !== '+ Location' ? selectedValue : null;
      } else if (locationInput && locationInput.style.display !== 'none') {
        location = locationInput.value.trim() || null;
      }

      const updates = {
        location: location,
        smallBlind: this.parseStakeInput(document.getElementById('modalSmallBlindInput')?.value),
        bigBlind: this.parseStakeInput(document.getElementById('modalBigBlindInput')?.value),
        buyIn: this.parseNumericInput(document.getElementById('modalBuyInInput')?.value),
        cashOut: this.parseNumericInput(document.getElementById('modalCashOutInput')?.value),
        startTime: this.normalizeDateTimeInput(document.getElementById('modalStartTimeInput')?.value),
        endTime: this.normalizeDateTimeInput(document.getElementById('modalEndTimeInput')?.value),
        notes: document.getElementById('modalSessionNotes')?.value || ''
      };

      this.handleFieldUpdates(updates);
    },

    endSession() {
      if (!this.currentSessionId || !PT.DataStore) return;

      if (!confirm('Are you sure you want to end this session?')) {
        return;
      }

      const endTimeIso = new Date().toISOString();
      const endTimeInput = document.getElementById('modalEndTimeInput');
      if (endTimeInput) {
        endTimeInput.value = this.formatDateTimeForInput(endTimeIso);
        this.updateDateTimeDisplay('modalEndTimeInput', 'modalEndTimeDisplay');
      }

      this.handleFieldUpdates({ endTime: endTimeIso });

      PT.DataStore.endActiveSession(this.currentSessionId, { endTime: endTimeIso });
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

    // Handle window resize to update datetime display formatting
    window.addEventListener('resize', () => {
      if (SessionModal.currentSessionId) {
        SessionModal.updateDateTimeDisplay('modalStartTimeInput', 'modalStartTimeDisplay');
        SessionModal.updateDateTimeDisplay('modalEndTimeInput', 'modalEndTimeDisplay');
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
