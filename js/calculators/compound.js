/**
 * js/calculators/compound.js
 * Logic and Chart rendering for the Compound Interest Calculator.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const inPrincipal = document.getElementById('inPrincipal');
    const inRate = document.getElementById('inRate');
    const inYears = document.getElementById('inYears');
    const inFrequency = document.getElementById('inFrequency');
    
    const valPrincipal = document.getElementById('valPrincipal');
    const valRate = document.getElementById('valRate');
    const valYears = document.getElementById('valYears');
    
    const resPrincipal = document.getElementById('resPrincipal');
    const resInterest = document.getElementById('resInterest');
    const resTotal = document.getElementById('resTotal');
    
    const interpretationText = document.getElementById('interpretationText');
    const suggestionBox = document.getElementById('personalizedSuggestion');
    
    let chartInstance = null;
    
    // 2. Formatters
    const fmt = FutureFundUtils.formatCurrency;
    
    // 3. Main Calculation Function
    function calculate() {
        const p = parseFloat(inPrincipal.value);
        const r = parseFloat(inRate.value) / 100;
        const t = parseFloat(inYears.value);
        const n = parseFloat(inFrequency.value);
        
        // Update display labels
        valPrincipal.textContent = fmt(p).replace('₹', '');
        valRate.textContent = (r * 100).toFixed(1) + '%';
        valYears.textContent = t;
        
        // Math: A = P(1 + r/n)^(nt)
        const amount = p * Math.pow((1 + (r / n)), (n * t));
        const interest = amount - p;
        
        // Update DOM
        resPrincipal.textContent = fmt(Math.round(p));
        resInterest.textContent = fmt(Math.round(interest));
        resTotal.textContent = fmt(Math.round(amount));
        
        // Interpretation
        const multiplier = (amount / p).toFixed(1);
        interpretationText.innerHTML = `Your money will multiply by <strong>${multiplier}x</strong> over ${t} years.`;
        
        // Educational Suggestion
        let suggestionHtml = '';
        if (t < 5) {
            suggestionHtml = `
                <div class="suggestion-box" style="background:#fffbeb;border-color:#fef3c7;color:#b45309">
                    <strong><i class="fas fa-info-circle me-1"></i> Time is your friend:</strong> 
                    Compounding needs time to work its magic. Notice how the curve gets much steeper after 7-10 years. Try increasing the time slider!
                </div>
            `;
        } else if (multiplier >= 10) {
            suggestionHtml = `
                <div class="suggestion-box" style="background:#f0fdf4;border-color:#bbf7d0;color:#15803d">
                    <strong><i class="fas fa-check-circle me-1"></i> Exponential Growth:</strong> 
                    This is the power of long-term compounding. Your wealth gained is massively outperforming your original investment.
                </div>
            `;
        }
        
        suggestionBox.innerHTML = suggestionHtml;
        
        // Update Chart
        updateChart(p, interest);
    }
    
    // 4. Chart Logic
    function updateChart(principal, interest) {
        const ctx = document.getElementById('compoundChart').getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const colorPrincipal = isDark ? '#3b82f6' : '#1e3a8a';
        const colorInterest = isDark ? '#10b981' : '#059669'; // Green for gains
        
        if (chartInstance) {
            chartInstance.data.datasets[0].data = [principal, interest];
            chartInstance.options.plugins.legend.labels.color = textColor;
            chartInstance.update();
            return;
        }
        
        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Invested Principal', 'Wealth Gained (Interest)'],
                datasets: [{
                    data: [principal, interest],
                    backgroundColor: [colorPrincipal, colorInterest],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, padding: 20, font: { family: 'Inter', size: 12 } }
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
    [inPrincipal, inRate, inYears, inFrequency].forEach(el => {
        el.addEventListener('input', calculate);
    });
    
    window.addEventListener('themeChanged', calculate);
    
    // Initial Calc
    calculate();
});
