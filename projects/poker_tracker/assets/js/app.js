// Shared App Utilities
window.PokerTracker = window.PokerTracker || {};

// Disable scroll wheel on number inputs globally
document.addEventListener('DOMContentLoaded', function() {
  // Prevent scroll wheel from changing number input values
  document.addEventListener('wheel', function(e) {
    if (e.target.type === 'number' && document.activeElement === e.target) {
      e.preventDefault();
    }
  }, { passive: false });

  // Alternative method: blur input when scrolling starts
  document.addEventListener('wheel', function(e) {
    if (e.target.type === 'number') {
      e.target.blur();
    }
  });
});

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

  formatDateTime: function(value, formatterOptions) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const options = Object.assign({
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }, formatterOptions || {});
    return new Intl.DateTimeFormat('en-US', options).format(date);
  },

  // Responsive datetime formatting based on viewport
  formatDateTimeResponsive: function(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    // Get current viewport width
    const width = window.innerWidth;

    if (width >= 768) {
      // Wide: Sep 23, 2025 8:35AM
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(date);
    } else if (width >= 480) {
      // Medium: Sep 23 8:35AM
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(date);
    } else {
      // Narrow: 9/23 8:35a
      const timeStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }).format(date).toLowerCase().replace(' ', '');

      return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
    }
  },

  // Session Management
  showNewSessionModal: function() {
    const startLive = confirm('Start a live session? (Cancel for regular session)');

    const sessionName = prompt('Enter session name (optional):');
    if (sessionName === null) return; // User cancelled

    let newSession;
    if (startLive) {
      // Create live session with default buy-in
      newSession = PokerTracker.DataStore.createLiveSession(0);
    } else {
      // Create regular session with default buy-in
      newSession = PokerTracker.DataStore.createSession(0);
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
    const sessionRoute = (PokerTracker.routes && PokerTracker.routes.session) || '/projects/poker_tracker/session/';
    window.location.href = `${sessionRoute}?session_id=${newSession.id}`;
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
      allowInput: false,
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
        if (instance && instance.input) {
          try {
            instance.input.setAttribute('readonly', 'readonly');
          } catch (err) {
            // noop
          }
        }
        if (instance && instance.altInput) {
          try {
            instance.altInput.setAttribute('readonly', 'readonly');
          } catch (err) {
            // noop
          }
        }
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
    try {
      element.setAttribute('readonly', 'readonly');
    } catch (err) {
      // noop
    }
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

PokerTracker.Dropdowns = (function() {
  const instances = new Map();

  function getElement(target) {
    if (!target) return null;
    if (typeof target === 'string') {
      return document.getElementById(target);
    }
    return target;
  }

  function ensureSlimSelect() {
    if (typeof window.SlimSelect === 'undefined') {
      console.warn('SlimSelect is not available. Skipping dropdown setup.');
      return false;
    }
    return true;
  }

  function toData(option, selectedValue) {
    return {
      text: option.text,
      value: typeof option.value === 'undefined' ? '' : option.value,
      disabled: !!option.disabled,
      placeholder: !!option.placeholder,
      innerHTML: option.innerHTML,
      selected: typeof selectedValue !== 'undefined' && option.value === selectedValue
    };
  }

  function setDomOptions(element, options = [], selectedValue) {
    if (!element) return;

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = typeof option.value === 'undefined' ? '' : option.value;
      opt.textContent = option.text || '';

      if (option.innerHTML) {
        opt.innerHTML = option.innerHTML;
      }

      if (option.disabled) opt.disabled = true;
      if (option.placeholder) opt.dataset.placeholder = 'true';
      if (typeof selectedValue !== 'undefined' && opt.value === selectedValue) {
        opt.selected = true;
      }

      element.appendChild(opt);
    });
  }

  function init(target, config = {}) {
    const element = getElement(target);
    if (!element || !ensureSlimSelect()) return null;

    const key = element.id || element.name;
    if (key && instances.has(key)) {
      const existing = instances.get(key);
      if (existing && typeof existing.destroy === 'function') {
        existing.destroy();
      }
      instances.delete(key);
    }

    const options = Object.assign({
      settings: {
        allowDeselect: !element.hasAttribute('required'),
        hideSelected: false,
        showSearch: element.options.length > 6
      }
    }, config || {});

    options.select = element;

    if (!options.settings) {
      options.settings = {};
    }

    if (typeof options.settings.allowDeselect === 'undefined') {
      options.settings.allowDeselect = !element.hasAttribute('required');
    }

    if (typeof options.settings.showSearch === 'undefined') {
      options.settings.showSearch = element.options.length > 6;
    }

    const placeholderText = options.placeholderText || options.settings.placeholderText || options.placeholder || element.getAttribute('data-placeholder') || '';
    if (placeholderText) {
      options.placeholder = placeholderText;
      options.settings.placeholderText = placeholderText;
      options.settings.placeholderTextAll = placeholderText;
      options.settings.placeholder = placeholderText;
    }

    const instance = new SlimSelect(options);
    if (key) {
      instances.set(key, instance);
    }
    return instance;
  }

  function getInstance(target) {
    const element = getElement(target);
    const key = element?.id || element?.name;
    if (!key) return null;
    return instances.get(key) || null;
  }

  function setOptions(target, options = [], selectedValue) {
    const element = getElement(target);
    if (!element) return;

    const value = typeof selectedValue === 'undefined' ? (element.value || '') : (selectedValue || '');
    setDomOptions(element, options, value);

    const instance = getInstance(element);
    if (instance && typeof instance.setData === 'function') {
      const data = options.map(option => toData(option, value));
      if (!data.some(option => option.value === '')) {
        data.unshift({
          value: '',
          text: '',
          placeholder: true,
          disabled: false,
          selected: !value
        });
      }

      instance.setData(data);
      instance.setSelected(value || '');
    }
  }

  function setValue(target, value, triggerChange = true) {
    const element = getElement(target);
    if (!element) return;

    const instance = getInstance(element);
    if (instance && typeof instance.setSelected === 'function') {
      instance.setSelected(value || '');
    }

    element.value = value || '';
    if (triggerChange) {
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  return {
    init: init,
    get: getInstance,
    setOptions: setOptions,
    setValue: setValue
  };
})();

// Initialize any shared functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('PokerTracker app initialized');
});
