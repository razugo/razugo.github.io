(function(window, document) {
  window.PokerTracker = window.PokerTracker || {};
  const PT = window.PokerTracker;

  const DEFAULT_SESSION_ROUTE = '/projects/poker_tracker/session/';
  let initialized = false;
  let enhancementsInitialized = false;

  function getMarkup() {
    return `
      <div id="newSessionModal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Create New Session</h3>
            <button class="modal-close" data-action="close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="toggle-container">
                <input type="checkbox" id="liveToggle" class="toggle-input">
                <span class="toggle-slider"></span>
                <span class="toggle-label">Live Session</span>
              </label>
            </div>
            <div class="session-form-section" data-section="details" style="display: none;">
              <div class="form-group" data-field="location">
                <label for="newSessionLocationSelect">Location</label>
                <select id="newSessionLocationSelect" class="form-input">
                  <option value="">Select location...</option>
                </select>
                <input type="text" id="newSessionLocationInput" class="form-input" placeholder="Enter new location" style="display: none;">
              </div>
              <div class="session-form-grid session-form-grid-stakes">
                <div class="form-group">
                  <label for="newSessionSmallBlindInput">Small Blind ($)</label>
                  <input type="number" id="newSessionSmallBlindInput" class="form-input" placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="form-group">
                  <label for="newSessionBigBlindInput">Big Blind ($)</label>
                  <input type="number" id="newSessionBigBlindInput" class="form-input" placeholder="0.00" step="0.01" min="0">
                </div>
              </div>
              <div class="session-form-grid session-form-grid-finance">
                <div class="form-group" data-field="buyIn">
                  <label for="newSessionBuyInInput">Buy In</label>
                  <input type="number" id="newSessionBuyInInput" class="form-input" placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="form-group" data-field="cashOut">
                  <label for="newSessionCashOutInput">Cash Out</label>
                  <input type="number" id="newSessionCashOutInput" class="form-input" placeholder="0.00" step="0.01" min="0">
                </div>
              </div>
              <div class="session-form-grid session-form-grid-time">
                <div class="form-group">
                  <label for="newSessionStartTimeInput">Start Time</label>
                  <input type="datetime-local" id="newSessionStartTimeInput" class="form-input datetime-picker-input">
                </div>
                <div class="form-group">
                  <label for="newSessionEndTimeInput">End Time</label>
                  <input type="datetime-local" id="newSessionEndTimeInput" class="form-input datetime-picker-input">
                </div>
              </div>
              <div class="form-group">
                <label for="newSessionNotesInput">Session Notes</label>
                <textarea id="newSessionNotesInput" class="form-input" placeholder="Session notes..." style="min-height: 60px; resize: vertical;"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="create">Create</button>
          </div>
        </div>
      </div>
    `;
  }

  function ensureModal() {
    let modal = document.getElementById('newSessionModal');
    if (modal) {
      return modal;
    }

    const host = document.querySelector('[data-component="new-session-modal"]');
    if (host) {
      host.innerHTML = getMarkup();
      modal = host.querySelector('#newSessionModal');
    } else {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = getMarkup();
      modal = wrapper.firstElementChild;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function getElements() {
    const modal = ensureModal();
    return {
      modal,
      liveToggle: modal.querySelector('#liveToggle'),
      closeButtons: modal.querySelectorAll('[data-action="close"], [data-action="cancel"]'),
      createButton: modal.querySelector('[data-action="create"]'),
      detailsSection: modal.querySelector('[data-section="details"]'),
      locationSelect: modal.querySelector('#newSessionLocationSelect'),
      locationInput: modal.querySelector('#newSessionLocationInput'),
      smallBlindInput: modal.querySelector('#newSessionSmallBlindInput'),
      bigBlindInput: modal.querySelector('#newSessionBigBlindInput'),
      buyInInput: modal.querySelector('#newSessionBuyInInput'),
      cashOutInput: modal.querySelector('#newSessionCashOutInput'),
      startTimeInput: modal.querySelector('#newSessionStartTimeInput'),
      endTimeInput: modal.querySelector('#newSessionEndTimeInput'),
      notesInput: modal.querySelector('#newSessionNotesInput')
    };
  }

  function initEnhancements() {
    if (enhancementsInitialized) return;
    enhancementsInitialized = true;

    // Initialize custom datetime pickers for modal inputs
    if (window.PokerTracker && window.PokerTracker.DateTimePicker) {
      PokerTracker.DateTimePicker.attachToInput('#newSessionStartTimeInput', { includeTime: true });
      PokerTracker.DateTimePicker.attachToInput('#newSessionEndTimeInput', { includeTime: true });
    }

    // Set up location dropdown event listeners
    setupLocationHandlers();
  }

  function populateLocationDropdown() {
    const locationSelect = document.getElementById('newSessionLocationSelect');
    if (!locationSelect || !PT.DataStore) return;

    // Get all unique locations from existing sessions
    const sessions = PT.DataStore.getSessions();
    const locations = new Set();

    sessions.forEach(session => {
      if (session.location && session.location.trim()) {
        locations.add(session.location.trim());
      }
    });

    // Clear existing options except the first one
    while (locationSelect.children.length > 1) {
      locationSelect.removeChild(locationSelect.lastChild);
    }

    // Add + Location option
    const addNewOption = document.createElement('option');
    addNewOption.value = '+ Location';
    addNewOption.textContent = '+ Location';
    locationSelect.appendChild(addNewOption);

    // Add existing locations in alphabetical order
    const sortedLocations = Array.from(locations).sort();
    sortedLocations.forEach(location => {
      const option = document.createElement('option');
      option.value = location;
      option.textContent = location;
      locationSelect.appendChild(option);
    });
  }

  function handleLocationChange() {
    const { locationSelect, locationInput } = getElements();

    if (!locationSelect || !locationInput) return;

    if (locationSelect.value === '+ Location') {
      // Show input for new location
      locationSelect.style.display = 'none';
      locationInput.style.display = 'block';
      locationInput.value = '';
      locationInput.focus();
    } else {
      // Use selected location
      locationInput.style.display = 'none';
      locationSelect.style.display = 'block';
    }
  }

  function handleLocationInputBlur() {
    const { locationSelect, locationInput } = getElements();

    if (!locationSelect || !locationInput) return;

    const newLocation = locationInput.value.trim();

    if (newLocation) {
      // Add new location to dropdown and select it
      populateLocationDropdown();
      locationSelect.value = newLocation;
    } else {
      // No location entered, reset to empty selection
      locationSelect.value = '';
    }

    // Switch back to dropdown
    locationInput.style.display = 'none';
    locationSelect.style.display = 'block';
  }

  function setupLocationHandlers() {
    const { locationSelect, locationInput } = getElements();

    if (locationSelect && !locationSelect.dataset.bound) {
      locationSelect.addEventListener('change', handleLocationChange);
      locationSelect.dataset.bound = 'true';
    }

    if (locationInput && !locationInput.dataset.bound) {
      locationInput.addEventListener('blur', handleLocationInputBlur);
      locationInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleLocationInputBlur();
        }
      });
      locationInput.dataset.bound = 'true';
    }
  }

  function coerceMoney(value) {
    if (value === null || typeof value === 'undefined' || value === '') return 0;
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(numeric) || numeric < 0) return 0;
    return Math.round(numeric * 100) / 100;
  }

  function coerceStake(value) {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return Math.round(numeric * 100) / 100;
  }

  function normalizeDateTimeInput(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  function resetForm() {
    const {
      liveToggle,
      detailsSection,
      locationSelect,
      locationInput,
      smallBlindInput,
      bigBlindInput,
      startTimeInput,
      endTimeInput,
      buyInInput,
      cashOutInput,
      notesInput
    } = getElements();

    if (liveToggle) {
      liveToggle.checked = false;
    }
    if (detailsSection) {
      detailsSection.style.display = 'block'; // Always show all options
    }

    // Reset location dropdown/input
    if (locationSelect && locationInput) {
      locationSelect.value = '';
      locationInput.value = '';
      locationSelect.style.display = 'block';
      locationInput.style.display = 'none';
    }

    if (smallBlindInput) smallBlindInput.value = '';
    if (bigBlindInput) bigBlindInput.value = '';
    if (startTimeInput) startTimeInput.value = '';
    if (endTimeInput) endTimeInput.value = '';
    if (buyInInput) buyInInput.value = '';
    if (cashOutInput) cashOutInput.value = '';
    if (notesInput) notesInput.value = '';
  }

  function updateDetailsVisibility(isLive) {
    const { detailsSection, createButton, startTimeInput } = getElements();
    if (detailsSection) {
      detailsSection.style.display = 'block'; // Always show all options
    }
    if (createButton) {
      createButton.textContent = isLive ? 'Start Live Session' : 'Create Session';
    }

    // Handle start time population/clearing
    if (startTimeInput) {
      if (isLive) {
        // Populate with current time when live session is turned on
        const now = new Date();
        const pad = num => String(num).padStart(2, '0');
        const formattedNow = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        startTimeInput.value = formattedNow;
      } else {
        // Clear start time when live session is turned off
        startTimeInput.value = '';
      }
    }
  }

  function bindEvents() {
    if (initialized) return;
    const {
      modal,
      liveToggle,
      closeButtons,
      createButton
    } = getElements();

    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    createButton.addEventListener('click', handleCreate);

    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', handleEscape);

    liveToggle.addEventListener('change', () => {
      updateDetailsVisibility(liveToggle.checked);
    });

    initialized = true;
  }

  function handleEscape(event) {
    if (event.key === 'Escape') {
      const modal = document.getElementById('newSessionModal');
      if (modal && modal.style.display === 'flex') {
        closeModal();
      }
    }
  }

  function openModal(preToggleLive) {
    ensureModal();
    bindEvents();
    initEnhancements();
    resetForm();
    populateLocationDropdown();

    const { modal, liveToggle } = getElements();
    const openAsLive = Boolean(preToggleLive);
    liveToggle.checked = openAsLive;
    updateDetailsVisibility(openAsLive);

    modal.style.display = 'flex';
  }

  function closeModal() {
    const { modal } = getElements();
    modal.style.display = 'none';
    resetForm();
  }

  function handleCreate() {
    const {
      liveToggle,
      locationInput,
      smallBlindInput,
      bigBlindInput,
      buyInInput,
      cashOutInput,
      startTimeInput,
      endTimeInput,
      notesInput
    } = getElements();

    if (!PT.DataStore) {
      console.error('PokerTracker.DataStore unavailable. Cannot create session.');
      return;
    }

    const isLive = liveToggle.checked;
    let newSession = null;

    if (isLive) {
      newSession = PT.DataStore.createLiveSession(0);
    } else {
      // Get location from dropdown or input
      const { locationSelect, locationInput } = getElements();
      let location = '';

      if (locationSelect && locationSelect.style.display !== 'none') {
        location = locationSelect.value && locationSelect.value !== '+ Location' ? locationSelect.value : '';
      } else if (locationInput && locationInput.style.display !== 'none') {
        location = locationInput.value.trim();
      }

      const smallBlind = coerceStake(smallBlindInput ? smallBlindInput.value : null);
      const bigBlind = coerceStake(bigBlindInput ? bigBlindInput.value : null);
      const buyIn = coerceMoney(buyInInput ? buyInInput.value : 0);
      const cashOutRaw = cashOutInput ? cashOutInput.value : '';
      const cashOut = cashOutRaw === '' ? buyIn : coerceMoney(cashOutRaw);
      const startTime = normalizeDateTimeInput(startTimeInput ? startTimeInput.value : null);
      const endTime = normalizeDateTimeInput(endTimeInput ? endTimeInput.value : null);
      const notes = notesInput ? notesInput.value.trim() : '';

      if (startTime && endTime) {
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        if (endDate.getTime() < startDate.getTime()) {
          alert('End time must be after start time.');
          return;
        }
      }

      newSession = PT.DataStore.createSession(buyIn);

      const updates = {
        location: location || null,
        smallBlind: smallBlind,
        bigBlind: bigBlind,
        buyIn: buyIn,
        cashOut: cashOut,
        startTime: startTime,
        endTime: endTime,
        notes: notes
      };
      PT.DataStore.updateSession(newSession.id, updates);
    }

    if (isLive && typeof window.updateLiveSessionNavLink === 'function') {
      window.updateLiveSessionNavLink();
    }

    closeModal();

    document.dispatchEvent(new CustomEvent('pokertracker:session-created', {
      detail: {
        sessionId: newSession.id,
        live: isLive
      }
    }));

    if (isLive) {
      const sessionRoute = (PT.routes && PT.routes.session) || DEFAULT_SESSION_ROUTE;
      window.location.href = `${sessionRoute}?session_id=${newSession.id}`;
    }
  }

  PT.Modal = PT.Modal || {};
  PT.Modal.showNewSessionModal = function(preToggleLive) {
    openModal(Boolean(preToggleLive));
  };
  PT.Modal.closeNewSessionModal = closeModal;
  PT.Modal.createNewSession = handleCreate;

  document.addEventListener('DOMContentLoaded', () => {
    ensureModal();
    bindEvents();
  });
})(window, document);
