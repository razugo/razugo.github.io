// Shared Data Store
window.PokerTracker = window.PokerTracker || {};

// PokerSession Class
class PokerSession {
  constructor(data = {}) {
    // Core Identifiers
    this.id = data.id || this._generateId();

    // Financial Data
    this.buyIn = this._validateNumber(data.buyIn, 0);
    this.cashOut = this._validateNumber(data.cashOut, this.buyIn);

    // Time & Date
    this.sessionDate = this._validateDate(data.sessionDate);
    this.startTime = this._validateDateTime(data.startTime);
    this.endTime = this._validateDateTime(data.endTime);

    // Location & Stakes
    this.location = this._validateString(data.location);
    this.smallBlind = this._validateStake(data.smallBlind);
    this.bigBlind = this._validateStake(data.bigBlind);

    // Hand Tracking Data
    this.counts = this._validateObject(data.counts, {});
    this.playedCounts = this._validateObject(data.playedCounts, {});
    this.handHistory = this._validateArray(data.handHistory, []);
    this.total = this._validateNumber(data.total, 0);
    this.totalPlayed = this._validateNumber(data.totalPlayed, 0);
    this.vpip = this._validateNumber(data.vpip, 0);

    // Additional Data
    this.notes = this._validateString(data.notes, '');

    // Auto-compute sessionDate from startTime if missing
    if (!this.sessionDate && this.startTime) {
      this.sessionDate = new Date(this.startTime).toISOString().split('T')[0];
    }
  }

  // Computed Properties (getters)
  get profit() {
    return (this.cashOut || 0) - (this.buyIn || 0);
  }

  get duration() {
    if (!this.startTime || !this.endTime) return null;
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  }

  get hourlyRate() {
    const duration = this.duration;
    if (!duration || duration <= 0) return 0;
    return this.profit / duration;
  }

  get vpipPercentage() {
    if (this.total === 0) return 0;
    return Math.round((this.totalPlayed / this.total) * 100);
  }

  get isLive() {
    return !!this.startTime && !this.endTime;
  }

  get isCompleted() {
    return !!this.endTime;
  }

  get bigBlindsWon() {
    if (!this.bigBlind || this.bigBlind === 0) return 0;
    return Math.round(this.profit / this.bigBlind);
  }

  get stake() {
    if (!this.smallBlind || !this.bigBlind) return null;
    return `${this.smallBlind}/${this.bigBlind}`;
  }

  // Validation Methods (private)
  _generateId() {
    return 'session-' + Date.now();
  }

  _validateNumber(value, defaultValue = 0) {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(num) ? num : defaultValue;
  }

