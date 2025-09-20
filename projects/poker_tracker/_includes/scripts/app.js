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
    const sessionName = prompt('Enter session name (optional):');
    if (sessionName === null) return; // User cancelled

    // Create blank session with no game or buy-in
    const newSession = PokerTracker.DataStore.createSession(null, 0);

    // Update session name if provided
    if (sessionName && sessionName.trim() !== '') {
      PokerTracker.DataStore.updateSession(newSession.id, { name: sessionName.trim() });
    }

    alert(`Session created successfully!`);

    // Redirect to the session page
    window.location.href = `/projects/poker_tracker/session?session_id=${newSession.id}`;
  },

  showNewGameModal: function() {
    const gameName = prompt('Enter game name (e.g., "Aria 1/3"):');
    if (!gameName || gameName.trim() === '') return;

    const location = prompt('Enter location (e.g., "Aria Casino"):');
    if (location === null) return;

    const smallBlind = prompt('Enter small blind amount:');
    if (smallBlind === null) return;
    const smallBlindAmount = parseFloat(smallBlind);
    if (isNaN(smallBlindAmount) || smallBlindAmount <= 0) {
      alert('Invalid small blind amount');
      return;
    }

    const bigBlind = prompt('Enter big blind amount:');
    if (bigBlind === null) return;
    const bigBlindAmount = parseFloat(bigBlind);
    if (isNaN(bigBlindAmount) || bigBlindAmount <= smallBlindAmount) {
      alert('Invalid big blind amount');
      return;
    }

    // Create the game
    PokerTracker.DataStore.createGame(gameName.trim(), location.trim() || 'Unknown', smallBlindAmount, bigBlindAmount);

    alert('Game created successfully!');

    // Refresh the page if we're on games page
    if (window.location.pathname.includes('games')) {
      window.location.reload();
    }
  }
};

// Initialize any shared functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('PokerTracker app initialized');
});
