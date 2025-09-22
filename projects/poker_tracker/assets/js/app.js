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

// Initialize any shared functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('PokerTracker app initialized');
});