  _validateStake(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(num) || num <= 0) return null;
    return Math.round(num * 100) / 100;
  }

  _validateString(value, defaultValue = null) {
    if (value === null || value === undefined) return defaultValue;
    const str = String(value).trim();
    return str === '' ? defaultValue : str;
  }

  _validateDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }

  _validateDateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  _validateObject(value, defaultValue = {}) {
    return (value && typeof value === 'object' && !Array.isArray(value)) ? value : defaultValue;
  }

  _validateArray(value, defaultValue = []) {
    return Array.isArray(value) ? value : defaultValue;
  }

  // Update Methods
  updateFinancials({ buyIn, cashOut }) {
    if (buyIn !== undefined) this.buyIn = this._validateNumber(buyIn, 0);
    if (cashOut !== undefined) this.cashOut = this._validateNumber(cashOut, this.buyIn);
    return this;
  }

  updateLocation(location) {
    this.location = this._validateString(location);
    return this;
  }

  updateStakes(smallBlind, bigBlind) {
    if (smallBlind !== undefined) this.smallBlind = this._validateStake(smallBlind);
    if (bigBlind !== undefined) this.bigBlind = this._validateStake(bigBlind);
    return this;
  }

  updateTiming({ startTime, endTime, sessionDate }) {
    if (startTime !== undefined) this.startTime = this._validateDateTime(startTime);
    if (endTime !== undefined) this.endTime = this._validateDateTime(endTime);
    if (sessionDate !== undefined) this.sessionDate = this._validateDate(sessionDate);

    // Auto-update sessionDate if startTime changes
    if (startTime && !this.sessionDate) {
      this.sessionDate = new Date(this.startTime).toISOString().split('T')[0];
    }
    return this;
  }

  addHand(handData) {
    this.handHistory.push(handData);
    this.total += 1;

    if (handData.played) {
      this.totalPlayed += 1;
      // Update VPIP
      this.vpip = this.total > 0 ? Math.round((this.totalPlayed / this.total) * 100) : 0;
    }

    // Update counts
    const hand = handData.hand;
    if (hand) {
      this.counts[hand] = (this.counts[hand] || 0) + 1;
      if (handData.played) {
        this.playedCounts[hand] = (this.playedCounts[hand] || 0) + 1;
      }
    }

    return this;
  }

  endSession(cashOut = null) {
    this.endTime = new Date().toISOString();
    if (cashOut !== null) {
      this.cashOut = this._validateNumber(cashOut, this.buyIn);
    }
    return this;
  }

  updateNotes(notes) {
    this.notes = this._validateString(notes, '');
    return this;
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      buyIn: this.buyIn,
      cashOut: this.cashOut,
      sessionDate: this.sessionDate,
      startTime: this.startTime,
      endTime: this.endTime,
      location: this.location,
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      counts: this.counts,
      playedCounts: this.playedCounts,
      handHistory: this.handHistory,
      total: this.total,
      totalPlayed: this.totalPlayed,
      vpip: this.vpip,
      notes: this.notes
    };
  }

  // Static Methods
  static fromJSON(data) {
    return new PokerSession(data);
  }

  static validate(data) {
    return data && typeof data === 'object' && typeof data.id === 'string';
  }

  static createNew(buyIn = 0) {
    return new PokerSession({ buyIn, cashOut: buyIn });
  }

  static createLive(buyIn = 0) {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    return new PokerSession({
      buyIn,
      cashOut: buyIn,
      startTime: now,
      sessionDate: today
    });
  }
}

// Make PokerSession available in the PokerTracker namespace
PokerTracker.PokerSession = PokerSession;

