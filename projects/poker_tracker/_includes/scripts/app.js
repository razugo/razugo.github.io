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

  // Modal placeholders
  showNewSessionModal: function() {
    alert('New Session Modal - Would show game selector and session details form');
  },

  showNewGameModal: function() {
    alert('New Game Modal - Would show form to create new game template');
  }
};

// Initialize any shared functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('PokerTracker app initialized');
});
