/*
 * js/calculators/sip.js
 * Logic for the SIP Calculator, including Chart.js rendering and FutureFund engine integration.
 */

const fmt = FutureFundUtils.formatCurrency;

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inSip = document.getElementById('inSip');
    const inRate = document.getElementById('inRate');
    const inYears = document.getElementById('inYears');
    
    const valSip = document.getElementById('valSip');
    const valRate = document.getElementById('valRate');
    const valYears = document.getElementById('valYears');

    const resInvested = document.getElementById('resInvested');
    const resReturns = document.getElementById('resReturns');
    const resTotal = document.getElementById('resTotal');
    const interpretationText = document.getElementById('interpretationText');
    const personalizedSuggestion = document.getElementById('personalizedSuggestion');

    let sipChart = null;
    let financialReport = FutureFundStorage.get('financial_report');

    // Auto-fill from planner if available
    if (financialReport && financialReport.metrics) {
        // If they have a surplus, suggest that as a default SIP if it's > 500
        const surplus = financialReport.metrics.surplus;
        if (surplus >= 500) {
            // Suggest 40% of surplus as default SIP
            let defaultSip = Math.round((surplus * 0.4) / 500) * 500;
            if (defaultSip < 500) defaultSip = 500;
            if (defaultSip > 100000) defaultSip = 100000;
            inSip.value = defaultSip;
        }
    }

    function initChart() {
        const ctx = document.getElementById('sipChart').getContext('2d');
        sipChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { 
                        stacked: true, 
                        border: { display: false },
                        ticks: {
                            callback: (val) => '₹' + FutureFundUtils.formatNumber(val),
                            maxTicksLimit: 6
                        }
                    }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}`
                        }
                    }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });
    }

    function updateCalculator() {
        const sip = parseFloat(inSip.value);
        const rate = parseFloat(inRate.value);
        const years = parseInt(inYears.value);

        // Update Labels
        valSip.textContent = fmt(sip);
        valRate.textContent = rate + '%';
        valYears.textContent = years + (years === 1 ? ' Year' : ' Years');

        // Calculate
        const result = FutureFundMath.calculateSIP(sip, rate, years);
        const schedule = FutureFundMath.generateSIPSchedule(sip, rate, years);

        // Update Results
        resInvested.textContent = fmt(result.investedAmount);
        resReturns.textContent = fmt(result.estimatedReturns);
        resTotal.textContent = fmt(result.totalValue);

        // Interpretation
        interpretationText.innerHTML = `By investing <strong>${fmt(sip)}</strong> every month for <strong>${years} years</strong> at an expected return of <strong>${rate}%</strong>, your total investment of <strong>${fmt(result.investedAmount)}</strong> will grow to approximately <strong>${fmt(result.totalValue)}</strong>.`;

        // Update Chart
        const labels = schedule.map(s => `Year ${s.year}`);
        const investedData = schedule.map(s => s.invested);
        const returnsData = schedule.map(s => s.value - s.invested);

        sipChart.data = {
            labels: labels,
            datasets: [
                {
                    label: 'Invested Amount',
                    data: investedData,
                    backgroundColor: 'rgba(30, 58, 138, 0.8)', // Primary
                    borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
                },
                {
                    label: 'Estimated Returns',
                    data: returnsData,
                    backgroundColor: 'rgba(22, 163, 74, 0.8)', // Success/Green
                    borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
                }
            ]
        };
        sipChart.update();

        generatePersonalizedSuggestion(sip, result.totalValue, years);
    }

    function generatePersonalizedSuggestion(currentSip, futureValue, years) {
        if (!financialReport || !financialReport.metrics) {
            personalizedSuggestion.innerHTML = '';
            return;
        }

        const surplus = financialReport.metrics.surplus;
        let suggestionHtml = '';

        if (surplus <= 0) {
            suggestionHtml = `<i class="fas fa-exclamation-circle text-warning me-2"></i><strong>FutureFund Insight:</strong> Your current budget shows a deficit. Focus on reducing expenses or increasing income before committing to a monthly SIP.`;
            personalizedSuggestion.className = 'suggestion-box bg-warning-subtle border-warning';
        } else if (currentSip > surplus) {
            suggestionHtml = `<i class="fas fa-exclamation-triangle text-danger me-2"></i><strong>Warning:</strong> This SIP of ${fmt(currentSip)} is higher than your monthly surplus of ${fmt(surplus)}. You may need to cut expenses to sustain this.`;
            personalizedSuggestion.className = 'suggestion-box bg-danger-subtle border-danger';
        } else if (currentSip < surplus * 0.2) {
            const potentialSip = Math.round((surplus * 0.4) / 500) * 500;
            const potentialResult = FutureFundMath.calculateSIP(potentialSip, parseFloat(inRate.value), years);
            suggestionHtml = `<i class="fas fa-lightbulb text-success me-2"></i><strong>FutureFund Insight:</strong> You have a healthy surplus of ${fmt(surplus)}. If you increase this SIP to <strong>${fmt(potentialSip)}</strong>, you could accumulate <strong>${fmt(potentialResult.totalValue)}</strong> in the same timeframe!`;
            personalizedSuggestion.className = 'suggestion-box'; // default green
        } else {
            // Check goals
            const goals = financialReport.goals || [];
            if (goals.length > 0) {
                const targetGoal = goals[0];
                if (futureValue >= targetGoal.target && years <= targetGoal.yearsLeft) {
                    suggestionHtml = `<i class="fas fa-check-circle text-success me-2"></i><strong>On Track:</strong> This SIP is sufficient to fully fund your top goal: "${targetGoal.name}" (${fmt(targetGoal.target)}).`;
                } else {
                    suggestionHtml = `<i class="fas fa-info-circle text-primary me-2"></i><strong>FutureFund Insight:</strong> You are investing a good portion of your surplus. Keep it up!`;
                }
            } else {
                suggestionHtml = `<i class="fas fa-check-circle text-success me-2"></i><strong>Great Job:</strong> You are utilizing your surplus efficiently to build long-term wealth.`;
            }
            personalizedSuggestion.className = 'suggestion-box';
        }

        personalizedSuggestion.innerHTML = suggestionHtml;
    }

    // Event Listeners
    inSip.addEventListener('input', updateCalculator);
    inRate.addEventListener('input', updateCalculator);
    inYears.addEventListener('input', updateCalculator);

    // Initialize
    initChart();
    updateCalculator();
});
