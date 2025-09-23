// Custom DateTime Picker Component
(function(window, document) {
  window.PokerTracker = window.PokerTracker || {};
  const PT = window.PokerTracker;

  let initialized = false;
  let currentPicker = null;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function getMarkup(includeTime = true) {
    const title = includeTime ? 'Select Date & Time' : 'Select Date';
    const width = window.innerWidth;

    // Responsive labels
    const monthLabel = width >= 768 ? 'Month' : (width >= 480 ? 'Mon' : 'M');
    const yearLabel = width >= 768 ? 'Year' : (width >= 480 ? 'Yr' : 'Y');
    const dayLabel = width >= 480 ? 'Day' : 'D';
    const hourLabel = width >= 480 ? 'Hour' : 'H';
    const minuteLabel = width >= 480 ? 'Min' : 'M';
    const ampmLabel = width >= 768 ? 'AM/PM' : (width >= 480 ? 'AM' : '');

    const timeSection = includeTime ? `
      <div class="datetime-section time-section">
        <div class="datetime-field">
          <button class="datetime-increment" data-field="hour" type="button">▲</button>
          <span class="datetime-value" data-field="hour">12</span>
          <button class="datetime-decrement" data-field="hour" type="button">▼</button>
          <label class="datetime-label">${hourLabel}</label>
        </div>
        <div class="datetime-field">
          <button class="datetime-increment" data-field="minute" type="button">▲</button>
          <span class="datetime-value" data-field="minute">00</span>
          <button class="datetime-decrement" data-field="minute" type="button">▼</button>
          <label class="datetime-label">${minuteLabel}</label>
        </div>
        <div class="datetime-field">
          <button class="datetime-increment" data-field="ampm" type="button">▲</button>
          <span class="datetime-value" data-field="ampm">AM</span>
          <button class="datetime-decrement" data-field="ampm" type="button">▼</button>
          <label class="datetime-label">${ampmLabel}</label>
        </div>
      </div>` : '';

    return `
      <div id="dateTimePickerModal" class="modal-overlay" style="display: none;">
        <div class="modal-content datetime-picker-modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" data-action="close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="datetime-picker">
              <div class="datetime-section date-section${includeTime ? '' : ' date-only'}">
                <div class="datetime-field">
                  <button class="datetime-increment" data-field="year" type="button">▲</button>
                  <span class="datetime-value" data-field="year">2025</span>
                  <button class="datetime-decrement" data-field="year" type="button">▼</button>
                  <label class="datetime-label">${yearLabel}</label>
                </div>
                <div class="datetime-field">
                  <button class="datetime-increment" data-field="month" type="button">▲</button>
                  <span class="datetime-value" data-field="month">Jan</span>
                  <button class="datetime-decrement" data-field="month" type="button">▼</button>
                  <label class="datetime-label">${monthLabel}</label>
                </div>
                <div class="datetime-field">
                  <button class="datetime-increment" data-field="day" type="button">▲</button>
                  <span class="datetime-value" data-field="day">1</span>
                  <button class="datetime-decrement" data-field="day" type="button">▼</button>
                  <label class="datetime-label">${dayLabel}</label>
                </div>
              </div>
              ${timeSection}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-action="clear">Clear</button>
            <button class="btn btn-primary" data-action="confirm">OK</button>
          </div>
        </div>
      </div>
    `;
  }

  function ensureModal(includeTime = true) {
    let modal = document.getElementById('dateTimePickerModal');
    if (modal) {
      modal.remove(); // Remove existing modal to recreate with correct time option
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = getMarkup(includeTime);
    modal = wrapper.firstElementChild;
    document.body.appendChild(modal);
    return modal;
  }

  function bindEvents(modal) {
    // Close button handlers
    modal.querySelectorAll('[data-action="close"]').forEach(btn => {
      btn.addEventListener('click', closePicker);
    });

    // Clear button
    const clearBtn = modal.querySelector('[data-action="clear"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearSelection);
    }

    // Confirm button
    const confirmBtn = modal.querySelector('[data-action="confirm"]');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', confirmSelection);
    }

    // Click outside to close
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closePicker();
      }
    });

    // Increment/decrement buttons with iOS zoom prevention
    modal.addEventListener('click', handleFieldClick);

    // Add touch event handlers for iOS zoom prevention
    setupTouchEventHandlers(modal);

    // Escape key (only bind once globally)
    if (!initialized) {
      document.addEventListener('keydown', handleEscape);
      initialized = true;
    }
  }

  function setupTouchEventHandlers(modal) {
    // Prevent iOS zoom on quick taps for increment/decrement buttons
    const buttons = modal.querySelectorAll('.datetime-increment, .datetime-decrement');

    buttons.forEach(button => {
      let touchStartTime = 0;
      let isTouching = false;
      let longPressTimer = null;
      let repeatTimer = null;

      // Use touchstart/touchend to prevent iOS double-tap zoom
      button.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent default touch behaviors including zoom
        touchStartTime = Date.now();
        isTouching = true;

        // Add visual feedback
        button.style.opacity = '0.7';

        // Set up long press for continuous increment/decrement
        const field = button.dataset.field;
        const isIncrement = button.classList.contains('datetime-increment');

        // Immediate first action
        if (isIncrement) {
          incrementField(field);
        } else {
          decrementField(field);
        }

        // Start long press timer for continuous action
        longPressTimer = setTimeout(() => {
          if (isTouching) {
            // Start repeating action
            repeatTimer = setInterval(() => {
              if (isTouching) {
                if (isIncrement) {
                  incrementField(field);
                } else {
                  decrementField(field);
                }
              } else {
                clearInterval(repeatTimer);
              }
            }, 150); // Repeat every 150ms
          }
        }, 500); // Start repeating after 500ms hold

      }, { passive: false });

      button.addEventListener('touchend', (event) => {
        event.preventDefault();

        // Clear timers
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        if (repeatTimer) {
          clearInterval(repeatTimer);
          repeatTimer = null;
        }

        // Remove visual feedback
        button.style.opacity = '';
        isTouching = false;
      }, { passive: false });

      button.addEventListener('touchcancel', (event) => {
        // Clear timers
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        if (repeatTimer) {
          clearInterval(repeatTimer);
          repeatTimer = null;
        }

        button.style.opacity = '';
        isTouching = false;
      });
    });
  }

  function handleEscape(event) {
    if (event.key === 'Escape') {
      const modal = document.getElementById('dateTimePickerModal');
      if (modal && modal.style.display === 'flex') {
        closePicker();
      }
    }
  }

  function handleFieldClick(event) {
    const button = event.target;
    if (!button.classList.contains('datetime-increment') && !button.classList.contains('datetime-decrement')) {
      return;
    }

    const field = button.dataset.field;
    const isIncrement = button.classList.contains('datetime-increment');

    if (isIncrement) {
      incrementField(field);
    } else {
      decrementField(field);
    }
  }

  function incrementField(field) {
    const valueElement = document.querySelector(`[data-field="${field}"].datetime-value`);
    if (!valueElement) return;

    switch (field) {
      case 'month':
        const currentMonthIndex = MONTHS.indexOf(valueElement.textContent);
        const nextMonthIndex = (currentMonthIndex + 1) % 12;
        valueElement.textContent = MONTHS[nextMonthIndex];
        // Update days when month changes
        updateDaysInMonth();
        break;

      case 'day':
        const currentDay = parseInt(valueElement.textContent);
        const maxDays = getDaysInCurrentMonth();
        const nextDay = currentDay >= maxDays ? 1 : currentDay + 1;
        valueElement.textContent = nextDay.toString();
        break;

      case 'year':
        const currentYear = parseInt(valueElement.textContent);
        valueElement.textContent = (currentYear + 1).toString();
        updateDaysInMonth();
        break;

      case 'hour':
        const currentHour = parseInt(valueElement.textContent);
        const nextHour = currentHour >= 12 ? 1 : currentHour + 1;
        valueElement.textContent = nextHour.toString();
        break;

      case 'minute':
        const currentMinute = parseInt(valueElement.textContent);
        // Smart increment: 5-minute increments on mobile for faster selection
        const increment = window.innerWidth < 768 ? 5 : 1;
        const nextMinute = (currentMinute + increment) % 60;
        valueElement.textContent = nextMinute.toString().padStart(2, '0');
        break;

      case 'ampm':
        valueElement.textContent = valueElement.textContent === 'AM' ? 'PM' : 'AM';
        break;
    }
  }

  function decrementField(field) {
    const valueElement = document.querySelector(`[data-field="${field}"].datetime-value`);
    if (!valueElement) return;

    switch (field) {
      case 'month':
        const currentMonthIndex = MONTHS.indexOf(valueElement.textContent);
        const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
        valueElement.textContent = MONTHS[prevMonthIndex];
        updateDaysInMonth();
        break;

      case 'day':
        const currentDay = parseInt(valueElement.textContent);
        const maxDays = getDaysInCurrentMonth();
        const prevDay = currentDay <= 1 ? maxDays : currentDay - 1;
        valueElement.textContent = prevDay.toString();
        break;

      case 'year':
        const currentYear = parseInt(valueElement.textContent);
        if (currentYear > 1900) { // Reasonable minimum year
          valueElement.textContent = (currentYear - 1).toString();
          updateDaysInMonth();
        }
        break;

      case 'hour':
        const currentHour = parseInt(valueElement.textContent);
        const prevHour = currentHour <= 1 ? 12 : currentHour - 1;
        valueElement.textContent = prevHour.toString();
        break;

      case 'minute':
        const currentMinute = parseInt(valueElement.textContent);
        // Smart decrement: 5-minute decrements on mobile for faster selection
        const decrement = window.innerWidth < 768 ? 5 : 1;
        const prevMinute = currentMinute < decrement ? (60 - (decrement - currentMinute)) : currentMinute - decrement;
        valueElement.textContent = prevMinute.toString().padStart(2, '0');
        break;

      case 'ampm':
        valueElement.textContent = valueElement.textContent === 'AM' ? 'PM' : 'AM';
        break;
    }
  }

  function getDaysInCurrentMonth() {
    const monthElement = document.querySelector('[data-field="month"].datetime-value');
    const yearElement = document.querySelector('[data-field="year"].datetime-value');

    if (!monthElement || !yearElement) return 31;

    const monthIndex = MONTHS.indexOf(monthElement.textContent);
    const year = parseInt(yearElement.textContent);

    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function updateDaysInMonth() {
    const dayElement = document.querySelector('[data-field="day"].datetime-value');
    if (!dayElement) return;

    const currentDay = parseInt(dayElement.textContent);
    const maxDays = getDaysInCurrentMonth();

    if (currentDay > maxDays) {
      dayElement.textContent = maxDays.toString();
    }
  }

  function setPickerValue(dateValue) {
    const date = dateValue ? new Date(dateValue) : new Date();

    if (isNaN(date.getTime())) {
      // Invalid date, use current date
      const now = new Date();
      setPickerValueFromDate(now);
      return;
    }

    setPickerValueFromDate(date);
  }

  function setPickerValueFromDate(date) {
    const monthElement = document.querySelector('[data-field="month"].datetime-value');
    const dayElement = document.querySelector('[data-field="day"].datetime-value');
    const yearElement = document.querySelector('[data-field="year"].datetime-value');
    const hourElement = document.querySelector('[data-field="hour"].datetime-value');
    const minuteElement = document.querySelector('[data-field="minute"].datetime-value');
    const ampmElement = document.querySelector('[data-field="ampm"].datetime-value');

    // Responsive month display
    const width = window.innerWidth;
    let monthDisplay;
    if (width >= 768) {
      monthDisplay = MONTHS[date.getMonth()]; // Full month: Jan, Feb, etc.
    } else if (width >= 480) {
      monthDisplay = MONTHS[date.getMonth()]; // Keep full month names on medium screens
    } else {
      monthDisplay = MONTHS[date.getMonth()]; // Keep readable month names even on small screens
    }

    if (monthElement) monthElement.textContent = monthDisplay;
    if (dayElement) dayElement.textContent = date.getDate().toString();
    if (yearElement) {
      yearElement.textContent = date.getFullYear().toString(); // Always show full year: 2025
    }

    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    if (hourElement) hourElement.textContent = hours.toString();
    if (minuteElement) minuteElement.textContent = date.getMinutes().toString().padStart(2, '0');
    if (ampmElement) {
      ampmElement.textContent = ampm; // Always use AM/PM for clarity
    }
  }

  function getPickerValue(includeTime = true) {
    const monthElement = document.querySelector('[data-field="month"].datetime-value');
    const dayElement = document.querySelector('[data-field="day"].datetime-value');
    const yearElement = document.querySelector('[data-field="year"].datetime-value');

    if (!monthElement || !dayElement || !yearElement) {
      return null;
    }

    // Parse month - could be text (Jan) or numeric (1)
    let monthIndex;
    const monthText = monthElement.textContent;
    const monthAsNumber = parseInt(monthText);
    if (!isNaN(monthAsNumber)) {
      monthIndex = monthAsNumber - 1; // Convert 1-12 to 0-11
    } else {
      monthIndex = MONTHS.findIndex(m => m.startsWith(monthText));
      if (monthIndex === -1) monthIndex = 0;
    }

    const day = parseInt(dayElement.textContent);

    // Parse year - could be 2025 or 25
    let year = parseInt(yearElement.textContent);
    if (year < 100) {
      year += 2000; // Convert 25 to 2025
    }

    if (includeTime) {
      const hourElement = document.querySelector('[data-field="hour"].datetime-value');
      const minuteElement = document.querySelector('[data-field="minute"].datetime-value');
      const ampmElement = document.querySelector('[data-field="ampm"].datetime-value');

      if (!hourElement || !minuteElement || !ampmElement) {
        return null;
      }

      let hour = parseInt(hourElement.textContent);
      const minute = parseInt(minuteElement.textContent);
      const ampm = ampmElement.textContent.toUpperCase(); // Handle both AM/PM and am/pm

      // Convert to 24-hour format
      if (ampm === 'AM' && hour === 12) {
        hour = 0;
      } else if (ampm === 'PM' && hour !== 12) {
        hour += 12;
      }

      const date = new Date(year, monthIndex, day, hour, minute);
      return date.toISOString();
    } else {
      // Date-only mode - return YYYY-MM-DD format
      const date = new Date(year, monthIndex, day);
      const pad = num => String(num).padStart(2, '0');
      return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
    }
  }

  function openPicker(inputElement, options = {}) {
    const includeTime = options.includeTime !== false; // Default to true

    currentPicker = {
      input: inputElement,
      callback: options.onConfirm || null,
      includeTime: includeTime
    };

    const modal = ensureModal(includeTime);
    bindEvents(modal);

    // Set initial value from input
    setPickerValue(inputElement.value);

    modal.style.display = 'flex';

    // Focus first increment button for accessibility
    const firstButton = modal.querySelector('.datetime-increment');
    if (firstButton) {
      setTimeout(() => firstButton.focus(), 100);
    }
  }

  function closePicker() {
    const modal = document.getElementById('dateTimePickerModal');
    if (modal) {
      modal.style.display = 'none';
    }

    currentPicker = null;
  }

  function clearSelection() {
    if (!currentPicker) return;

    // Clear the input value
    if (currentPicker.input) {
      currentPicker.input.value = '';

      // Trigger change event
      currentPicker.input.dispatchEvent(new Event('change', { bubbles: true }));
      currentPicker.input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Call callback with null if provided
    if (currentPicker.callback) {
      currentPicker.callback(null);
    }

    closePicker();
  }

  function confirmSelection() {
    if (!currentPicker) return;

    const value = getPickerValue(currentPicker.includeTime);

    if (value) {
      // Update input value
      if (currentPicker.input) {
        if (currentPicker.includeTime) {
          // Format for datetime-local input (YYYY-MM-DDTHH:MM)
          const date = new Date(value);
          const pad = num => String(num).padStart(2, '0');
          const formattedValue = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
          currentPicker.input.value = formattedValue;
        } else {
          // Date-only mode - value is already in YYYY-MM-DD format
          currentPicker.input.value = value;
        }

        // Trigger change event
        currentPicker.input.dispatchEvent(new Event('change', { bubbles: true }));
        currentPicker.input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Call callback if provided
      if (currentPicker.callback) {
        currentPicker.callback(value);
      }
    }

    closePicker();
  }

  // Auto-attach to datetime-local inputs
  function attachToDateTimeInputs() {
    document.addEventListener('click', function(event) {
      const input = event.target;

      // Check if it's a datetime-local input or has the custom class
      if ((input.type === 'datetime-local' || input.classList.contains('datetime-picker-input')) &&
          !input.disabled && !input.readOnly) {

        // Prevent native picker on mobile/desktop
        event.preventDefault();

        // Open custom picker
        openPicker(input);
      }
    });
  }

  // Public API
  PT.DateTimePicker = {
    open: openPicker,
    close: closePicker,

    // Helper method to make any input use the custom picker
    attachToInput: function(selector, options = {}) {
      const inputs = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];

      inputs.forEach(input => {
        if (!input) return;

        input.classList.add('datetime-picker-input');
        input.setAttribute('readonly', 'readonly');

        input.addEventListener('click', () => {
          openPicker(input, options);
        });
      });
    },

    // Helper method to open picker with specific options
    openDatePicker: function(inputElement, options = {}) {
      openPicker(inputElement, { ...options, includeTime: false });
    },

    openDateTimePicker: function(inputElement, options = {}) {
      openPicker(inputElement, { ...options, includeTime: true });
    }
  };

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    attachToDateTimeInputs();
  });

})(window, document);