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
            <div class="form-group" data-field="sessionName">
              <label for="sessionNameInput">Session Name *</label>
              <input type="text" id="sessionNameInput" class="form-input" placeholder="Enter session name" required>
            </div>
            <div class="form-group">
              <label class="toggle-container">
                <input type="checkbox" id="liveToggle" class="toggle-input">
                <span class="toggle-slider"></span>
                <span class="toggle-label">Live Session</span>
              </label>
            </div>
            <div class="session-form-section" data-section="details" style="display: none;">
              <div class="session-form-grid session-form-grid-name-game">
                <div class="form-group">
                  <label for="newSessionGameSelect">Game</label>
                  <select id="newSessionGameSelect" class="form-input">
                    <option value="">Select Game</option>
                  </select>
                </div>
                <div class="form-group" data-field="buyIn">
                  <label for="newSessionBuyInInput">Buy In</label>
                  <input type="number" id="newSessionBuyInInput" class="form-input" placeholder="0.00" step="0.01" min="0">
                </div>
              </div>
              <div class="session-form-grid session-form-grid-finance">
                <div class="form-group" data-field="cashOut">
                  <label for="newSessionCashOutInput">Cash Out</label>
                  <input type="number" id="newSessionCashOutInput" class="form-input" placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="form-group">
                  <label for="newSessionDurationInput">Duration (hrs)</label>
                  <input type="number" id="newSessionDurationInput" class="form-input" placeholder="0" step="0.25" min="0">
                </div>
              </div>
              <div class="session-form-grid session-form-grid-time">
                <div class="form-group">
                  <label for="newSessionDateInput">Session Date</label>
                  <input type="text" id="newSessionDateInput" class="form-input date-picker-input" placeholder="YYYY-MM-DD" autocomplete="off">
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
      nameInput: modal.querySelector('#sessionNameInput'),
      liveToggle: modal.querySelector('#liveToggle'),
      closeButtons: modal.querySelectorAll('[data-action="close"], [data-action="cancel"]'),
      createButton: modal.querySelector('[data-action="create"]'),
      nameGroup: modal.querySelector('[data-field="sessionName"]'),
      detailsSection: modal.querySelector('[data-section="details"]'),
      gameSelect: modal.querySelector('#newSessionGameSelect'),
      buyInInput: modal.querySelector('#newSessionBuyInInput'),
      cashOutInput: modal.querySelector('#newSessionCashOutInput'),
      dateInput: modal.querySelector('#newSessionDateInput'),
      durationInput: modal.querySelector('#newSessionDurationInput'),
      notesInput: modal.querySelector('#newSessionNotesInput')
    };
  }

  function initEnhancements() {
    if (enhancementsInitialized) return;

    const { gameSelect, dateInput } = getElements();

    if (gameSelect && PT.Dropdowns && typeof PT.Dropdowns.init === 'function') {
      PT.Dropdowns.init('newSessionGameSelect', {
        placeholder: 'Select Game',
        placeholderText: 'Select Game',
        settings: {
          allowDeselect: true,
          showSearch: true,
          placeholderText: 'Select Game'
        }
      });
    }

    if (dateInput && PT.DatePickers && typeof PT.DatePickers.initDateField === 'function') {
      PT.DatePickers.initDateField('newSessionDateInput', {
        altInput: true,
        altFormat: 'M j, Y',
        altInputClass: 'form-input flatpickr-alt-input',
        clearLabel: 'Clear'
      });
    }

    enhancementsInitialized = true;
  }

  function populateGameOptions(selectedValue) {
    const { gameSelect } = getElements();
    if (!gameSelect || !PT.DataStore || typeof PT.DataStore.getAllGames !== 'function') return;

    const games = PT.DataStore.getAllGames();
    const options = [{ text: 'Select Game', value: '', placeholder: true }];

    games.forEach(game => {
      options.push({ text: game.name, value: game.id });
    });

    if (PT.Dropdowns && typeof PT.Dropdowns.setOptions === 'function') {
      PT.Dropdowns.setOptions('newSessionGameSelect', options, selectedValue || '');
    } else {
      gameSelect.innerHTML = '';
      options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        if (option.value === (selectedValue || '')) {
          opt.selected = true;
        }
        gameSelect.appendChild(opt);
      });
    }
  }

  function resetDateInput() {
    const { dateInput } = getElements();
    if (!dateInput) return;
    if (PT.DatePickers && PT.DatePickers.setDate) {
      PT.DatePickers.setDate('newSessionDateInput', null, false);
    } else {
      dateInput.value = '';
    }
  }

  function coerceMoney(value) {
    if (value === null || typeof value === 'undefined' || value === '') return 0;
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(numeric) || numeric < 0) return 0;
    return Math.round(numeric * 100) / 100;
  }

  function coerceDuration(value) {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(numeric) || numeric < 0) return null;
    return Math.round(numeric * 100) / 100;
  }

  function normalizeGameValue(value) {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  function resetForm() {
    const {
      nameInput,
      liveToggle,
      detailsSection,
      gameSelect,
      buyInInput,
      cashOutInput,
      durationInput,
      notesInput
    } = getElements();

    if (nameInput) {
      nameInput.value = '';
      nameInput.classList.remove('error');
    }
    if (liveToggle) {
      liveToggle.checked = false;
    }
    if (detailsSection) {
      detailsSection.style.display = 'none';
    }
    if (gameSelect) {
      gameSelect.value = '';
      if (PT.Dropdowns && typeof PT.Dropdowns.setValue === 'function') {
        PT.Dropdowns.setValue('newSessionGameSelect', '', false);
      }
    }
    if (buyInInput) buyInInput.value = '';
    if (cashOutInput) cashOutInput.value = '';
    if (durationInput) durationInput.value = '';
    if (notesInput) notesInput.value = '';
    resetDateInput();
  }

  function updateDetailsVisibility(isLive) {
    const { detailsSection, createButton } = getElements();
    if (detailsSection) {
      detailsSection.style.display = isLive ? 'none' : 'block';
    }
    if (createButton) {
      createButton.textContent = isLive ? 'Start Live Session' : 'Create Session';
    }
  }

  function bindEvents() {
    if (initialized) return;
    const {
      modal,
      nameInput,
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

    nameInput.addEventListener('input', clearErrors);
    liveToggle.addEventListener('change', () => {
      clearErrors();
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
    populateGameOptions('');
    resetForm();

    const { modal, liveToggle } = getElements();
    const openAsLive = Boolean(preToggleLive);
    liveToggle.checked = openAsLive;
    updateDetailsVisibility(openAsLive);

    modal.style.display = 'flex';
    modal.querySelector('#sessionNameInput').focus();
  }

  function closeModal() {
    const { modal, nameGroup } = getElements();
    modal.style.display = 'none';
    resetForm();
    if (nameGroup) {
      nameGroup.classList.remove('error');
    }
  }

  function clearErrors() {
    const { nameInput, nameGroup } = getElements();
    nameInput.classList.remove('error');
    if (nameGroup) {
      nameGroup.classList.remove('error');
    }
  }

  function handleCreate() {
    const {
      nameInput,
      liveToggle,
      nameGroup,
      gameSelect,
      buyInInput,
      cashOutInput,
      dateInput,
      durationInput,
      notesInput
    } = getElements();
    const sessionName = nameInput.value.trim();

    if (!sessionName) {
      nameInput.classList.add('error');
      if (nameGroup) {
        nameGroup.classList.add('error');
      }
      nameInput.focus();
      return;
    }

    if (!PT.DataStore) {
      console.error('PokerTracker.DataStore unavailable. Cannot create session.');
      return;
    }

    const isLive = liveToggle.checked;
    let newSession = null;

    if (isLive) {
      newSession = PT.DataStore.createLiveSession(null, 0);
      PT.DataStore.updateSession(newSession.id, { name: sessionName });
    } else {
      const gameId = normalizeGameValue(gameSelect ? gameSelect.value : null);
      const buyIn = coerceMoney(buyInInput ? buyInInput.value : 0);
      const cashOutRaw = cashOutInput ? cashOutInput.value : '';
      const cashOut = cashOutRaw === '' ? buyIn : coerceMoney(cashOutRaw);
      const durationHours = coerceDuration(durationInput ? durationInput.value : null);
      const sessionDate = dateInput ? (dateInput.value || '') : '';
      const notes = notesInput ? notesInput.value.trim() : '';

      newSession = PT.DataStore.createSession(gameId, buyIn);

      const updates = {
        name: sessionName,
        gameId: gameId,
        buyIn: buyIn,
        cashOut: cashOut,
        sessionDate: sessionDate || null,
        durationHours: durationHours,
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
