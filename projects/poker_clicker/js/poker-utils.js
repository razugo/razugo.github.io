/**
 * Poker Utilities Module
 * Contains poker-specific utility functions, hand strengths, and calculations
 */

// Poker constants and configuration
export const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2']; // descending

export const handStrengths = {
  // Pocket Pairs
  'AA': 0, 'KK': 1, 'QQ': 1, 'JJ': 2, 'TT': 4,'99': 7, '88': 9, '77': 12, '66': 16, '55': 20, '44': 23, '33': 23, '22': 24,

  // Suited
  'AKs': 2,  'AQs': 2,  'AJs': 3,  'ATs': 5,  'A9s': 8,  'A8s': 10, 'A7s': 13, 'A6s': 14, 'A5s': 12, 'A4s': 14, 'A3s': 14, 'A2s': 17,
  'KQs': 3,  'KJs': 3,  'KTs': 6,  'K9s': 10, 'K8s': 16, 'K7s': 19, 'K6s': 24, 'K5s': 25, 'K4s': 25, 'K3s': 26, 'K2s': 26,
  'QJs': 5,  'QTs': 6,  'Q9s': 10, 'Q8s': 19, 'Q7s': 26, 'Q6s': 28, 'Q5s': 29, 'Q4s': 29, 'Q3s': 30, 'Q2s': 31,
  'JTs': 6,  'J9s': 11, 'J8s': 17, 'J7s': 27, 'J6s': 33, 'J5s': 35, 'J4s': 37, 'J3s': 37, 'J2s': 38,
  'T9s': 10, 'T8s': 16, 'T7s': 25, 'T6s': 31, 'T5s': 40, 'T4s': 40, 'T3s': 41, 'T2s': 41,
  '98s': 17, '97s': 24, '96s': 29, '95s': 38, '94s': 47, '93s': 47, '92s': 49,
  '87s': 21, '86s': 27, '85s': 33, '84s': 40, '83s': 53, '82s': 54,
  '76s': 25, '75s': 28, '74s': 37, '73s': 45, '72s': 56,
  '65s': 27, '64s': 29, '63s': 38, '62s': 49,
  '54s': 28, '53s': 32, '52s': 39,
  '43s': 36, '42s': 41,
  '32s': 46,

  // Offsuit
  'AKo': 5,  'AQo': 8,  'AJo': 12, 'ATo': 18, 'A9o': 32, 'A8o': 39, 'A7o': 45, 'A6o': 51, 'A5o': 44, 'A4o': 46, 'A3o': 49, 'A2o': 54,
  'KQo': 9,  'KJo': 14, 'KTo': 20, 'K9o': 35, 'K8o': 50, 'K7o': 57, 'K6o': 60, 'K5o': 63, 'K4o': 67, 'K3o': 67, 'K2o': 69,
  'QJo': 15, 'QTo': 22, 'Q9o': 36, 'Q8o': 53, 'Q7o': 66, 'Q6o': 71, 'Q5o': 75, 'Q4o': 76, 'Q3o': 77, 'Q2o': 79,
  'JTo': 21, 'J9o': 34, 'J8o': 48, 'J7o': 64, 'J6o': 80, 'J5o': 82, 'J4o': 82, 'J3o': 86, 'J2o': 87,
  'T9o': 31, 'T8o': 43, 'T7o': 59, 'T6o': 74, 'T5o': 89, 'T4o': 90, 'T3o': 92, 'T2o': 94,
  '98o': 42, '97o': 55, '96o': 68, '95o': 83, '94o': 95, '93o': 96, '92o': 97,
  '87o': 52, '86o': 61, '85o': 73, '84o': 88, '83o': 98, '82o': 99,
  '76o': 57, '75o': 65, '74o': 78, '73o': 93, '72o': 100,
  '65o': 58, '64o': 70, '63o': 81, '62o': 95,
  '54o': 62, '53o': 72, '52o': 84,
  '43o': 76, '42o': 86,
  '32o': 91
};

/**
 * Generate hand key for grid position (i, j)
 * @param {number} i - Row index
 * @param {number} j - Column index
 * @returns {string} Hand key (e.g., 'AKs', 'AA', 'AKo')
 */
export function keyFor(i, j) {
  if (i === j) return RANKS[i] + RANKS[i]; // pair
  const r1 = RANKS[Math.min(i, j)];
  const r2 = RANKS[Math.max(i, j)];
  const suited = i < j;
  return r1 + r2 + (suited ? 's' : 'o');
}

