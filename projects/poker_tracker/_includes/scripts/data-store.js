// Shared Data Store
window.PokerTracker = window.PokerTracker || {};

PokerTracker.DataStore = {
  // Dummy Data
  games: [
    { id: 'aria-1-3', name: 'Aria 1/3', location: 'Aria Casino', stakes: { smallBlind: 1, bigBlind: 3, currency: 'USD' }, defaultBuyIn: 300 },
    { id: 'home-game', name: 'Friday Home Game', location: 'Home', stakes: { smallBlind: 0.25, bigBlind: 0.5, currency: 'USD' }, defaultBuyIn: 50 },
    { id: 'bellagio-2-5', name: 'Bellagio 2/5', location: 'Bellagio', stakes: { smallBlind: 2, bigBlind: 5, currency: 'USD' }, defaultBuyIn: 500 },
    { id: 'wynn-5-10', name: 'Wynn 5/10', location: 'Wynn', stakes: { smallBlind: 5, bigBlind: 10, currency: 'USD' }, defaultBuyIn: 1000 },
    { id: 'commerce-3-5', name: 'Commerce 3/5', location: 'Commerce Casino', stakes: { smallBlind: 3, bigBlind: 5, currency: 'USD' }, defaultBuyIn: 500 }
  ],

  sessions: [
    { id: 'session-1', date: '2025-01-15', gameId: 'aria-1-3', buyIn: 300, cashOut: 547, hands: 87, vpip: 23, duration: 260, status: 'completed' },
    { id: 'session-2', date: '2025-01-12', gameId: 'bellagio-2-5', buyIn: 500, cashOut: 938, hands: 124, vpip: 21, duration: 375, status: 'completed' },
    { id: 'session-3', date: '2025-01-10', gameId: 'home-game', buyIn: 50, cashOut: 89, hands: 65, vpip: 28, duration: 225, status: 'completed' },
    { id: 'session-4', date: '2025-01-08', gameId: 'wynn-5-10', buyIn: 1000, cashOut: 711, hands: 95, vpip: 19, duration: 180, status: 'completed' },
    { id: 'session-5', date: '2025-01-05', gameId: 'aria-1-3', buyIn: 300, cashOut: 156, hands: 72, vpip: 31, duration: 195, status: 'completed' },
    { id: 'session-6', date: '2025-01-03', gameId: 'commerce-3-5', buyIn: 500, cashOut: 823, hands: 156, vpip: 24, duration: 420, status: 'completed' },
    { id: 'session-7', date: '2024-12-30', gameId: 'home-game', buyIn: 50, cashOut: 127, hands: 89, vpip: 26, duration: 310, status: 'completed' },
    { id: 'session-8', date: '2024-12-28', gameId: 'bellagio-2-5', buyIn: 500, cashOut: 345, hands: 67, vpip: 18, duration: 150, status: 'completed' },
    { id: 'session-9', date: '2024-12-25', gameId: 'aria-1-3', buyIn: 300, cashOut: 612, hands: 143, vpip: 22, duration: 385, status: 'completed' },
    { id: 'session-10', date: '2024-12-22', gameId: 'wynn-5-10', buyIn: 1000, cashOut: 1456, hands: 78, vpip: 20, duration: 275, status: 'completed' },
    { id: 'session-11', date: '2024-12-20', gameId: 'aria-1-3', buyIn: 300, cashOut: 278, hands: 65, vpip: 29, duration: 165, status: 'completed' },
    { id: 'session-12', date: '2024-12-18', gameId: 'commerce-3-5', buyIn: 500, cashOut: 734, hands: 98, vpip: 22, duration: 285, status: 'completed' },
    { id: 'session-13', date: '2024-12-15', gameId: 'bellagio-2-5', buyIn: 500, cashOut: 123, hands: 45, vpip: 33, duration: 120, status: 'completed' },
    { id: 'session-14', date: '2024-12-12', gameId: 'home-game', buyIn: 50, cashOut: 97, hands: 134, vpip: 27, duration: 390, status: 'completed' },
    { id: 'session-15', date: '2024-12-10', gameId: 'aria-1-3', buyIn: 300, cashOut: 511, hands: 112, vpip: 25, duration: 320, status: 'completed' },
    { id: 'session-16', date: '2024-12-08', gameId: 'wynn-5-10', buyIn: 1000, cashOut: 856, hands: 67, vpip: 18, duration: 195, status: 'completed' },
    { id: 'session-17', date: '2024-12-05', gameId: 'commerce-3-5', buyIn: 500, cashOut: 689, hands: 89, vpip: 23, duration: 245, status: 'completed' },
    { id: 'session-18', date: '2024-12-03', gameId: 'aria-1-3', buyIn: 300, cashOut: 445, hands: 76, vpip: 26, duration: 210, status: 'completed' },
    { id: 'session-19', date: '2024-12-01', gameId: 'bellagio-2-5', buyIn: 500, cashOut: 267, hands: 54, vpip: 30, duration: 145, status: 'completed' },
    { id: 'session-20', date: '2024-11-28', gameId: 'home-game', buyIn: 50, cashOut: 73, hands: 98, vpip: 28, duration: 275, status: 'completed' },
    { id: 'session-active', date: '2025-01-16', gameId: 'aria-1-3', buyIn: 300, cashOut: 427, hands: 51, vpip: 24, duration: 127, status: 'active' }
  ],

  // Methods
  getGame: function(gameId) {
    return this.games.find(g => g.id === gameId);
  },

  getSessions: function() {
    return this.sessions;
  },

  getSessionStats: function() {
    const totalProfit = this.sessions.reduce((sum, session) => sum + (session.cashOut - session.buyIn), 0);
    const totalHands = this.sessions.reduce((sum, session) => sum + session.hands, 0);
    const totalSessions = this.sessions.length;
    const winningSessions = this.sessions.filter(s => s.cashOut > s.buyIn).length;
    const winRate = (winningSessions / totalSessions * 100).toFixed(1);
    const avgVpip = (this.sessions.reduce((sum, s) => sum + s.vpip, 0) / totalSessions).toFixed(1);
    const totalMinutes = this.sessions.reduce((sum, s) => sum + s.duration, 0);
    const hourlyRate = totalMinutes > 0 ? (totalProfit / (totalMinutes / 60)).toFixed(2) : '0.00';

    return {
      totalProfit,
      totalSessions,
      totalHands,
      winRate,
      avgVpip,
      hourlyRate
    };
  }
};
