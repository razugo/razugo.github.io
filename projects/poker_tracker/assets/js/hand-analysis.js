// Session hand analysis utilities for PokerTracker
// Provides dealt-hand luck classification and histogram rendering

(function(window) {
  window.PokerTracker = window.PokerTracker || {};

  const handStrengths = (window.PokerTracker.Constants && window.PokerTracker.Constants.handStrengths) || {};

  const state = {
    histogramChart: null,
    expectedStats: calculateExpectedValues()
  };

  function calculateExpectedValues() {
    const entries = Object.entries(handStrengths);
    if (!entries.length) {
      return { expectedMean: 0, expectedStdDev: 1 };
    }

    let weightedSum = 0;
    let totalCombinations = 0;

    entries.forEach(([hand, strength]) => {
      const combinations = getCombinations(hand);
      weightedSum += strength * combinations;
      totalCombinations += combinations;
    });

    const expectedMean = totalCombinations === 0 ? 0 : (weightedSum / totalCombinations);

    let varianceSum = 0;
    entries.forEach(([hand, strength]) => {
      const combinations = getCombinations(hand);
      varianceSum += combinations * Math.pow(strength - expectedMean, 2);
    });

    const expectedVariance = totalCombinations === 0 ? 0 : (varianceSum / totalCombinations);
    const expectedStdDev = Math.sqrt(expectedVariance);

    return { expectedMean, expectedStdDev };
  }

  function getCombinations(hand) {
    if (hand.length === 2) return 6;
    if (hand.endsWith('s')) return 4;
    return 12;
  }

  function getThemeColors() {
    const styles = window.getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--primary').trim() || '#2563eb';
    const success = styles.getPropertyValue('--success').trim() || '#22c55e';
    const danger = styles.getPropertyValue('--danger').trim() || '#ef4444';
    const textSecondary = styles.getPropertyValue('--text-secondary').trim() || 'rgba(100, 116, 139, 0.9)';
    const gridColor = 'rgba(148, 163, 184, 0.18)';

    return {
      primary,
      primaryFill: 'rgba(37, 99, 235, 0.18)',
      trend: primary,
      expected: 'rgba(148, 163, 184, 0.8)',
      axis: textSecondary,
      grid: gridColor,
      success,
      danger
    };
  }

  function classifyLuck(zScore) {
    if (Number.isNaN(zScore)) {
      return {
        label: 'Not Enough Data',
        className: 'expected',
        message: 'Add more hands to generate a reliable read on variance.'
      };
    }

    if (zScore <= -1.5) {
      return {
        label: 'High Roll 🚀',
        className: 'high-roll',
        message: "You're running well above expectation. Enjoy the heater!"
      };
    }

    if (zScore >= 1.5) {
      return {
        label: 'Low Roll 😩',
        className: 'low-roll',
        message: "You're catching colder hands than expected. Stay patient."
      };
    }

    return {
      label: 'Expected 📊',
      className: 'expected',
      message: 'Your dealt range is within normal variance.'
    };
  }

  function computeStats(strengths) {
    const sample = strengths.length;
    const mean = strengths.reduce((total, value) => total + value, 0) / sample;
    let variance = 0;

    if (sample > 1) {
      const sum = strengths.reduce((total, value) => total + Math.pow(value - mean, 2), 0);
      variance = sum / (sample - 1);
    }

    const stdDev = Math.sqrt(variance);
    const { expectedMean, expectedStdDev } = state.expectedStats;
    const stdError = expectedStdDev / Math.sqrt(sample);
    const zScore = stdError === 0 ? 0 : (mean - expectedMean) / stdError;

    return { mean, stdDev, zScore, sample };
  }

  function buildHistogram(strengths) {
    const bins = 20;
    const binWidth = 5;
    const actual = new Array(bins).fill(0);

    strengths.forEach(strength => {
      const index = Math.min(Math.floor(strength / binWidth), bins - 1);
      actual[index]++;
    });

    const expected = new Array(bins).fill(strengths.length / bins);
    const trend = new Array(bins).fill(0);

    for (let i = 0; i < bins; i++) {
      const left = i > 0 ? actual[i - 1] : actual[i];
      const current = actual[i];
      const right = i < bins - 1 ? actual[i + 1] : actual[i];
      trend[i] = (left + current + right) / 3;
    }

    const labels = [];
    for (let i = 0; i < bins; i++) {
      const start = i * binWidth;
      const end = (i + 1) * binWidth;
      labels.push(`${start}-${end}`);
    }

    return { labels, actual, expected, trend };
  }

  function renderHistogram(canvas, strengths) {
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    if (state.histogramChart) {
      state.histogramChart.destroy();
      state.histogramChart = null;
    }

    const { labels, actual, expected, trend } = buildHistogram(strengths);
    const colors = getThemeColors();

    state.histogramChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Your Hands',
            data: actual,
            backgroundColor: colors.primaryFill,
            borderColor: colors.primary,
            borderWidth: 1,
            maxBarThickness: 18
          },
          {
            label: 'Trend',
            data: trend,
            type: 'line',
            borderColor: colors.primary,
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius: 0
          },
          {
            label: 'Expected',
            data: expected,
            type: 'line',
            borderColor: colors.expected,
            borderWidth: 2,
            borderDash: [6, 4],
            fill: false,
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hand Strength (0 strongest → 100 weakest)',
              color: colors.axis,
              font: { size: 13 }
            },
            ticks: {
              color: colors.axis
            },
            grid: {
              color: colors.grid
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: colors.axis
            },
            grid: {
              color: colors.grid
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              color: colors.axis
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            borderColor: 'rgba(30, 64, 175, 0.5)',
            borderWidth: 1,
            padding: 10,
            titleColor: '#e2e8f0',
            bodyColor: '#e2e8f0'
          }
        }
      }
    });
  }

  function showEmpty(elements, message) {
    if (!elements) {
      return;
    }

    if (state.histogramChart) {
      state.histogramChart.destroy();
      state.histogramChart = null;
    }

    if (elements.card) {
      elements.card.classList.add('analysis-empty');
    }

    if (elements.body) {
      elements.body.classList.add('is-hidden');
    }

    if (elements.empty) {
      elements.empty.textContent = message;
      elements.empty.classList.remove('is-hidden');
    }

    if (elements.badge) {
      elements.badge.textContent = 'Expected 📊';
      elements.badge.className = 'luck-badge expected';
    }

    if (elements.avg) elements.avg.textContent = '-';
    if (elements.zScore) elements.zScore.textContent = '-';
    if (elements.stdDev) elements.stdDev.textContent = '-';
    if (elements.sample) elements.sample.textContent = '';
    if (elements.description) elements.description.textContent = '';
  }

  function updateUI(elements, stats, classification, usePlayedOnly) {
    if (elements.card) {
      elements.card.classList.remove('analysis-empty');
    }

    if (elements.empty) {
      elements.empty.classList.add('is-hidden');
    }

    if (elements.body) {
      elements.body.classList.remove('is-hidden');
    }

    if (elements.badge) {
      elements.badge.textContent = classification.label;
      elements.badge.className = `luck-badge ${classification.className}`;
    }

    if (elements.avg) {
      elements.avg.textContent = stats.mean.toFixed(1);
    }

    if (elements.zScore) {
      const z = stats.zScore;
      const prefix = z >= 0 ? '+' : '';
      elements.zScore.textContent = `${prefix}${z.toFixed(2)}`;
    }

    if (elements.stdDev) {
      elements.stdDev.textContent = stats.stdDev.toFixed(1);
    }

    if (elements.sample) {
      const qualifier = usePlayedOnly ? 'played' : 'dealt';
      elements.sample.textContent = `${stats.sample} ${qualifier} hands analyzed.`;
    }

    if (elements.description) {
      const { expectedMean } = state.expectedStats;
      const distance = Math.abs(stats.zScore).toFixed(2);
      const direction = stats.zScore >= 0 ? 'above' : 'below';
      elements.description.textContent = `${classification.message} Average strength ${stats.mean.toFixed(1)} vs expected ${expectedMean.toFixed(1)}. That is ${distance} standard deviations ${direction} expectation.`;
    }
  }

  window.PokerTracker.HandAnalysis = {
    update({ handHistory, usePlayedOnly, elements }) {
      if (!elements) {
        return;
      }

      const source = Array.isArray(handHistory) ? handHistory : [];
      const filtered = usePlayedOnly ? source.filter(hand => hand && hand.played) : source;
      const strengths = filtered
        .map(hand => handStrengths[hand?.key])
        .filter(value => typeof value === 'number');

      const sampleLabel = usePlayedOnly ? 'played hands' : 'hands';

      if (strengths.length === 0) {
        const message = usePlayedOnly
          ? 'Mark some hands as played to run this analysis.'
          : 'Track some hands to unlock hand analysis.';
        showEmpty(elements, message);
        return;
      }

      if (strengths.length < 5) {
        showEmpty(elements, `Add at least 5 ${sampleLabel} to generate a reliable read.`);
        return;
      }

      const stats = computeStats(strengths);
      const classification = classifyLuck(stats.zScore);

      updateUI(elements, stats, classification, usePlayedOnly);
      renderHistogram(elements.chartCanvas, strengths);
    },

    clear(elements, message) {
      showEmpty(elements, message || 'Track some hands to unlock hand analysis.');
    }
  };
})(window);
