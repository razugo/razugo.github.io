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
  },

  // Session Management
  getSession: function(sessionId) {
    return this.sessions.find(s => s.id === sessionId);
  },

  getActiveSession: function() {
    return this.sessions.find(s => s.status === 'active');
  },

  getSessionData: function(sessionId) {
    const key = `poker-tracker-session-${sessionId}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      return {
        sessionId: sessionId,
        hands: [],
        counts: {},
        playedCounts: {},
        handHistory: [],
        total: 0,
        totalPlayed: 0,
        vpip: 0,
        notes: '',
        handNotes: {}
      };
    }
    return JSON.parse(stored);
  },

  saveSessionData: function(sessionId, data) {
    const key = `poker-tracker-session-${sessionId}`;
    data.sessionId = sessionId;
    localStorage.setItem(key, JSON.stringify(data));
  },

  addHand: function(sessionId, handCode, played = false) {
    const sessionData = this.getSessionData(sessionId);

    // Generate unique hand ID
    const handId = `hand-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add to hand history
    const handEntry = {
      id: handId,
      key: handCode,
      timestamp: Date.now(),
      played: played,
      position: sessionData.handHistory.length + 1,
      notes: ''
    };

    sessionData.handHistory.push(handEntry);

    // Update counts
    sessionData.counts[handCode] = (sessionData.counts[handCode] || 0) + 1;
    if (played) {
      sessionData.playedCounts[handCode] = (sessionData.playedCounts[handCode] || 0) + 1;
      sessionData.totalPlayed++;
    }
    sessionData.total++;

    // Recalculate VPIP
    sessionData.vpip = sessionData.total > 0 ? ((sessionData.totalPlayed / sessionData.total) * 100) : 0;

    this.saveSessionData(sessionId, sessionData);
    return sessionData;
  },

  updateHandStatus: function(sessionId, handId, played) {
    const sessionData = this.getSessionData(sessionId);
    const hand = sessionData.handHistory.find(h => h.id === handId);

    if (!hand) return sessionData;

    const wasPlayed = hand.played;
    hand.played = played;

    // Update counts
    if (wasPlayed && !played) {
      // Was played, now folded
      sessionData.playedCounts[hand.key]--;
      if (sessionData.playedCounts[hand.key] <= 0) {
        delete sessionData.playedCounts[hand.key];
      }
      sessionData.totalPlayed--;
    } else if (!wasPlayed && played) {
      // Was folded, now played
      sessionData.playedCounts[hand.key] = (sessionData.playedCounts[hand.key] || 0) + 1;
      sessionData.totalPlayed++;
    }

    // Recalculate VPIP
    sessionData.vpip = sessionData.total > 0 ? ((sessionData.totalPlayed / sessionData.total) * 100) : 0;

    this.saveSessionData(sessionId, sessionData);
    return sessionData;
  },

  updateHandNotes: function(sessionId, handId, notes) {
    const sessionData = this.getSessionData(sessionId);
    const hand = sessionData.handHistory.find(h => h.id === handId);

    if (hand) {
      hand.notes = notes;
      this.saveSessionData(sessionId, sessionData);
    }

    return sessionData;
  },

  updateSessionNotes: function(sessionId, notes) {
    const sessionData = this.getSessionData(sessionId);
    sessionData.notes = notes;
    this.saveSessionData(sessionId, sessionData);
    return sessionData;
  },

  undoLastHand: function(sessionId) {
    const sessionData = this.getSessionData(sessionId);
    if (sessionData.handHistory.length === 0) return sessionData;

    const lastHand = sessionData.handHistory.pop();

    // Update counts
    sessionData.counts[lastHand.key]--;
    if (sessionData.counts[lastHand.key] <= 0) {
      delete sessionData.counts[lastHand.key];
    }

    if (lastHand.played) {
      sessionData.playedCounts[lastHand.key]--;
      if (sessionData.playedCounts[lastHand.key] <= 0) {
        delete sessionData.playedCounts[lastHand.key];
      }
      sessionData.totalPlayed--;
    }
    sessionData.total--;

    // Recalculate VPIP
    sessionData.vpip = sessionData.total > 0 ? ((sessionData.totalPlayed / sessionData.total) * 100) : 0;

    this.saveSessionData(sessionId, sessionData);
    return sessionData;
  },

  deleteHand: function(sessionId, handId) {
    const sessionData = this.getSessionData(sessionId);
    const handIndex = sessionData.handHistory.findIndex(h => h.id === handId);

    if (handIndex === -1) return sessionData;

    const hand = sessionData.handHistory[handIndex];
    sessionData.handHistory.splice(handIndex, 1);

    // Update counts
    sessionData.counts[hand.key]--;
    if (sessionData.counts[hand.key] <= 0) {
      delete sessionData.counts[hand.key];
    }

    if (hand.played) {
      sessionData.playedCounts[hand.key]--;
      if (sessionData.playedCounts[hand.key] <= 0) {
        delete sessionData.playedCounts[hand.key];
      }
      sessionData.totalPlayed--;
    }
    sessionData.total--;

    // Recalculate VPIP and reorder positions
    sessionData.vpip = sessionData.total > 0 ? ((sessionData.totalPlayed / sessionData.total) * 100) : 0;
    sessionData.handHistory.forEach((h, index) => {
      h.position = index + 1;
    });

    this.saveSessionData(sessionId, sessionData);
    return sessionData;
  },

  clearSessionData: function(sessionId) {
    const key = `poker-tracker-session-${sessionId}`;
    localStorage.removeItem(key);
    return this.getSessionData(sessionId);
  }
};
