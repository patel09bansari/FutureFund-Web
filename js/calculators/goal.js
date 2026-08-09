/**
 * js/calculators/goal.js
 * Logic and Chart rendering for the Goal Savings Calculator.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const inTarget = document.getElementById('inTarget');
    const inCurrent = document.getElementById('inCurrent');
    const inYears = document.getElementById('inYears');
    const inRate = document.getElementById('inRate');
    
    const valTarget = document.getElementById('valTarget');
    const valCurrent = document.getElementById('valCurrent');
    const valYears = document.getElementById('valYears');
    const valRate = document.getElementById('valRate');
    
    const resMonthly = document.getElementById('resMonthly');
    const resTarget = document.getElementById('resTarget');
    
    const interpretationText = document.getElementById('interpretationText');
    const suggestionBox = document.getElementById('personalizedSuggestion');
    
    let chartInstance = null;
    
    // 2. Formatters
    const fmt = FutureFundUtils.formatCurrency;
    
    // 3. Main Calculation Function
    function calculate() {
        const target = parseFloat(inTarget.value);
        let current = parseFloat(inCurrent.value);
        const years = parseFloat(inYears.value);
        const rate = parseFloat(inRate.value);
        
        // Prevent current savings from exceeding target
        if (current > target) {
            current = target;
            inCurrent.value = target;
        }

        // Update display labels
        valTarget.textContent = fmt(target).replace('₹', '');
        valCurrent.textContent = fmt(current).replace('₹', '');
        valYears.textContent = years;
        valRate.textContent = rate + '%';
        
        // Core Math
        const monthlyRate = (rate / 12) / 100;
        const totalMonths = years * 12;
        
        // Calculate what current savings will grow to
        let fvOfCurrent = 0;
        if (monthlyRate === 0) {
            fvOfCurrent = current;
        } else {
            fvOfCurrent = current * Math.pow(1 + monthlyRate, totalMonths);
        }
        
        // Target shortfall that needs to be met by monthly savings
        const shortfall = target - fvOfCurrent;
        
        let requiredMonthly = 0;
        
        if (shortfall <= 0) {
            // Current savings will reach the goal on their own!
            requiredMonthly = 0;
        } else {
            if (monthlyRate === 0) {
                requiredMonthly = shortfall / totalMonths;
            } else {
                // Reverse FV of Annuity: PMT = Shortfall * [ r / ((1+r)^n - 1) ]
                const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
                requiredMonthly = shortfall * (monthlyRate / (compoundFactor - 1));
            }
        }
        
        // Update DOM
        resTarget.textContent = fmt(target);
        resMonthly.textContent = fmt(Math.ceil(requiredMonthly)) + ' /mo';
        
        // Calculate components for chart
        const totalPrincipalContributed = (requiredMonthly * totalMonths) + current;
        const totalWealthGained = target - totalPrincipalContributed;
        
        // Interpretation
        if (requiredMonthly === 0) {
            interpretationText.innerHTML = `Your current savings of <strong>${fmt(current)}</strong> is already enough to reach your goal!`;
            suggestionBox.innerHTML = '';
        } else {
            interpretationText.innerHTML = `You need to invest <strong>${fmt(Math.ceil(requiredMonthly))} every month</strong> to reach your goal of ${fmt(target)}.`;
            
            // Educational Suggestion based on asset allocation rule of thumb
            let suggestionHtml = '';
            if (years <= 3) {
                suggestionHtml = `
                    <div class="suggestion-box" style="background:#fffbeb;border-color:#fef3c7;color:#b45309">
                        <strong><i class="fas fa-shield-alt me-1"></i> Short Term Goal:</strong> 
                        For goals less than 3 years away, stock markets are too risky. Stick to Bank FDs, Recurring Deposits, or Liquid Mutual Funds. Lower your expected return to 6-7%.
                    </div>
                `;
            } else if (years > 7) {
                suggestionHtml = `
                    <div class="suggestion-box" style="background:#f0fdf4;border-color:#bbf7d0;color:#15803d">
                        <strong><i class="fas fa-chart-line me-1"></i> Long Term Goal:</strong> 
                        Since you have over 7 years, you can invest heavily in Equity Mutual Funds (Index Funds) to beat inflation and compound your wealth.
                    </div>
                `;
            } else {
                suggestionHtml = `
                    <div class="suggestion-box">
                        <strong><i class="fas fa-balance-scale me-1"></i> Medium Term Goal:</strong> 
                        Consider a balanced approach. A mix of 50% Equity and 50% Debt can provide growth while managing risk.
                    </div>
                `;
            }
            suggestionBox.innerHTML = suggestionHtml;
        }
        
        // Update Chart
        updateChart(current, requiredMonthly * totalMonths, totalWealthGained);
    }
    
    // 4. Chart Logic
    function updateChart(currentSavings, newContributions, wealthGained) {
        const ctx = document.getElementById('goalChart').getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const textColor = isDark ? '#94a3b8' : '#64748b';
        
        if (chartInstance) {
            chartInstance.data.datasets[0].data = [Math.max(0, currentSavings), Math.max(0, newContributions), Math.max(0, wealthGained)];
            chartInstance.options.plugins.legend.labels.color = textColor;
            chartInstance.update();
            return;
        }
        
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Current Savings', 'New Monthly Contributions', 'Wealth Gained (Interest)'],
                datasets: [{
                    data: [Math.max(0, currentSavings), Math.max(0, newContributions), Math.max(0, wealthGained)],
                    backgroundColor: [
                        isDark ? '#6366f1' : '#4f46e5', // Indigo
                        isDark ? '#3b82f6' : '#1d4ed8', // Blue
                        isDark ? '#10b981' : '#059669'  // Emerald
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, padding: 15, font: { family: 'Inter', size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) label += ': ';
                                if (context.parsed !== null) label += fmt(context.parsed);
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 5. Event Listeners
    [inTarget, inCurrent, inYears, inRate].forEach(el => {
        el.addEventListener('input', calculate);
    });
    
    window.addEventListener('themeChanged', calculate);
    
    // Initial Calc
    calculate();
});