/**
 * Calculate expected value statistics for all poker hands
 * @returns {Object} Expected mean and standard deviation
 */
export function calculateExpectedValues() {
  let weightedSum = 0;
  let totalCombinations = 0;

  for (const hand in handStrengths) {
    const strength = handStrengths[hand];
    let combinations;
    if (hand.length === 2) { // Pair
      combinations = 6;
    } else if (hand.endsWith('s')) { // Suited
      combinations = 4;
    } else { // Off-suit
      combinations = 12;
    }
    weightedSum += strength * combinations;
    totalCombinations += combinations;
  }

  const expectedMean = weightedSum / totalCombinations;

  let weightedVarianceSum = 0;
  for (const hand in handStrengths) {
    const strength = handStrengths[hand];
    let combinations;
    if (hand.length === 2) { // Pair
      combinations = 6;
    } else if (hand.endsWith('s')) { // Suited
      combinations = 4;
    } else { // Off-suit
      combinations = 12;
    }
    weightedVarianceSum += combinations * Math.pow(strength - expectedMean, 2);
  }

  const expectedVariance = weightedVarianceSum / totalCombinations;
  const expectedStdDev = Math.sqrt(expectedVariance);

  return { expectedMean, expectedStdDev };
}

/**
 * Calculate profit/loss for a session
 * @param {Object} session - Session object with buyIn and cashOut
 * @returns {number|null} Profit/loss amount or null if incomplete data
 */
export function calculateProfitLoss(session) {
  if (!session || session.buyIn === null || session.cashOut === null) {
    return null;
  }
  return session.cashOut - session.buyIn;
}

/**
 * Format profit/loss amount for display
 * @param {number|null} profitLoss - Profit/loss amount
 * @returns {string} Formatted string with sign
 */
export function formatProfitLoss(profitLoss) {
  if (profitLoss === null) return '';
  const sign = profitLoss >= 0 ? '+' : '';
  return `${sign}${profitLoss.toFixed(2)}`;
}

/**
 * Get number of combinations for a poker hand
 * @param {string} hand - Hand notation (e.g., 'AA', 'AKs', 'AKo')
 * @returns {number} Number of possible combinations
 */
export function getHandCombinations(hand) {
  if (hand.length === 2) { // Pair
    return 6;
  } else if (hand.endsWith('s')) { // Suited
    return 4;
  } else { // Off-suit
    return 12;
  }
}

/**
 * Check if a hand is a pocket pair
 * @param {string} hand - Hand notation
 * @returns {boolean} True if hand is a pocket pair
 */
export function isPocketPair(hand) {
  return hand.length === 2 && hand[0] === hand[1];
}

/**
 * Check if a hand is suited
 * @param {string} hand - Hand notation
 * @returns {boolean} True if hand is suited
 */
export function isSuited(hand) {
  return hand.endsWith('s');
}

/**
 * Get hand strength rank (lower is better)
 * @param {string} hand - Hand notation
 * @returns {number|undefined} Strength rank or undefined if not found
 */
export function getHandStrength(hand) {
  return handStrengths[hand];
}

/**
 * Calculate VPIP (Voluntarily Put money In Pot) percentage
 * @param {number} playedCount - Number of hands played
 * @param {number} totalCount - Total number of hands seen
 * @returns {number} VPIP percentage (0-100)
 */
export function calculateVPIP(playedCount, totalCount) {
  if (totalCount === 0) return 0;
  return (playedCount / totalCount) * 100;
}

/**
 * Determine play style based on VPIP percentage
 * @param {number} vpip - VPIP percentage
 * @returns {string} Play style classification
 */
export function getPlayStyle(vpip) {
  if (vpip < 15) return 'nit';
  if (vpip < 25) return 'tight';
  if (vpip < 35) return 'normal';
  if (vpip < 50) return 'loose';
  return 'maniac';
}

/**
 * Calculate weighted average hand strength for a session
 * @param {Object} counts - Hand counts object
 * @returns {number} Weighted average strength
 */
export function calculateWeightedAverageStrength(counts) {
  let totalStrength = 0;
  let totalHands = 0;

  for (const [hand, count] of Object.entries(counts)) {
    const strength = handStrengths[hand];
    if (strength !== undefined && count > 0) {
      totalStrength += strength * count;
      totalHands += count;
    }
  }

  return totalHands > 0 ? totalStrength / totalHands : 0;
}

/**
 * Generate all possible poker hands
 * @returns {Array<string>} Array of all hand notations
 */
export function getAllHands() {
  return Object.keys(handStrengths);
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}