PokerTracker.DataStore = {
  // Initialize sessions from localStorage (merged with session data)
  get sessions() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('poker-tracker-games')) {
      localStorage.removeItem('poker-tracker-games');
    }
    const stored = localStorage.getItem('poker-tracker-sessions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert to Session instances
        const sessions = parsed.map(data => {
          try {
            return PokerSession.validate(data) ? PokerSession.fromJSON(data) : new PokerSession(data);
          } catch (err) {
            console.warn('Failed to create session from data:', data, err);
            return new PokerSession(data);
          }
        });

        // Save back to storage if any sessions were created from invalid data
        this.sessions = sessions;
        return sessions;
      } catch (err) {
        console.warn('Failed to parse sessions from storage', err);
        return [];
      }
    }
    return [];
  },

  set sessions(value) {
    const sessionsArray = Array.isArray(value) ? value : [];
    // Convert Session instances to plain objects for storage
    const plainObjects = sessionsArray.map(session => {
      if (session instanceof PokerSession) {
        return session.toJSON();
      }
      return session;
    });
    localStorage.setItem('poker-tracker-sessions', JSON.stringify(plainObjects));
  },

  // Old normalization methods removed - now handled by PokerSession class

  // App state (including live session ID)
  get appState() {
    const stored = localStorage.getItem('poker-tracker-state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          liveSessionId: parsed.liveSessionId || null,
          liveSessionStart: parsed.liveSessionStart || null
        };
      } catch (err) {
        console.warn('Failed to parse app state from storage', err);
      }
    }
    return { liveSessionId: null, liveSessionStart: null };
  },

  set appState(value) {
    const next = {
      liveSessionId: value && value.liveSessionId ? value.liveSessionId : null,
      liveSessionStart: value && value.liveSessionStart ? value.liveSessionStart : null
    };
    localStorage.setItem('poker-tracker-state', JSON.stringify(next));
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
    let totalHours = 0;
    let winningSessions = 0;
    let validVpipSessions = 0;
    let validTimeSessions = 0;

    sessions.forEach(session => {
      // Use PokerSession computed properties
      totalProfit += session.profit;

      if (session.profit > 0) winningSessions++;

      // Use session hand tracking data
      totalHands += session.total || 0;

      if ((session.total || 0) > 0) {
        totalVpip += session.vpip || 0;
        validVpipSessions++;
      }

      // Use PokerSession duration computed property
      const sessionHours = session.duration;
      if (sessionHours !== null && sessionHours > 0) {
        totalHours += sessionHours;
        validTimeSessions++;
      } else if ((session.total || 0) > 0) {
        // Estimate 2 minutes per hand if no time data
        totalHours += (session.total * 2) / 60;
        validTimeSessions++;
      }
    });

    const winRate = ((winningSessions / totalSessions) * 100).toFixed(1);
    const avgVpip = validVpipSessions > 0 ? (totalVpip / validVpipSessions).toFixed(1) : '0.0';
    const hourlyRate = totalHours > 0 ? (totalProfit / totalHours).toFixed(2) : '0.00';

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

  createSession: function(buyIn = 0) {
    const newSession = PokerSession.createNew(buyIn);

    const sessions = this.sessions;
    sessions.push(newSession);
    this.sessions = sessions;

    // Notify all pages that session data has changed
    this.notifySessionDataChange(newSession.id);

    return newSession;
  },

  updateSession: function(sessionId, updates) {
    const sessions = this.sessions;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      let session = sessions[sessionIndex];

      // If it's not a Session instance, convert it
      if (!(session instanceof PokerSession)) {
        session = new PokerSession(session);
        sessions[sessionIndex] = session;
      }

      // Apply updates using Session methods for validation
      if (updates.buyIn !== undefined || updates.cashOut !== undefined) {
        session.updateFinancials(updates);
      }

      if (updates.location !== undefined) {
        session.updateLocation(updates.location);
      }

      if (updates.smallBlind !== undefined || updates.bigBlind !== undefined) {
        session.updateStakes(updates.smallBlind, updates.bigBlind);
      }

      if (updates.startTime !== undefined || updates.endTime !== undefined || updates.sessionDate !== undefined) {
        session.updateTiming(updates);
      }

      if (updates.notes !== undefined) {
        session.updateNotes(updates.notes);
      }

      // Handle direct property updates for any remaining fields
      Object.keys(updates).forEach(key => {
        if (!['buyIn', 'cashOut', 'location', 'smallBlind', 'bigBlind', 'startTime', 'endTime', 'sessionDate', 'notes'].includes(key)) {
          session[key] = updates[key];
        }
      });

      this.sessions = sessions;

      // Update live session state if needed
      const state = this.appState;
      if (state.liveSessionId === sessionId) {
        if (session.endTime) {
          state.liveSessionId = null;
          state.liveSessionStart = null;
          this.appState = state;
          this.notifyLiveSessionChange(null);
        } else if (session.startTime) {
          if (state.liveSessionStart !== session.startTime) {
            state.liveSessionStart = session.startTime;
            this.appState = state;
          }
        }
      }

      // Notify all pages that session data has changed
      this.notifySessionDataChange(sessionId);

      return session;
    }
    return null;
  },

  deleteSession: function(sessionId) {
    const sessions = this.sessions;
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    this.sessions = filteredSessions;

    // Clear from live session if it was live
    const state = this.appState;
    if (state.liveSessionId === sessionId) {
      state.liveSessionId = null;
      this.appState = state;
      this.notifyLiveSessionChange(null);
    }

    // Notify all pages that session data has changed
    this.notifySessionDataChange(sessionId);
  },

  notifyLiveSessionChange: function(sessionId) {
    if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
      document.dispatchEvent(new CustomEvent('pokertracker:live-session-change', {
        detail: { sessionId }
      }));
    }
  },

  notifySessionDataChange: function(sessionId) {
    if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
      document.dispatchEvent(new CustomEvent('pokertracker:session-data-change', {
        detail: { sessionId }
      }));
    }
  },

  getSessionDate: function(session) {
    if (!session) return '';

    const preferred = session.startTime || session.sessionDate || session.endTime || session.date || null;
    if (!preferred) return '';

    if (typeof preferred === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(preferred)) {
      return preferred;
    }

    const date = new Date(preferred);
    if (Number.isNaN(date.getTime())) {
      return typeof preferred === 'string' ? preferred : '';
    }

    return date.toISOString().split('T')[0];
  },

  getSessionSortValue: function(session) {
    if (!session) return 0;
    const sortSource = session.startTime
      || (session.sessionDate ? `${session.sessionDate}T00:00:00` : null)
      || session.endTime
      || null;
    if (!sortSource) return 0;
    const value = new Date(sortSource).getTime();
    return Number.isNaN(value) ? 0 : value;
  },

  getActiveSession: function() {
    // Return the live session based on app state
    const state = this.appState;
    if (state.liveSessionId) {
      return this.sessions.find(s => s.id === state.liveSessionId) || null;
    }
    return null;
  },

  createLiveSession: function(buyIn = 0) {
    // End any existing live session first
    this.endActiveSession();

    const newSession = PokerSession.createLive(buyIn);

    const sessions = this.sessions;
    sessions.push(newSession);
    this.sessions = sessions;

    // Set as live session in app state
    const state = this.appState;
    state.liveSessionId = newSession.id;
    state.liveSessionStart = newSession.startTime;
    this.appState = state;

    this.notifyLiveSessionChange(newSession.id);

    return newSession;
  },

  endActiveSession: function(sessionId = null, options = {}) {
    const state = this.appState;
    const targetSessionId = sessionId || state.liveSessionId;
    let endedSession = null;

    if (targetSessionId) {
      const sessions = this.sessions;
      const sessionIndex = sessions.findIndex(s => s.id === targetSessionId);

      if (sessionIndex !== -1) {
        let session = sessions[sessionIndex];

        // Ensure it's a PokerSession instance
        if (!(session instanceof PokerSession)) {
          session = new PokerSession(session);
          sessions[sessionIndex] = session;
        }

        // Set startTime if missing and we have it in state
        if (!session.startTime && state.liveSessionStart) {
          session.updateTiming({ startTime: state.liveSessionStart });
        }

        // End the session using PokerSession method
        const endTime = options.endTime || new Date().toISOString();
        session.updateTiming({ endTime });

        this.sessions = sessions;
        endedSession = session;
      }
    }

    if (state.liveSessionId === targetSessionId) {
      state.liveSessionId = null;
      state.liveSessionStart = null;
      this.appState = state;
      this.notifyLiveSessionChange(null);
    }

    return endedSession;
  },

  endLiveSession: function() {
    return this.endActiveSession();
  },

  hasLiveSession: function() {
    const state = this.appState;
    return state.liveSessionId !== null;
  },

  getSessionData: function(sessionId) {
    // Return session data directly from the session object
    const session = this.getSession(sessionId);
    if (!session) {
      return {
        sessionId: sessionId,
        counts: {},
        playedCounts: {},
        handHistory: [],
        total: 0,
        totalPlayed: 0,
        vpip: 0,
        notes: ''
      };
    }

    return {
      sessionId: sessionId,
      counts: session.counts || {},
      playedCounts: session.playedCounts || {},
      handHistory: session.handHistory || [],
      total: session.total || 0,
      totalPlayed: session.totalPlayed || 0,
      vpip: session.vpip || 0,
      notes: session.notes || ''
    };
  },

  saveSessionData: function(sessionId, data) {
    // Update session object directly
    const sessions = this.sessions;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].counts = data.counts;
      sessions[sessionIndex].playedCounts = data.playedCounts;
      sessions[sessionIndex].handHistory = data.handHistory;
      sessions[sessionIndex].total = data.total;
      sessions[sessionIndex].totalPlayed = data.totalPlayed;
      sessions[sessionIndex].vpip = data.vpip;
      sessions[sessionIndex].notes = data.notes;
      this.sessions = sessions;
    }
  },

  addHand: function(sessionId, handCode, played = false) {
    const sessionData = this.getSessionData(sessionId);

    // Generate unique hand ID
    const handId = `hand-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

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
    // Clear session data from session object
    const sessions = this.sessions;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].counts = {};
      sessions[sessionIndex].playedCounts = {};
      sessions[sessionIndex].handHistory = [];
      sessions[sessionIndex].total = 0;
      sessions[sessionIndex].totalPlayed = 0;
      sessions[sessionIndex].vpip = 0;
      sessions[sessionIndex].notes = '';
      this.sessions = sessions;
    }
    return this.getSessionData(sessionId);
  },

  clearAllData: function() {
    // Clear all poker tracker data from localStorage
    localStorage.removeItem('poker-tracker-sessions');
    localStorage.removeItem('poker-tracker-state');
    localStorage.removeItem('poker-tracker-games'); // Legacy cleanup

    // Notify all pages that session data has been cleared
    this.notifySessionDataChange(null);
    this.notifyLiveSessionChange(null);

    return true;
  }
};
