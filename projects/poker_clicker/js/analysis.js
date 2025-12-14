// Analysis Module for Poker Clicker
// Handles statistical analysis, luck calculations, and chart generation

import { handStrengths, formatProfitLoss } from './poker-utils.js';

export class AnalysisManager {
  constructor() {
    this.histogramChart = null;
    this.bankrollChart = null;
  }

  generateUniformDistribution(count, bins = 20) {
    const expectedFrequency = count / bins;
    return new Array(bins).fill(expectedFrequency);
  }

  createHistogram(strengths, mean, expectedMean, expectedStdDev) {
    const binWidth = 5;
    const bins = 20;
    const actualData = new Array(bins).fill(0);

    // Create histogram bins for actual data
    strengths.forEach(strength => {
      const binIndex = Math.min(Math.floor(strength / binWidth), bins - 1);
      actualData[binIndex]++;
    });

    // Generate expected uniform distribution
    const expectedData = this.generateUniformDistribution(strengths.length, bins);

    // Calculate smoothed trend line using moving average of current, left, and right values
    const trendData = new Array(bins);
    for (let i = 0; i < bins; i++) {
      const left = i > 0 ? actualData[i - 1] : actualData[i];
      const current = actualData[i];
      const right = i < bins - 1 ? actualData[i + 1] : actualData[i];
      trendData[i] = (left + current + right) / 3;
    }

    // Create labels for bins
    const labels = [];
    for (let i = 0; i < bins; i++) {
      const binStart = i * binWidth;
      const binEnd = (i + 1) * binWidth;
      labels.push(`${binStart}-${binEnd}`);
    }

    const ctx = document.getElementById('histogramChart').getContext('2d');

    if (this.histogramChart) {
      this.histogramChart.destroy();
    }

    this.histogramChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Your Hands',
          data: actualData,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }, {
          label: 'Trend Line',
          data: trendData,
          type: 'line',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 3,
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: 'rgba(255, 255, 255, 1)',
          pointBorderWidth: 2,
          tension: 0.4,
        }, {
          label: 'Expected Uniform',
          data: expectedData,
          type: 'line',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.8)',
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          tension: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Frequency'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Hand Strength'
            }
          }
        },
        plugins: {
          title: {
            display: false,
            text: 'Hand Strength Distribution vs Expected'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              filter: function(legendItem, chartData) {
                return legendItem.text != 'Trend Line';
              }
            }
          }
        }
      }
    });
  }

  analyzeLuck(session, showPlayed, expectedMean, expectedStdDev, analysisResultsEl) {
    if (!session) {
      analysisResultsEl.innerHTML = '';
      return;
    }

    const handsToAnalyze = showPlayed ? session.hands.filter(hand => hand.played) : session.hands;

    if (handsToAnalyze.length === 0) {
      analysisResultsEl.innerHTML = '';
      return;
    }

    const strengths = handsToAnalyze.map(hand => handStrengths[hand.key]);
    const mean = strengths.reduce((a, b) => a + b, 0) / strengths.length;
    const zScore = (mean - expectedMean) / (expectedStdDev / Math.sqrt(handsToAnalyze.length));

    let category, categoryClass, interpretation;
    if (zScore < -1.5) {
      category = "High Roll 🚀";
      categoryClass = "high-roll";
      interpretation = "You're getting significantly better than expected hands!";
    } else if (zScore > 1.5) {
      category = "Low Roll 😩";
      categoryClass = "low-roll";
      interpretation = "You're experiencing significantly worse than expected luck with your dealt hands.";
    } else {
      category = "Expected 📊";
      categoryClass = "expected";
      interpretation = "Your dealt hands are within normal expected variance.";
    }

    analysisResultsEl.innerHTML = `
      <div class="results">
        <div class="luck-category ${categoryClass}">${category}</div>

        <div class="histogram-container">
          <h3 class="histogram-title">Hand Strength Distribution</h3>
          <div class="chart-wrapper">
            <canvas id="histogramChart"></canvas>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${mean.toFixed(1)}</div>
            <div class="stat-label">Average Strength</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${zScore.toFixed(2)}</div>
            <div class="stat-label">Z-Score</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Math.sqrt(strengths.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (strengths.length - 1)).toFixed(1)}</div>
            <div class="stat-label">Std Deviation</div>
          </div>
        </div>

        <div class="explanation">
          <h3>📈 Statistical Analysis</h3>
          <p><strong>Interpretation:</strong> ${interpretation}</p>
          <p><strong>Z-Score Explained:</strong> ${Math.abs(zScore).toFixed(2)} standard deviations ${zScore >= 0 ? 'above' : 'below'} expected. Values beyond ±1.5 are considered significantly different from normal.</p>
          <p><strong>Your Average:</strong> ${mean.toFixed(1)} vs Expected: ${expectedMean.toFixed(1)} (scale: 0-100)</p>
          <p><strong>Histogram:</strong> Blue bars show your actual hand distribution. Green trend line smooths your data to highlight patterns and deviations. Red line shows the expected uniform distribution for comparison.</p>
        </div>
      </div>
    `;

    // Create histogram after DOM is updated
    setTimeout(() => {
      this.createHistogram(strengths, mean, expectedMean, expectedStdDev);
    }, 100);
  }

  calculateAggregateStats(allSessions) {
    const sessionsWithFinancialData = allSessions.filter(s =>
      s.buyIn !== null && s.buyIn !== undefined &&
      s.cashOut !== null && s.cashOut !== undefined
    );

    let totalBuyIn = 0;
    let totalCashOut = 0;
    let totalHands = 0;
    let totalHours = 0;
    let winSessions = 0;

    // Calculate totals from sessions with financial data
    sessionsWithFinancialData.forEach(session => {
      totalBuyIn += session.buyIn;
      totalCashOut += session.cashOut;

      // Count winning sessions
      if (session.cashOut > session.buyIn) {
        winSessions++;
      }
    });

    // Calculate total hands from all sessions (not just those with financial data)
    allSessions.forEach(session => {
      totalHands += session.total || 0;
    });

    // Calculate total hours from sessions with time data
    const sessionsWithTimeData = allSessions.filter(s => s.startTime && s.endTime);
    sessionsWithTimeData.forEach(session => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const hours = (end - start) / (1000 * 60 * 60);
      if (hours > 0) {
        totalHours += hours;
      }
    });

    const netProfit = totalCashOut - totalBuyIn;
    const winPercentage = sessionsWithFinancialData.length > 0 ? (winSessions / sessionsWithFinancialData.length) * 100 : 0;
    const avgBuyIn = sessionsWithFinancialData.length > 0 ? totalBuyIn / sessionsWithFinancialData.length : 0;
    const avgProfit = sessionsWithFinancialData.length > 0 ? netProfit / sessionsWithFinancialData.length : 0;
    const dollarsPerHour = totalHours > 0 ? netProfit / totalHours : 0;

    return {
      totalBuyIn,
      totalCashOut,
      netProfit,
      totalSessions: allSessions.length,
      sessionsWithFinancialData: sessionsWithFinancialData.length,
      totalHands,
      winPercentage,
      avgBuyIn,
      avgProfit,
      dollarsPerHour,
      totalHours
    };
  }

  prepareBankrollChartData(allSessions) {
    const sessionsWithFinancialData = allSessions
      .filter(s => s.buyIn !== null && s.buyIn !== undefined &&
                   s.cashOut !== null && s.cashOut !== undefined)
      .sort((a, b) => new Date(a.created) - new Date(b.created)); // Sort by creation date

    if (sessionsWithFinancialData.length === 0) {
      return { labels: [], data: [], sessionProfits: [], pointColors: [] };
    }

    const labels = [];
    const cumulativeBankroll = [];
    const sessionProfits = [];
    const pointColors = [];
    let runningTotal = 0;

    sessionsWithFinancialData.forEach((session, index) => {
      const sessionProfit = session.cashOut - session.buyIn;
      runningTotal += sessionProfit;

      labels.push(`${index + 1}`);
      cumulativeBankroll.push(runningTotal);
      sessionProfits.push(sessionProfit);
      pointColors.push(sessionProfit >= 0 ? '#10b981' : '#ef4444');
    });

    return { labels, data: cumulativeBankroll, sessionProfits, pointColors };
  }

  createBankrollChart(allSessions) {
    const chartData = this.prepareBankrollChartData(allSessions);

    if (chartData.labels.length === 0) {
      const canvas = document.getElementById('bankrollChart');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'center';
      ctx.fillText('No financial data available', canvas.width / 2, canvas.height / 2);
      return;
    }

    const ctx = document.getElementById('bankrollChart').getContext('2d');

    if (this.bankrollChart) {
      this.bankrollChart.destroy();
    }

    this.bankrollChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Cumulative Bankroll',
          data: chartData.data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.1,
          pointBackgroundColor: chartData.pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: false
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(0);
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Session Number'
            }
          }
        },
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return 'Session ' + context[0].label;
              },
              label: function(context) {
                const sessionProfit = chartData.sessionProfits[context.dataIndex];
                return [
                  'Bankroll: $' + context.parsed.y.toFixed(2),
                  'Session P/L: ' + (sessionProfit >= 0 ? '+' : '') + '$' + sessionProfit.toFixed(2)
                ];
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  renderAggregateStats(stats, detailsContainer) {
    const detailsSection = detailsContainer.querySelector('.details-section');
    detailsSection.innerHTML = `
      <h3 class="details-title">All Sessions Statistics</h3>

      <div class="aggregate-section">
        <h4 class="aggregate-section-title">Summary</h4>
        <div class="aggregate-stats-grid">
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value ${stats.netProfit >= 0 ? 'positive' : 'negative'}">${formatProfitLoss(stats.netProfit)}</div>
            <div class="aggregate-stat-label">Net Profit</div>
          </div>
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value">${stats.totalBuyIn.toFixed(2)}</div>
            <div class="aggregate-stat-label">Total Buy-in</div>
          </div>
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value">${stats.totalCashOut.toFixed(2)}</div>
            <div class="aggregate-stat-label">Total Cash-out</div>
          </div>
        </div>
      </div>

      <div class="aggregate-section">
        <h4 class="aggregate-section-title">Sessions</h4>
        <div class="aggregate-stats-grid">
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value">${stats.totalSessions}</div>
            <div class="aggregate-stat-label"># of Sessions</div>
          </div>
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value">${stats.totalHands}</div>
            <div class="aggregate-stat-label"># of Hands</div>
          </div>
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value ${stats.dollarsPerHour >= 0 ? 'positive' : 'negative'}">${stats.dollarsPerHour.toFixed(2)}/hr</div>
            <div class="aggregate-stat-label">$/hr</div>
          </div>
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value">${stats.winPercentage.toFixed(1)}%</div>
            <div class="aggregate-stat-label">Win %</div>
          </div>
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value">${stats.avgBuyIn.toFixed(2)}</div>
            <div class="aggregate-stat-label">Avg Buy-in</div>
          </div>
          <div class="aggregate-stat-card">
            <div class="aggregate-stat-value ${stats.avgProfit >= 0 ? 'positive' : 'negative'}">${formatProfitLoss(stats.avgProfit)}</div>
            <div class="aggregate-stat-label">Avg Profit</div>
          </div>
        </div>
      </div>

      <div class="aggregate-section">
        <h4 class="aggregate-section-title">Bankroll</h4>
        <div class="bankroll-chart-container">
          <canvas id="bankrollChart"></canvas>
        </div>
      </div>
    `;

    // Create the bankroll chart after DOM is updated
    setTimeout(() => {
      this.createBankrollChart(Object.values(stats.allSessions || {}));
    }, 100);
  }
}