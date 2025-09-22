(function(window, document) {
  window.PokerTracker = window.PokerTracker || {};
  const PT = window.PokerTracker;

  const DEFAULT_SESSION_ROUTE = '/projects/poker_tracker/session/';
  let initialized = false;

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
      nameGroup: modal.querySelector('[data-field="sessionName"]')
    };
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
    liveToggle.addEventListener('change', clearErrors);

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
    bindEvents();
    const { modal, liveToggle } = getElements();
    if (preToggleLive) {
      liveToggle.checked = true;
    }
    modal.style.display = 'flex';
    modal.querySelector('#sessionNameInput').focus();
  }

  function closeModal() {
    const { modal, nameInput, liveToggle, nameGroup } = getElements();
    modal.style.display = 'none';
    nameInput.value = '';
    liveToggle.checked = false;
    nameInput.classList.remove('error');
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
    const { nameInput, liveToggle, nameGroup } = getElements();
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
    const createFn = isLive ? PT.DataStore.createLiveSession : PT.DataStore.createSession;
    const newSession = createFn.call(PT.DataStore, null, 0);
    PT.DataStore.updateSession(newSession.id, { name: sessionName });

    if (isLive && typeof window.updateLiveSessionNavLink === 'function') {
      window.updateLiveSessionNavLink();
    }

    closeModal();

    const sessionRoute = (PT.routes && PT.routes.session) || DEFAULT_SESSION_ROUTE;
    window.location.href = `${sessionRoute}?session_id=${newSession.id}`;
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
