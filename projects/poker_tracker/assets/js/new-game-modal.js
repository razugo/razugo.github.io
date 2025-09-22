(function(window, document) {
  window.PokerTracker = window.PokerTracker || {};
  const PT = window.PokerTracker;
  let initialized = false;

  function getMarkup() {
    return `
      <div id="newGameModal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Create New Game</h3>
            <button class="modal-close" data-action="close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group" data-field="gameName">
              <label for="gameNameInput">Game Name *</label>
              <input type="text" id="gameNameInput" class="form-input" placeholder="e.g., Aria 1/3" required>
            </div>
            <div class="form-group">
              <label for="gameLocationInput">Location</label>
              <input type="text" id="gameLocationInput" class="form-input" placeholder="e.g., Aria Casino">
            </div>
            <div class="form-group">
              <label for="smallBlindInput">Small Blind</label>
              <input type="number" id="smallBlindInput" class="form-input" placeholder="1" step="0.01" min="0.01">
            </div>
            <div class="form-group">
              <label for="bigBlindInput">Big Blind</label>
              <input type="number" id="bigBlindInput" class="form-input" placeholder="3" step="0.01" min="0.01">
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
    let modal = document.getElementById('newGameModal');
    if (modal) return modal;

    const host = document.querySelector('[data-component="new-game-modal"]');
    if (host) {
      host.innerHTML = getMarkup();
      modal = host.querySelector('#newGameModal');
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
      inputs: {
        name: modal.querySelector('#gameNameInput'),
        location: modal.querySelector('#gameLocationInput'),
        smallBlind: modal.querySelector('#smallBlindInput'),
        bigBlind: modal.querySelector('#bigBlindInput')
      },
      closeButtons: modal.querySelectorAll('[data-action="close"], [data-action="cancel"]'),
      createButton: modal.querySelector('[data-action="create"]')
    };
  }

  function bindEvents() {
    if (initialized) return;
    const { modal, inputs, closeButtons, createButton } = getElements();

    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    createButton.addEventListener('click', handleCreate);

    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', handleEscape);

    Object.values(inputs).forEach(input => {
      input.addEventListener('input', () => clearErrors(input));
      if (input.type === 'number' && input.step === '0.01') {
        input.addEventListener('input', enforceDecimalPlaces);
      }
    });

    initialized = true;
  }

  function handleEscape(event) {
    if (event.key === 'Escape') {
      const modal = document.getElementById('newGameModal');
      if (modal && modal.style.display === 'flex') {
        closeModal();
      }
    }
  }

  function enforceDecimalPlaces(event) {
    const value = event.target.value;
    const dotIndex = value.indexOf('.');
    if (dotIndex !== -1 && value.length - dotIndex - 1 > 2) {
      event.target.value = value.slice(0, dotIndex + 3);
    }
  }

  function openModal() {
    bindEvents();
    const { modal, inputs } = getElements();
    resetForm(inputs);
    modal.style.display = 'flex';
    inputs.name.focus();
  }

  function closeModal() {
    const { modal, inputs } = getElements();
    modal.style.display = 'none';
    resetForm(inputs);
  }

  function resetForm(inputs) {
    Object.values(inputs).forEach(input => {
      input.value = '';
      clearErrors(input);
    });
  }

  function clearErrors(input) {
    if (!input) return;
    input.classList.remove('error');
    const group = input.closest('.form-group');
    if (group) {
      group.classList.remove('error');
    }
  }

  function flagError(input) {
    if (!input) return;
    input.classList.add('error');
    const group = input.closest('.form-group');
    if (group) {
      group.classList.add('error');
    }
    input.focus();
  }

  function parseCurrency(input) {
    if (!input || !input.value.trim()) return null;
    const value = Number.parseFloat(input.value);
    if (!Number.isFinite(value) || value <= 0) return NaN;
    return Math.round(value * 100) / 100;
  }

  function handleCreate() {
    if (!PT.DataStore) {
      console.error('PokerTracker.DataStore unavailable. Cannot create game.');
      return;
    }

    const { inputs } = getElements();
    const name = inputs.name.value.trim();
    const location = inputs.location.value.trim();
    const smallBlind = parseCurrency(inputs.smallBlind);
    const bigBlind = parseCurrency(inputs.bigBlind);

    let valid = true;

    if (!name) {
      flagError(inputs.name);
      valid = false;
    }

    if (Number.isNaN(smallBlind)) {
      flagError(inputs.smallBlind);
      valid = false;
    }

    if (Number.isNaN(bigBlind)) {
      flagError(inputs.bigBlind);
      valid = false;
    }

    if (valid && smallBlind !== null && bigBlind !== null && bigBlind <= smallBlind) {
      flagError(inputs.bigBlind);
      valid = false;
    }

    if (!valid) {
      return;
    }

    PT.DataStore.createGame(
      name,
      location || '-',
      Number.isFinite(smallBlind) ? smallBlind : null,
      Number.isFinite(bigBlind) ? bigBlind : null
    );

    closeModal();

    if (window.location.pathname.includes('games')) {
      window.location.reload();
    }
  }

  PT.GameModal = PT.GameModal || {};
  PT.GameModal.showNewGameModal = openModal;
  PT.GameModal.closeNewGameModal = closeModal;
  PT.GameModal.createNewGame = handleCreate;

  document.addEventListener('DOMContentLoaded', () => {
    ensureModal();
    bindEvents();
  });
})(window, document);
