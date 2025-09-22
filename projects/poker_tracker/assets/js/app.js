// Shared App Utilities
window.PokerTracker = window.PokerTracker || {};

PokerTracker.Utils = {
  // Format currency
  formatCurrency: function(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  // Format duration
  formatDuration: function(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  // Session Management
  showNewSessionModal: function() {
    const startLive = confirm('Start a live session? (Cancel for regular session)');

    const sessionName = prompt('Enter session name (optional):');
    if (sessionName === null) return; // User cancelled

    let newSession;
    if (startLive) {
      // Create live session with no game or buy-in
      newSession = PokerTracker.DataStore.createLiveSession(null, 0);
    } else {
      // Create regular session with no game or buy-in
      newSession = PokerTracker.DataStore.createSession(null, 0);
    }

    // Update session name if provided
    if (sessionName && sessionName.trim() !== '') {
      PokerTracker.DataStore.updateSession(newSession.id, { name: sessionName.trim() });
    }

    console.error(`${startLive ? 'Live ' : ''}Session created successfully!`);

    // Update nav link globally if live session was created
    if (startLive && window.updateLiveSessionNavLink) {
      window.updateLiveSessionNavLink();
    }

    // Redirect to the session page
    const sessionRoute = (PokerTracker.routes && PokerTracker.routes.session) || '/projects/poker_tracker/session.html';
    window.location.href = `${sessionRoute}?session_id=${newSession.id}`;
  },

  showNewGameModal: function() {
    const gameName = prompt('Enter game name (e.g., "Aria 1/3"):');
    if (!gameName || gameName.trim() === '') return;

    const location = prompt('Enter location (e.g., "Aria Casino"):');
    if (location === null) return;

    const smallBlindInput = prompt('Enter small blind amount (optional):');
    if (smallBlindInput === null) return;
    const smallBlindAmount = smallBlindInput.trim() === '' ? null : parseFloat(smallBlindInput);
    if (smallBlindInput.trim() !== '' && (isNaN(smallBlindAmount) || smallBlindAmount <= 0)) {
      console.error('Invalid small blind amount');
      return;
    }

    const bigBlindInput = prompt('Enter big blind amount (optional):');
    if (bigBlindInput === null) return;
    const bigBlindAmount = bigBlindInput.trim() === '' ? null : parseFloat(bigBlindInput);
    if (bigBlindInput.trim() !== '' && (isNaN(bigBlindAmount) || bigBlindAmount <= 0)) {
      console.error('Invalid big blind amount');
      return;
    }

    if (smallBlindAmount !== null && bigBlindAmount !== null && bigBlindAmount <= smallBlindAmount) {
      console.error('Big blind must be greater than small blind when both are provided');
      return;
    }

    // Create the game
    PokerTracker.DataStore.createGame(
      gameName.trim(),
      location.trim() || '-',
      smallBlindAmount,
      bigBlindAmount
    );

    console.error('Game created successfully!');

    // Refresh the page if we're on games page
    if (window.location.pathname.includes('games')) {
      window.location.reload();
    }
  }
};

PokerTracker.DatePickers = (function() {
  const instances = new Map();

  function getElement(target) {
    if (!target) return null;
    if (typeof target === 'string') {
      return document.getElementById(target);
    }
    return target;
  }

  function ensureFlatpickr() {
    if (typeof window.flatpickr === 'undefined') {
      console.warn('Flatpickr is not available. Skipping date picker setup.');
      return false;
    }
    return true;
  }

  function normalizeHooks(hook) {
    if (!hook) return [];
    return Array.isArray(hook) ? hook : [hook];
  }

  function dispatchChange(input, eventName) {
    if (!input) return;
    const event = new Event(eventName || 'change', { bubbles: true });
    input.dispatchEvent(event);
  }

  function injectClearButton(instance, label, eventName) {
    const calendar = instance?.calendarContainer;
    if (!calendar || calendar.querySelector('.flatpickr-clear-button')) return;

    const actions = document.createElement('div');
    actions.className = 'flatpickr-custom-actions';

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'flatpickr-clear-button';
    clearButton.textContent = label || 'Clear';
    clearButton.addEventListener('click', () => {
      instance.clear();
      dispatchChange(instance.input, eventName);
      instance.close();
    });

    actions.appendChild(clearButton);
    calendar.appendChild(actions);
  }

  function initInstance(target, userOptions = {}) {
    const element = getElement(target);
    if (!element || !ensureFlatpickr()) return null;

    const key = element.id || element.name;
    if (key && instances.has(key)) {
      const existing = instances.get(key);
      if (existing) existing.destroy();
      instances.delete(key);
    }

    const options = Object.assign({
      allowInput: true,
      disableMobile: true,
      dateFormat: 'Y-m-d'
    }, userOptions || {});

    const triggerEvent = options.triggerEvent || 'change';
    delete options.triggerEvent;

    const clearLabel = options.clearLabel || 'Clear';
    delete options.clearLabel;

    const readyHooks = normalizeHooks(options.onReady);
    const changeHooks = normalizeHooks(options.onChange);

    options.onReady = [
      function(selectedDates, dateStr, instance) {
        injectClearButton(instance, clearLabel, triggerEvent);
      },
      ...readyHooks
    ];

    options.onChange = [
      function(selectedDates, dateStr, instance) {
        dispatchChange(instance.input, triggerEvent);
      },
      ...changeHooks
    ];

    const instance = flatpickr(element, options);
    if (key) {
      instances.set(key, instance);
    }
    return instance;
  }

  return {
    init: function(target, options) {
      return initInstance(target, options);
    },

    initDateField: function(target, options = {}) {
      return initInstance(target, Object.assign({
        dateFormat: 'Y-m-d'
      }, options));
    },

    initDateTimeField: function(target, options = {}) {
      return initInstance(target, Object.assign({
        enableTime: true,
        dateFormat: 'Y-m-d\\TH:i',
        time_24hr: false
      }, options));
    },

    get: function(id) {
      return instances.get(id) || null;
    },

    setDate: function(id, value, triggerChange = false) {
      const instance = this.get(id);
      if (instance) {
        instance.setDate(value || null, triggerChange);
      } else {
        const element = getElement(id);
        if (element) {
          element.value = value || '';
          if (triggerChange) {
            dispatchChange(element, 'change');
          }
        }
      }
    },

    clear: function(id, triggerChange = true) {
      const instance = this.get(id);
      const element = getElement(id);

      if (instance) {
        instance.clear();
        if (triggerChange) {
          dispatchChange(instance.input, 'change');
        }
      } else if (element) {
        element.value = '';
        if (triggerChange) {
          dispatchChange(element, 'change');
        }
      }
    }
  };
})();

// Initialize any shared functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('PokerTracker app initialized');
});
