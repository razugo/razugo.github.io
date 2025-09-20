// Session Management Module for Poker Clicker
// Handles all session-related operations including CRUD, state management, and aggregation

import { calculateVPIP } from './poker-utils.js';

export class SessionManager {
  constructor() {
    this.sessions = {};
    this.currentSessionId = null;
    this.sessionCounter = 1;
  }

  createSession(name) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions[sessionId] = {
      id: sessionId,
      name: name || `Session ${this.sessionCounter++}`,
      created: new Date().toISOString(),
      hands: [],
      counts: {},
      playedCounts: {},
      total: 0,
      totalPlayed: 0,
      vpip: 0,
      buyIn: null,
      cashOut: null,
      startTime: null,
      endTime: null,
      notes: "",
      smallBlind: null,
      bigBlind: null
    };
    return sessionId;
  }

  switchToSession(sessionId) {
    if (!sessionId || (sessionId !== '__all__' && !this.sessions[sessionId])) {
      this.currentSessionId = null;
      return;
    }

    console.log('Switching to session:', sessionId);
    this.currentSessionId = sessionId;
  }

  deleteSession(sessionId) {
    if (!sessionId || !this.sessions[sessionId]) return false;

    const sessionName = this.sessions[sessionId].name;
    if (!confirm(`Delete session "${sessionName}"? This cannot be undone.`)) return false;

    delete this.sessions[sessionId];

    // If we deleted the current session, switch to another one or none
    if (this.currentSessionId === sessionId) {
      const remainingSessions = Object.keys(this.sessions);
      this.currentSessionId = remainingSessions.length > 0 ? remainingSessions[0] : null;
    }

    return true;
  }

  renameSession(sessionId, newName) {
    if (!sessionId || !this.sessions[sessionId] || !newName.trim()) return false;

    this.sessions[sessionId].name = newName.trim();
    return true;
  }

  updateSessionSelector(sessionSelector) {
    // Clear all options except the new session option
    sessionSelector.innerHTML = `
      <option value="__new__" class="new-session">+ Create New Session</option>
    `;

    // Add "All Sessions" option if there are multiple sessions
    const sessionCount = Object.keys(this.sessions).length;
    if (sessionCount > 1) {
      const allSessionsOption = document.createElement('option');
      allSessionsOption.value = '__all__';
      allSessionsOption.textContent = '📊 All Sessions';
      allSessionsOption.style.fontWeight = 'bold';
      if (this.currentSessionId === '__all__') {
        allSessionsOption.selected = true;
      }
      sessionSelector.appendChild(allSessionsOption);

      // Add separator
      const separator = document.createElement('option');
      separator.value = '';
      separator.disabled = true;
      separator.textContent = '──';
      sessionSelector.appendChild(separator);
    }

    // Sort sessions by creation date (newest first)
    const sortedSessions = Object.values(this.sessions).sort((a, b) =>
      new Date(b.created) - new Date(a.created)
    );

    sortedSessions.forEach(session => {
      const option = document.createElement('option');
      option.value = session.id;
      option.textContent = session.name;
      if (session.id === this.currentSessionId) {
        option.selected = true;
      }
      sessionSelector.appendChild(option);
    });

    // If no session is selected, default to the newest session
    if (!this.currentSessionId && sortedSessions.length > 0) {
      this.currentSessionId = sortedSessions[0].id;
      sessionSelector.value = this.currentSessionId;
    }
  }

  getCurrentSession() {
    if (this.currentSessionId === '__all__') {
      return this.getAggregatedSession();
    }
    return this.currentSessionId ? this.sessions[this.currentSessionId] : null;
  }

  getAggregatedSession() {
    const allSessions = Object.values(this.sessions);
    if (allSessions.length === 0) return null;

    // Create aggregated session data
    const aggregated = {
      id: '__all__',
      name: 'All Sessions',
      created: new Date().toISOString(),
      hands: [],
      counts: {},
      playedCounts: {},
      total: 0,
      totalPlayed: 0,
      vpip: 0,
      buyIn: null,
      cashOut: null,
      startTime: null,
      endTime: null,
      notes: "",
      smallBlind: null,
      bigBlind: null
    };

    // Initialize all possible hand combinations to 0
    const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 13; j++) {
        const key = this.keyFor(i, j);
        aggregated.counts[key] = 0;
        aggregated.playedCounts[key] = 0;
      }
    }

    // Merge all data from all sessions
    allSessions.forEach((session, sessionIndex) => {
      if (!session) return;

      // Deep copy hands to avoid reference issues
      if (session.hands && Array.isArray(session.hands)) {
        session.hands.forEach(hand => {
          if (hand && hand.key) {
            aggregated.hands.push({
              key: hand.key,
              timestamp: hand.timestamp,
              played: hand.played,
              position: hand.position,
              outcome: hand.outcome,
              pot: hand.pot,
              notes: hand.notes
            });
          }
        });
      }

      // Merge counts - ensure we're working with actual numbers
      if (session.counts && typeof session.counts === 'object') {
        for (const [hand, count] of Object.entries(session.counts)) {
          if (typeof count === 'number' && count > 0) {
            aggregated.counts[hand] = (aggregated.counts[hand] || 0) + count;
          }
        }
      }

      // Merge played counts
      if (session.playedCounts && typeof session.playedCounts === 'object') {
        for (const [hand, count] of Object.entries(session.playedCounts)) {
          if (typeof count === 'number' && count > 0) {
            aggregated.playedCounts[hand] = (aggregated.playedCounts[hand] || 0) + count;
          }
        }
      }

      // Add session totals
      aggregated.total += session.total || 0;
      aggregated.totalPlayed += session.totalPlayed || 0;
    });

    // Sort hands chronologically
    aggregated.hands.sort((a, b) => a.timestamp - b.timestamp);

    // Renumber positions for the merged list
    aggregated.hands.forEach((hand, index) => {
      hand.position = index + 1;
    });

    // Recalculate VPIP based on actual totals
    aggregated.vpip = calculateVPIP(aggregated.totalPlayed, aggregated.total);

    const nonZeroCounts = Object.entries(aggregated.counts).filter(([k,v]) => v > 0);
    console.log('Final aggregated session data:', {
      totalSessions: allSessions.length,
      totalHands: aggregated.total,
      totalPlayed: aggregated.totalPlayed,
      vpip: aggregated.vpip,
      handsArrayLength: aggregated.hands.length,
      nonZeroCountsLength: nonZeroCounts.length,
      sampleCounts: nonZeroCounts.slice(0, 10)
    });

    return aggregated;
  }

  // Helper method to generate key (moved from poker-utils to avoid circular dependency)
  keyFor(i, j) {
    const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
    if (i === j) return RANKS[i] + RANKS[j];
    if (i < j) return RANKS[i] + RANKS[j] + 's';
    return RANKS[j] + RANKS[i] + 'o';
  }

  saveState() {
    const state = {
      sessions: this.sessions,
      currentSessionId: this.currentSessionId,
      sessionCounter: this.sessionCounter
    };
    return state;
  }

  loadState(sessionState) {
    if (sessionState) {
      this.sessions = sessionState.sessions || {};
      this.currentSessionId = sessionState.currentSessionId || null;
      this.sessionCounter = sessionState.sessionCounter || 1;

      // Ensure backwards compatibility - add missing fields to existing sessions
      Object.values(this.sessions).forEach(session => {
        if (session.buyIn === undefined) session.buyIn = null;
        if (session.cashOut === undefined) session.cashOut = null;
        if (session.startTime === undefined) session.startTime = null;
        if (session.endTime === undefined) session.endTime = null;
        if (session.notes === undefined) session.notes = "";
        if (session.smallBlind === undefined) session.smallBlind = null;
        if (session.bigBlind === undefined) session.bigBlind = null;
      });

      // Ensure current session still exists
      if (this.currentSessionId && !this.sessions[this.currentSessionId]) {
        this.currentSessionId = null;
      }
    }

    // If no sessions exist, create a default one
    if (Object.keys(this.sessions).length === 0) {
      const defaultSessionId = this.createSession('Session 1');
      this.currentSessionId = defaultSessionId;
    }
  }

  getAllSessions() {
    return this.sessions;
  }

  getSessionCount() {
    return Object.keys(this.sessions).length;
  }

  hasMultipleSessions() {
    return this.getSessionCount() > 1;
  }
}