// Session hand analysis utilities for PokerTracker
// Provides dealt-hand luck classification and histogram rendering

(function(window) {
  window.PokerTracker = window.PokerTracker || {};

  const handStrengths = (window.PokerTracker.Constants && window.PokerTracker.Constants.handStrengths) || {};

  const state = {
    individualHandsChart: null,
    histogramChart: null,
    expectedStats: calculateExpectedValues(),
    currentCarouselIndex: 0,
    handGroups: []
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

  function buildGroupedAverage(strengths) {
    // Build grouped 8-hand averages (batches, not rolling)
    const groupSize = 8;
    const groupedAvg = [];

    for (let i = 0; i < strengths.length; i += groupSize) {
      const group = strengths.slice(i, i + groupSize);
      const avg = group.reduce((sum, val) => sum + val, 0) / group.length;
      groupedAvg.push(avg);
    }

    return groupedAvg;
  }

  function buildGroupedPlayedPercentage(handHistory) {
    // Build grouped 8-hand played percentage (batches, not rolling)
    const groupSize = 8;
    const groupedPercentage = [];

    for (let i = 0; i < handHistory.length; i += groupSize) {
      const group = handHistory.slice(i, i + groupSize);
      const playedCount = group.filter(hand => hand && hand.played).length;
      const percentage = (playedCount / group.length) * 100;
      groupedPercentage.push(percentage);
    }

    return groupedPercentage;
  }

  function buildHandGroups(handHistory, strengths) {
    // Build detailed hand groups with individual hand data
    const groupSize = 8;
    const groups = [];

    for (let i = 0; i < handHistory.length; i += groupSize) {
      const groupHands = handHistory.slice(i, i + groupSize);
      const groupStrengths = strengths.slice(i, i + groupSize);

      const playedCount = groupHands.filter(hand => hand && hand.played).length;
      const playedPercentage = (playedCount / groupHands.length) * 100;
      const avgStrength = groupStrengths.reduce((sum, val) => sum + val, 0) / groupStrengths.length;

      const hands = groupHands.map((hand, idx) => ({
        key: hand?.key || '',
        played: hand?.played || false,
        strength: groupStrengths[idx] || 0,
        position: hand?.position || (i + idx + 1)
      }));

      groups.push({
        startHand: i + 1,
        endHand: i + groupHands.length,
        hands: hands,
        avgStrength: avgStrength,
        playedCount: playedCount,
        playedPercentage: playedPercentage,
        totalHands: groupHands.length
      });
    }

    return groups;
  }

  function calculateMovingAverage(data, windowSize) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(avg);
    }
    return result;
  }

  function renderIndividualHandsChart(canvas, strengths, handHistory) {
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    if (state.individualHandsChart) {
      state.individualHandsChart.destroy();
      state.individualHandsChart = null;
    }

    const { expectedMean } = state.expectedStats;
    const colors = getThemeColors();

    // Create labels for x-axis (hand numbers)
    const labels = strengths.map((_, i) => i + 1);

    // Create expected line data (flat line at expected mean)
    const expectedLine = new Array(strengths.length).fill(expectedMean);

    // Calculate 8-hand moving average
    const movingAvgWindow = 8;
    const movingAverage = calculateMovingAverage(strengths, movingAvgWindow);

    // Determine point colors based on whether hand was played
    const pointColors = handHistory.map(hand => {
      return hand && hand.played ? colors.success : colors.primary;
    });

    state.individualHandsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Hand Strength',
            data: strengths,
            borderColor: colors.primary,
            borderWidth: 1.5,
            fill: false,
            tension: 0,
            showLine: false,
            pointRadius: 3,
            pointBackgroundColor: pointColors,
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: pointColors,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            yAxisID: 'y',
            pointStyle: 'circle',
            pointHitRadius: 8
          },
          {
            label: `${movingAvgWindow}-Hand MA`,
            data: movingAverage,
            borderColor: colors.trend,
            borderWidth: 2.5,
            fill: false,
            tension: 0.2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: colors.trend,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Expected Average',
            data: expectedLine,
            borderColor: colors.expected,
            borderWidth: 2,
            borderDash: [6, 4],
            fill: false,
            pointRadius: 0,
            tension: 0,
            yAxisID: 'y',
            hidden: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_event, activeElements) => {
          if (activeElements.length > 0) {
            const clickedIndex = activeElements[0].index;
            // Calculate which group this hand belongs to (8 hands per group)
            const groupIndex = Math.floor(clickedIndex / 8);
            // Jump to the corresponding carousel card
            if (groupIndex >= 0 && groupIndex < state.handGroups.length) {
              state.currentCarouselIndex = groupIndex;
              renderCarousel();
              // Smooth scroll to carousel
              const carousel = document.getElementById('handGroupsCarousel');
              if (carousel) {
                carousel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hand Number',
              color: colors.axis,
              font: { size: 13 }
            },
            ticks: {
              color: colors.axis,
              maxTicksLimit: 10
            },
            grid: {
              color: colors.grid
            }
          },
          y: {
            reverse: true,
            min: 0,
            max: 100,
            position: 'left',
            title: {
              display: true,
              text: 'Hand Strength',
              color: colors.axis,
              font: { size: 13 }
            },
            ticks: {
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
              color: colors.axis,
              filter: function(legendItem, chartData) {
                return legendItem.text !== 'Expected Average';
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            borderColor: 'rgba(30, 64, 175, 0.5)',
            borderWidth: 1,
            padding: 10,
            titleColor: '#e2e8f0',
            bodyColor: '#e2e8f0',
            callbacks: {
              title: function(context) {
                const handNum = context[0].label;
                const handIndex = parseInt(handNum) - 1;
                const hand = handHistory[handIndex];
                const handKey = hand?.key || 'Unknown';
                const played = hand?.played ? ' (Played)' : '';
                return `Hand #${handNum}: ${handKey}${played}`;
              },
              label: function(context) {
                const value = context.parsed.y.toFixed(1);
                return `${context.dataset.label}: ${value}`;
              }
            }
          }
        }
      }
    });
  }

  function renderHistogram(canvas, strengths, handHistory) {
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

    const groupedAvg = buildGroupedAverage(strengths);
    const groupedPlayedPct = buildGroupedPlayedPercentage(handHistory || []);
    const { expectedMean } = state.expectedStats;
    const colors = getThemeColors();

    // Create labels for x-axis (batch numbers)
    const labels = groupedAvg.map((_, i) => `${i + 1}`);

    // Create expected line data (flat line at expected mean)
    const expectedLine = new Array(groupedAvg.length).fill(expectedMean);

    state.histogramChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '8-Hand Avg',
            data: groupedAvg,
            borderColor: colors.primary,
            borderWidth: 2.5,
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: colors.primary,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: colors.primary,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            yAxisID: 'y',
            pointStyle: 'circle',
            pointHitRadius: 10
          },
          {
            label: 'Expected Average',
            data: expectedLine,
            borderColor: colors.expected,
            borderWidth: 2,
            borderDash: [6, 4],
            fill: false,
            pointRadius: 0,
            tension: 0,
            yAxisID: 'y',
            hidden: false
          },
          {
            label: 'Hands Played %',
            data: groupedPlayedPct,
            borderColor: colors.success,
            borderWidth: 2.5,
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: colors.success,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: colors.success,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const clickedIndex = activeElements[0].index;
            // Jump to the corresponding carousel card
            if (clickedIndex >= 0 && clickedIndex < state.handGroups.length) {
              state.currentCarouselIndex = clickedIndex;
              renderCarousel();
              // Smooth scroll to carousel
              const carousel = document.getElementById('handGroupsCarousel');
              if (carousel) {
                carousel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hand Range (batches of 8)',
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
            reverse: true,
            min: 0,
            max: 100,
            position: 'left',
            title: {
              display: true,
              text: 'Hand Strength',
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
          y1: {
            min: 0,
            max: 100,
            position: 'right',
            title: {
              display: true,
              text: 'Played %',
              color: colors.success,
              font: { size: 13 }
            },
            ticks: {
              color: colors.success,
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              drawOnChartArea: false
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
              color: colors.axis,
              filter: function(legendItem) {
                return legendItem.text !== 'Expected Average';
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            borderColor: 'rgba(30, 64, 175, 0.5)',
            borderWidth: 1,
            padding: 10,
            titleColor: '#e2e8f0',
            bodyColor: '#e2e8f0',
            callbacks: {
              title: function(context) {
                return `Hands ${context[0].label}`;
              },
              label: function(context) {
                const value = context.parsed.y.toFixed(1);
                const suffix = context.dataset.yAxisID === 'y1' ? '%' : '';
                return `${context.dataset.label}: ${value}${suffix}`;
              }
            }
          }
        }
      }
    });
  }

  function renderCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselIndicator = document.getElementById('carouselIndicator');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!carouselTrack || state.handGroups.length === 0) {
      return;
    }

    // Clear existing cards
    carouselTrack.innerHTML = '';

    // Build cards for each group
    state.handGroups.forEach((group, index) => {
      const card = document.createElement('div');
      card.className = 'hand-group-card';

      const header = `
        <div class="hand-group-header">
          <div class="hand-group-title">Hands ${group.startHand}-${group.endHand}</div>
          <div class="hand-group-stats">
            <div class="hand-group-stat">
              <span class="hand-group-stat-label">Avg Strength</span>
              <span class="hand-group-stat-value">${group.avgStrength.toFixed(1)}</span>
            </div>
            <div class="hand-group-stat">
              <span class="hand-group-stat-label">Played</span>
              <span class="hand-group-stat-value">${group.playedPercentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      `;

      const handsGrid = document.createElement('div');
      handsGrid.className = 'hand-group-hands';

      group.hands.forEach(hand => {
        const handCard = document.createElement('div');
        handCard.className = `hand-group-hand${hand.played ? ' played' : ''}`;
        handCard.innerHTML = `
          <div class="hand-group-hand-code">${hand.key}</div>
          <div class="hand-group-hand-strength">Str: ${hand.strength.toFixed(1)}</div>
          <div class="hand-group-hand-position">#${hand.position}</div>
        `;
        handsGrid.appendChild(handCard);
      });

      card.innerHTML = header;
      card.appendChild(handsGrid);
      carouselTrack.appendChild(card);
    });

    // Update indicator and buttons
    if (carouselIndicator) {
      carouselIndicator.textContent = `${state.currentCarouselIndex + 1} / ${state.handGroups.length}`;
    }

    if (prevBtn) {
      prevBtn.disabled = state.currentCarouselIndex === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = state.currentCarouselIndex >= state.handGroups.length - 1;
    }

    // Update transform
    // Calculate offset accounting for card width + gap
    // Each card: calc(100% - 1rem) width, plus 1rem gap = 100% total per card
    const offset = -state.currentCarouselIndex * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;
  }

  function initCarousel() {
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.currentCarouselIndex > 0) {
          state.currentCarouselIndex--;
          renderCarousel();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.currentCarouselIndex < state.handGroups.length - 1) {
          state.currentCarouselIndex++;
          renderCarousel();
        }
      });
    }
  }

  function showEmpty(elements, message) {
    if (!elements) {
      return;
    }

    if (state.individualHandsChart) {
      state.individualHandsChart.destroy();
      state.individualHandsChart = null;
    }

    if (state.histogramChart) {
      state.histogramChart.destroy();
      state.histogramChart = null;
    }

    // Clear carousel
    state.handGroups = [];
    state.currentCarouselIndex = 0;
    const carouselTrack = document.getElementById('carouselTrack');
    if (carouselTrack) {
      carouselTrack.innerHTML = '';
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

      // Build hand groups and render carousel
      state.handGroups = buildHandGroups(filtered, strengths);
      state.currentCarouselIndex = 0;

      updateUI(elements, stats, classification, usePlayedOnly);
      renderIndividualHandsChart(elements.individualHandsCanvas, strengths, filtered);
      renderHistogram(elements.chartCanvas, strengths, filtered);
      renderCarousel();
    },

    clear(elements, message) {
      showEmpty(elements, message || 'Track some hands to unlock hand analysis.');
    },

    init() {
      initCarousel();
    }
  };
})(window);
