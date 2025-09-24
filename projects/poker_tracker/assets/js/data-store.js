// Shared Data Store
window.PokerTracker = window.PokerTracker || {};

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
        const normalized = this.normalizeSessionsList(parsed);
        if (normalized.changed) {
          localStorage.setItem('poker-tracker-sessions', JSON.stringify(normalized.sessions));
        }
        return normalized.sessions;
      } catch (err) {
        console.warn('Failed to parse sessions from storage', err);
        return [];
      }
    }
    return [];
  },

  set sessions(value) {
    const normalized = this.normalizeSessionsList(Array.isArray(value) ? value : []);
    localStorage.setItem('poker-tracker-sessions', JSON.stringify(normalized.sessions));
  },

  normalizeSession: function(session) {
    if (!session || typeof session !== 'object') {
      return { session, changed: false };
    }

    const updated = { ...session };
    let changed = false;

    const normalizeLocation = value => {
      if (value === null || typeof value === 'undefined') return null;
      const stringValue = String(value).trim();
      return stringValue === '' ? null : stringValue;
    };

    const normalizeStake = value => {
      if (value === null || typeof value === 'undefined' || value === '') return null;
      const numeric = typeof value === 'number' ? value : parseFloat(value);
      if (!Number.isFinite(numeric) || numeric <= 0) return null;
      return Math.round(numeric * 100) / 100;
    };

    const normalizeDateTime = value => {
      if (value === null || typeof value === 'undefined' || value === '') return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString();
    };

    const coerceDate = value => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    };

    const normalizedStart = normalizeDateTime(updated.startTime);
    if (normalizedStart !== updated.startTime) {
      updated.startTime = normalizedStart;
      changed = true;
    }
    if (typeof updated.startTime === 'undefined') {
      updated.startTime = null;
      changed = true;
    }

    const normalizedEnd = normalizeDateTime(updated.endTime);
    if (normalizedEnd !== updated.endTime) {
      updated.endTime = normalizedEnd;
      changed = true;
    }
    if (typeof updated.endTime === 'undefined') {
      updated.endTime = null;
      changed = true;
    }

    if (typeof updated.sessionDate === 'string') {
      const trimmed = updated.sessionDate.trim();
      if (trimmed !== updated.sessionDate) {
        updated.sessionDate = trimmed || null;
        changed = true;
      }
    }

    if (updated.startTime) {
      const startDate = updated.startTime.split('T')[0];
      if (updated.sessionDate !== startDate) {
        updated.sessionDate = startDate;
        changed = true;
      }
    } else {
      if (!updated.sessionDate) {
        const derivedDate = coerceDate(updated.endTime) || (typeof updated.date === 'string' ? updated.date : null);
        if (derivedDate) {
          updated.sessionDate = derivedDate;
          changed = true;
        }
      }

      if (typeof updated.sessionDate === 'undefined') {
        updated.sessionDate = null;
        changed = true;
      }
    }

    const coerceDuration = value => {
      if (value === null || typeof value === 'undefined') return null;
      const numeric = typeof value === 'number' ? value : parseFloat(value);
      if (!Number.isFinite(numeric) || numeric < 0) return null;
      return Math.round(numeric * 100) / 100;
    };

    const hasDuration = typeof updated.durationHours === 'number' && Number.isFinite(updated.durationHours);
    if (!hasDuration) {
      let minutes = null;
      if (updated.startTime && updated.endTime) {
        const start = new Date(updated.startTime);
        const end = new Date(updated.endTime);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          minutes = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60));
        }
      }

      if (minutes === null && updated.startTime && !updated.endTime) {
        const start = new Date(updated.startTime);
        if (!Number.isNaN(start.getTime())) {
          minutes = Math.max(0, (Date.now() - start.getTime()) / (1000 * 60));
        }
      }

      if (minutes !== null) {
        const hours = Math.round((minutes / 60) * 100) / 100;
        updated.durationHours = hours;
        changed = true;
      }
    } else {
      const normalizedDuration = coerceDuration(updated.durationHours);
      if (normalizedDuration !== updated.durationHours) {
        updated.durationHours = normalizedDuration;
        changed = true;
      }
    }

    if (!hasDuration && typeof updated.durationHours === 'undefined') {
      updated.durationHours = null;
      changed = true;
    }

    if (Object.prototype.hasOwnProperty.call(updated, 'location')) {
      const normalizedLocation = normalizeLocation(updated.location);
      if (normalizedLocation !== updated.location) {
        updated.location = normalizedLocation;
        changed = true;
      }
    } else {
      updated.location = null;
      changed = true;
    }

    if (Object.prototype.hasOwnProperty.call(updated, 'smallBlind')) {
      const normalizedSmall = normalizeStake(updated.smallBlind);
      if (normalizedSmall !== updated.smallBlind) {
        updated.smallBlind = normalizedSmall;
        changed = true;
      }
    } else {
      updated.smallBlind = null;
      changed = true;
    }

    if (Object.prototype.hasOwnProperty.call(updated, 'bigBlind')) {
      const normalizedBig = normalizeStake(updated.bigBlind);
      if (normalizedBig !== updated.bigBlind) {
        updated.bigBlind = normalizedBig;
        changed = true;
      }
    } else {
      updated.bigBlind = null;
      changed = true;
    }

    if (Object.prototype.hasOwnProperty.call(updated, 'gameId')) {
      delete updated.gameId;
      changed = true;
    }

    return { session: updated, changed };
  },

  normalizeSessionsList: function(list) {
    let changed = false;
    const normalized = (Array.isArray(list) ? list : []).map(item => {
      const result = this.normalizeSession(item);
      if (result.changed) changed = true;
      return result.session;
    });
    return { sessions: normalized, changed };
  },

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

      // Calculate duration from stored duration or fallback estimates
      const durationHours = typeof session.durationHours === 'number' && Number.isFinite(session.durationHours)
        ? Math.max(0, session.durationHours)
        : null;

      if (durationHours !== null) {
        const minutes = durationHours * 60;
        totalMinutes += minutes;
        if (minutes > 0) {
          validTimeSessions++;
        }
      } else if (session.startTime && session.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          const minutes = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60));
          if (minutes > 0) {
            totalMinutes += minutes;
            validTimeSessions++;
          }
        }
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

  createSession: function(buyIn = 0) {
    const sessionId = 'session-' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    const newSession = {
      id: sessionId,
      buyIn: buyIn,
      cashOut: buyIn,
      sessionDate: today,
      durationHours: null,
      startTime: null,
      endTime: null,
      location: null,
      smallBlind: null,
      bigBlind: null,
      // Session data (merged)
      counts: {},
      playedCounts: {},
      handHistory: [],
      total: 0,
      totalPlayed: 0,
      vpip: 0,
      notes: ''
    };

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
      const current = sessions[sessionIndex];
      const nextUpdates = { ...updates };

      if (Object.prototype.hasOwnProperty.call(nextUpdates, 'sessionDate')) {
        const rawValue = nextUpdates.sessionDate;
        const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        if (!value) {
          nextUpdates.sessionDate = null;
        } else {
          const parsed = new Date(value);
          nextUpdates.sessionDate = Number.isNaN(parsed.getTime())
            ? (typeof value === 'string' ? value : current.sessionDate)
            : parsed.toISOString().split('T')[0];
        }
      }

      if (Object.prototype.hasOwnProperty.call(nextUpdates, 'durationHours')) {
        const numeric = typeof nextUpdates.durationHours === 'number'
          ? nextUpdates.durationHours
          : parseFloat(nextUpdates.durationHours);
        nextUpdates.durationHours = Number.isFinite(numeric) && numeric >= 0
          ? Math.round(numeric * 100) / 100
          : null;
      }

      const normalizeDateTimeValue = value => {
        if (value === null || typeof value === 'undefined' || value === '') return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString();
      };

      if (Object.prototype.hasOwnProperty.call(nextUpdates, 'startTime')) {
        nextUpdates.startTime = normalizeDateTimeValue(nextUpdates.startTime);
      }

      if (Object.prototype.hasOwnProperty.call(nextUpdates, 'endTime')) {
        nextUpdates.endTime = normalizeDateTimeValue(nextUpdates.endTime);
      }

      if (Object.prototype.hasOwnProperty.call(nextUpdates, 'location')) {
        const trimmed = typeof nextUpdates.location === 'string' ? nextUpdates.location.trim() : nextUpdates.location;
        nextUpdates.location = trimmed === '' ? null : trimmed;
      }

      const normalizeStakeUpdate = value => {
        if (value === null || typeof value === 'undefined' || value === '') return null;
        const numeric = typeof value === 'number' ? value : parseFloat(value);
        if (!Number.isFinite(numeric) || numeric <= 0) return null;
        return Math.round(numeric * 100) / 100;
      };

      if (Object.prototype.hasOwnProperty.call(nextUpdates, 'smallBlind')) {
        nextUpdates.smallBlind = normalizeStakeUpdate(nextUpdates.smallBlind);
      }

      if (Object.prototype.hasOwnProperty.call(nextUpdates, 'bigBlind')) {
        nextUpdates.bigBlind = normalizeStakeUpdate(nextUpdates.bigBlind);
      }

      const merged = { ...current, ...nextUpdates };
      const normalized = this.normalizeSession(merged);
      sessions[sessionIndex] = normalized.session;
      this.sessions = sessions;

      const state = this.appState;
      if (state.liveSessionId === sessionId) {
        if (normalized.session.endTime) {
          state.liveSessionId = null;
          state.liveSessionStart = null;
          this.appState = state;
          this.notifyLiveSessionChange(null);
        } else if (normalized.session.startTime) {
          if (state.liveSessionStart !== normalized.session.startTime) {
            state.liveSessionStart = normalized.session.startTime;
            this.appState = state;
          }
        }
      }

      // Notify all pages that session data has changed
      this.notifySessionDataChange(sessionId);

      return normalized.session;
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

    const sessionId = 'session-' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    const startTimestamp = new Date().toISOString();

    const newSession = {
      id: sessionId,
      buyIn: buyIn,
      cashOut: buyIn,
      sessionDate: today,
      durationHours: null,
      startTime: startTimestamp,
      endTime: null,
      location: null,
      smallBlind: null,
      bigBlind: null,
      // Session data (merged)
      counts: {},
      playedCounts: {},
      handHistory: [],
      total: 0,
      totalPlayed: 0,
      vpip: 0,
      notes: ''
    };

    const sessions = this.sessions;
    sessions.push(newSession);
    this.sessions = sessions;

    // Set as live session in app state
    const state = this.appState;
    state.liveSessionId = sessionId;
    state.liveSessionStart = startTimestamp;
    this.appState = state;

    this.notifyLiveSessionChange(sessionId);

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
        const sessionRecord = sessions[sessionIndex];

        const parseDuration = value => {
          if (value === null || typeof value === 'undefined') return null;
          const numeric = typeof value === 'number' ? value : parseFloat(value);
          if (!Number.isFinite(numeric) || numeric < 0) return null;
          return Math.round(numeric * 100) / 100;
        };

        const normalizeDateTimeValue = value => {
          if (value === null || typeof value === 'undefined' || value === '') return null;
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return null;
          return date.toISOString();
        };

        const updatedSession = { ...sessionRecord };
        if (!updatedSession.startTime && state.liveSessionStart) {
          updatedSession.startTime = state.liveSessionStart;
        }

        if (Object.prototype.hasOwnProperty.call(options, 'durationHours')) {
          const normalizedDuration = parseDuration(options.durationHours);
          if (normalizedDuration !== null) {
            updatedSession.durationHours = normalizedDuration;
          }
        }

        const resolvedEndTime = normalizeDateTimeValue(options.endTime) || new Date().toISOString();
        updatedSession.endTime = resolvedEndTime;

        const normalized = this.normalizeSession(updatedSession);
        sessions[sessionIndex] = normalized.session;
        this.sessions = sessions;
        endedSession = normalized.session;
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
  }
};
