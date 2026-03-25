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
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
    return amount < 0 ? `-${formatted}` : formatted;
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

    // Session names removed

    let newSession;
    if (startLive) {
      // Create live session with default buy-in
      newSession = PokerTracker.DataStore.createLiveSession(0);
    } else {
      // Create regular session with default buy-in
      newSession = PokerTracker.DataStore.createSession(0);
    }

    // Session name functionality removed

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

PokerTracker.LastSessionsSelector = (function() {
  const instances = new Map();
  let globalListenersBound = false;

  function getElement(target) {
    if (!target) return null;
    if (typeof target === 'string') {
      return document.getElementById(target);
    }
    return target;
  }

  function normalizeLimit(value) {
    if (window.PokerTracker?.DataStore?.normalizeLastSessionsLimit) {
      return PokerTracker.DataStore.normalizeLastSessionsLimit(value);
    }

    if (value === null || typeof value === 'undefined' || value === '' || value === 'all') {
      return null;
    }

    const parsed = typeof value === 'number' ? value : parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return Math.floor(parsed);
  }

  function getKey(element) {
    return element?.id || element?.dataset?.selectorKey || null;
  }

  function formatLabel(limit) {
    return limit ? String(limit) : 'All';
  }

  function buildMarkup(instance) {
    const selectedLimit = instance.selectedLimit;
    const presetButtons = instance.presets.map(preset => `
      <button
        type="button"
        class="last-sessions-option${selectedLimit === preset ? ' is-active' : ''}"
        data-action="select-limit"
        data-value="${preset}"
      >
        ${preset}
      </button>
    `).join('');

    return `
      <div class="last-sessions-selector${instance.isOpen ? ' is-open' : ''}">
        <button type="button" class="last-sessions-trigger" data-action="toggle">
          <span class="last-sessions-trigger-label">${formatLabel(selectedLimit)}</span>
          <span class="last-sessions-trigger-icon" aria-hidden="true">${instance.isOpen ? '▴' : '▾'}</span>
        </button>
        <div class="last-sessions-dropdown${instance.isOpen ? '' : ' is-hidden'}">
          <div class="last-sessions-custom-row">
            <input
              type="number"
              class="last-sessions-custom-input"
              data-role="custom-input"
              min="1"
              step="1"
              placeholder="Custom count"
              value="${selectedLimit ? selectedLimit : ''}"
            >
            <button type="button" class="last-sessions-apply-btn" data-action="apply-custom">Apply</button>
          </div>
          <div class="last-sessions-options">
            <button
              type="button"
              class="last-sessions-option${selectedLimit === null ? ' is-active' : ''}"
              data-action="select-all"
            >
              All
            </button>
            ${presetButtons}
          </div>
        </div>
      </div>
    `;
  }

  function closeAllExcept(exceptionKey = null) {
    instances.forEach((instance, key) => {
      if (key === exceptionKey || !instance.isOpen) return;
      instance.isOpen = false;
      render(instance);
    });
  }

  function setSelectedLimit(instance, nextLimit, notify = true) {
    instance.selectedLimit = normalizeLimit(nextLimit);
    instance.isOpen = false;
    render(instance);

    if (notify && typeof instance.onChange === 'function') {
      instance.onChange(instance.selectedLimit);
    }
  }

  function bindEvents(instance) {
    const trigger = instance.element.querySelector('[data-action="toggle"]');
    const applyButton = instance.element.querySelector('[data-action="apply-custom"]');
    const customInput = instance.element.querySelector('[data-role="custom-input"]');

    if (trigger) {
      trigger.addEventListener('click', event => {
        event.preventDefault();
        instance.isOpen = !instance.isOpen;
        if (instance.isOpen) {
          closeAllExcept(instance.key);
        }
        render(instance);
      });
    }

    instance.element.querySelectorAll('[data-action="select-limit"]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        setSelectedLimit(instance, button.dataset.value);
      });
    });

    const allButton = instance.element.querySelector('[data-action="select-all"]');
    if (allButton) {
      allButton.addEventListener('click', event => {
        event.preventDefault();
        setSelectedLimit(instance, null);
      });
    }

    if (applyButton && customInput) {
      const applyCustomValue = event => {
        if (event) {
          event.preventDefault();
        }

        const normalized = normalizeLimit(customInput.value);
        if (!normalized) {
          customInput.focus();
          customInput.select();
          return;
        }

        setSelectedLimit(instance, normalized);
      };

      applyButton.addEventListener('click', applyCustomValue);
      customInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          applyCustomValue(event);
        }
      });
    }
  }

  function render(instance) {
    instance.element.innerHTML = buildMarkup(instance);
    bindEvents(instance);
  }

  function ensureGlobalListeners() {
    if (globalListenersBound) return;

    document.addEventListener('click', event => {
      const container = event.target.closest('.last-sessions-selector');
      if (container) return;
      closeAllExcept();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeAllExcept();
      }
    });

    globalListenersBound = true;
  }

  function init(target, config = {}) {
    const element = getElement(target);
    if (!element) return null;

    const key = getKey(element);
    if (!key) return null;

    const instance = {
      key,
      element,
      presets: Array.isArray(config.presets) && config.presets.length ? config.presets.slice() : [5, 10, 15, 20],
      selectedLimit: normalizeLimit(config.value),
      onChange: typeof config.onChange === 'function' ? config.onChange : null,
      isOpen: false
    };

    instances.set(key, instance);
    ensureGlobalListeners();
    render(instance);
    return instance;
  }

  function get(target) {
    const element = getElement(target);
    const key = getKey(element);
    if (!key) return null;
    return instances.get(key) || null;
  }

  function setValue(target, value, triggerChange = true) {
    const instance = get(target);
    if (!instance) return;
    instance.selectedLimit = normalizeLimit(value);
    instance.isOpen = false;
    render(instance);

    if (triggerChange && typeof instance.onChange === 'function') {
      instance.onChange(instance.selectedLimit);
    }
  }

  function getValue(target) {
    const instance = get(target);
    return instance ? instance.selectedLimit : null;
  }

  return {
    init,
    get,
    getValue,
    setValue
  };
})();

// Initialize any shared functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('PokerTracker app initialized');
});
