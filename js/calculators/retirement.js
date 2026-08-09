/**
 * js/calculators/retirement.js
 * Logic and Chart rendering for the Retirement Calculator.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const inAge = document.getElementById('inAge');
    const inRetireAge = document.getElementById('inRetireAge');
    const inExpenses = document.getElementById('inExpenses');
    const inInflation = document.getElementById('inInflation');
    const inReturn = document.getElementById('inReturn');
    
    const valAge = document.getElementById('valAge');
    const valRetireAge = document.getElementById('valRetireAge');
    const valExpenses = document.getElementById('valExpenses');
    
    const resCorpus = document.getElementById('resCorpus');
    const resSip = document.getElementById('resSip');
    
    const interpretationText = document.getElementById('interpretationText');
    const suggestionBox = document.getElementById('personalizedSuggestion');
    
    let chartInstance = null;
    
    // 2. Formatters
    const fmt = FutureFundUtils.formatCurrency;
    
    // 3. Main Calculation Function
    function calculate() {
        let age = parseInt(inAge.value);
        let retireAge = parseInt(inRetireAge.value);
        const currentExpenses = parseFloat(inExpenses.value);
        const inflation = parseFloat(inInflation.value) / 100;
        const returnRate = parseFloat(inReturn.value) / 100;
        
        // Validation: cannot retire before current age
        if (retireAge <= age) {
            retireAge = age + 1;
            inRetireAge.value = retireAge;
        }

        const yearsToRetire = retireAge - age;

        // Update display labels
        valAge.textContent = age;
        valRetireAge.textContent = retireAge;
        valExpenses.textContent = fmt(currentExpenses).replace('₹', '');
        
        // 1. Calculate Future Expenses (at retirement) due to inflation
        // FV = PV * (1 + inflation)^years
        const futureMonthlyExpenses = currentExpenses * Math.pow(1 + inflation, yearsToRetire);
        const futureAnnualExpenses = futureMonthlyExpenses * 12;
        
        // 2. Calculate Required Corpus using the 25x Rule (4% withdrawal rate)
        // Adjusting for Indian context, 25x-30x is standard. We will use 25x.
        const requiredCorpus = futureAnnualExpenses * 25;
        
        // 3. Calculate Required Monthly SIP to reach Corpus
        // PMT = FV * [ r / ((1+r)^n - 1) ]
        const monthlyRate = returnRate / 12;
        const totalMonths = yearsToRetire * 12;
        
        const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
        const requiredSip = requiredCorpus * (monthlyRate / (compoundFactor - 1));
        
        // Update DOM
        resCorpus.textContent = fmt(Math.round(requiredCorpus));
        resSip.textContent = fmt(Math.round(requiredSip)) + ' /mo';
        
        // Interpretation
        interpretationText.innerHTML = `At age ${retireAge}, your monthly expenses will be <strong>${fmt(Math.round(futureMonthlyExpenses))}</strong> due to inflation.`;
        
        // Educational Suggestion
        let suggestionHtml = '';
        if (requiredSip > (currentExpenses * 2)) {
            suggestionHtml = `
                <div class="suggestion-box" style="background:#fffbeb;border-color:#fef3c7;color:#b45309">
                    <strong><i class="fas fa-info-circle me-1"></i> High Required SIP:</strong> 
                    The required SIP is quite high. Try delaying your retirement by a few years, or expect to reduce your expenses in retirement.
                </div>
            `;
        } else {
            suggestionHtml = `
                <div class="suggestion-box" style="background:#f0fdf4;border-color:#bbf7d0;color:#15803d">
                    <strong><i class="fas fa-check-circle me-1"></i> Achievable:</strong> 
                    This SIP looks achievable! Start as early as possible. Every year you delay increases the required SIP drastically.
                </div>
            `;
        }
        suggestionBox.innerHTML = suggestionHtml;
        
        // Update Chart - Compare Total Investment vs Wealth Gained
        const totalInvested = requiredSip * totalMonths;
        const wealthGained = requiredCorpus - totalInvested;
        updateChart(totalInvested, wealthGained);
    }
    
    // 4. Chart Logic
    function updateChart(invested, interest) {
        const ctx = document.getElementById('retireChart').getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const textColor = isDark ? '#94a3b8' : '#64748b';
        
        if (chartInstance) {
            chartInstance.data.datasets[0].data = [invested, interest];
            chartInstance.options.plugins.legend.labels.color = textColor;
            chartInstance.update();
            return;
        }
        
        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Total Invested via SIP', 'Returns Generated (Compounding)'],
                datasets: [{
                    data: [invested, interest],
                    backgroundColor: [
                        isDark ? '#3b82f6' : '#1e3a8a',
                        isDark ? '#10b981' : '#059669'
                    ],
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
    [inAge, inRetireAge, inExpenses, inInflation, inReturn].forEach(el => {
        el.addEventListener('input', calculate);
    });
    
    window.addEventListener('themeChanged', calculate);
    
    // Initial Calc
    calculate();
});
