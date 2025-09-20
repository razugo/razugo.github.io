// Shared Data Store
window.PokerTracker = window.PokerTracker || {};

PokerTracker.DataStore = {
  // Initialize games from localStorage
  get games() {
    const stored = localStorage.getItem('poker-tracker-games');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  },

  set games(value) {
    localStorage.setItem('poker-tracker-games', JSON.stringify(value));
  },

  // Initialize sessions from localStorage
  get sessions() {
    const stored = localStorage.getItem('poker-tracker-sessions');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  },

  set sessions(value) {
    localStorage.setItem('poker-tracker-sessions', JSON.stringify(value));
  },

  // Methods
  getGame: function(gameId) {
    return this.games.find(g => g.id === gameId);
  },

  getAllGames: function() {
    return this.games;
  },

  createGame: function(name, location, smallBlind, bigBlind) {
    const gameId = 'game-' + Date.now();
    const newGame = {
      id: gameId,
      name: name,
      location: location,
      stakes: {
        smallBlind: smallBlind,
        bigBlind: bigBlind,
        currency: 'USD'
      }
    };

    const games = this.games;
    games.push(newGame);
    this.games = games;

    return newGame;
  },

  updateGame: function(gameId, updates) {
    const games = this.games;
    const gameIndex = games.findIndex(g => g.id === gameId);
    if (gameIndex !== -1) {
      games[gameIndex] = { ...games[gameIndex], ...updates };
      this.games = games;
      return games[gameIndex];
    }
    return null;
  },

  deleteGame: function(gameId) {
    const games = this.games;
    const filteredGames = games.filter(g => g.id !== gameId);
    this.games = filteredGames;

    // Check if any sessions use this game
    const sessions = this.sessions;
    const affectedSessions = sessions.filter(s => s.gameId === gameId);
    if (affectedSessions.length > 0) {
      console.warn(`Deleted game ${gameId} had ${affectedSessions.length} associated sessions`);
    }
  },

  getSessions: function() {
    return this.sessions;
  },

  getSessionStats: function() {
    const sessions = this.sessions;
    const totalSessions = sessions.length;

    if (totalSessions === 0) {
      return {
        totalProfit: 0,
        totalSessions: 0,
        totalHands: 0,
        winRate: '0.0',
        avgVpip: '0.0',
        hourlyRate: '0.00'
      };
    }

    let totalProfit = 0;
    let totalHands = 0;
    let totalVpip = 0;
    let totalMinutes = 0;
    let winningSessions = 0;
    let validVpipSessions = 0;
    let validTimeSessions = 0;

    sessions.forEach(session => {
      // Calculate profit
      const profit = (session.cashOut || 0) - (session.buyIn || 0);
      totalProfit += profit;

      if (profit > 0) winningSessions++;

      // Get session data for hands and VPIP calculation
      const sessionData = this.getSessionData(session.id);
      totalHands += sessionData.total;

      if (sessionData.total > 0) {
        totalVpip += sessionData.vpip;
        validVpipSessions++;
      }

      // Calculate duration from start/end time or estimate from hands
      if (session.startTime && session.endTime) {
        const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60);
        totalMinutes += duration;
        validTimeSessions++;
      } else if (sessionData.total > 0) {
        // Estimate 2 minutes per hand if no time data
        totalMinutes += sessionData.total * 2;
        validTimeSessions++;
      }
    });

    const winRate = ((winningSessions / totalSessions) * 100).toFixed(1);
    const avgVpip = validVpipSessions > 0 ? (totalVpip / validVpipSessions).toFixed(1) : '0.0';
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

  createSession: function(gameId = null, buyIn = 0) {
    const sessionId = 'session-' + Date.now();
    const newSession = {
      id: sessionId,
      date: new Date().toISOString().split('T')[0],
      gameId: gameId,
      buyIn: buyIn,
      cashOut: buyIn,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active'
    };

    const sessions = this.sessions;
    sessions.push(newSession);
    this.sessions = sessions;

    return newSession;
  },

  updateSession: function(sessionId, updates) {
    const sessions = this.sessions;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
      this.sessions = sessions;
      return sessions[sessionIndex];
    }
    return null;
  },

  deleteSession: function(sessionId) {
    const sessions = this.sessions;
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    this.sessions = filteredSessions;

    // Also clear the session data
    this.clearSessionData(sessionId);
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
