/**
 * js/calculators/emi.js
 * Logic and Chart rendering for the EMI Calculator.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const inAmount = document.getElementById('inAmount');
    const inRate = document.getElementById('inRate');
    const inYears = document.getElementById('inYears');
    
    const valAmount = document.getElementById('valAmount');
    const valRate = document.getElementById('valRate');
    const valYears = document.getElementById('valYears');
    
    const resEmi = document.getElementById('resEmi');
    const resInterest = document.getElementById('resInterest');
    const resTotal = document.getElementById('resTotal');
    
    const interpretationText = document.getElementById('interpretationText');
    const suggestionBox = document.getElementById('personalizedSuggestion');
    
    let chartInstance = null;
    
    // 2. Formatters
    const fmt = FutureFundUtils.formatCurrency;
    
    // 3. Main Calculation Function
    function calculate() {
        const principal = parseFloat(inAmount.value);
        const rate = parseFloat(inRate.value);
        const years = parseFloat(inYears.value);
        
        // Update display labels
        valAmount.textContent = fmt(principal).replace('₹', '');
        valRate.textContent = rate + '%';
        valYears.textContent = years;
        
        // Core Math
        const monthlyRate = (rate / 12) / 100;
        const totalMonths = years * 12;
        
        // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        let emi = 0;
        if (monthlyRate === 0) {
            emi = principal / totalMonths;
        } else {
            const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
            emi = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
        }
        
        const totalPayment = emi * totalMonths;
        const totalInterest = totalPayment - principal;
        
        // Update DOM
        resEmi.textContent = fmt(Math.round(emi));
        resInterest.textContent = fmt(Math.round(totalInterest));
        resTotal.textContent = fmt(Math.round(totalPayment));
        
        // Interpretation
        const interestPercentage = ((totalInterest / totalPayment) * 100).toFixed(1);
        interpretationText.innerHTML = `You will pay a total of <strong>${fmt(Math.round(totalPayment))}</strong> over ${years} years. <strong class="text-danger">${interestPercentage}%</strong> of your total payments will go towards interest.`;
        
        // Educational Suggestion
        let suggestionHtml = '';
        if (interestPercentage > 40) {
            suggestionHtml = `
                <div class="suggestion-box">
                    <strong class="text-danger"><i class="fas fa-exclamation-circle me-1"></i> High Interest Alert:</strong> 
                    You are paying a massive amount in interest. Consider increasing your EMI slightly or reducing the tenure to 15 years to save lakhs in interest payments.
                </div>
            `;
        } else if (years > 20) {
            suggestionHtml = `
                <div class="suggestion-box" style="background:#fffbeb;border-color:#fef3c7;color:#b45309">
                    <strong><i class="fas fa-info-circle me-1"></i> Long Tenure:</strong> 
                    A ${years}-year loan lowers your monthly burden but increases total cost. Try making one extra EMI payment every year to close the loan much faster.
                </div>
            `;
        } else {
            suggestionHtml = `
                <div class="suggestion-box" style="background:#f0fdf4;border-color:#bbf7d0;color:#15803d">
                    <strong><i class="fas fa-check-circle me-1"></i> Healthy Structure:</strong> 
                    This loan structure looks manageable. Ensure your EMI does not exceed 30-40% of your monthly take-home salary.
                </div>
            `;
        }
        
        // Apply dark mode overrides if needed via CSS, but JS writes the base
        suggestionBox.innerHTML = suggestionHtml;
        
        // Update Chart
        updateChart(principal, totalInterest);
    }
    
    // 4. Chart Logic
    function updateChart(principal, interest) {
        const ctx = document.getElementById('emiChart').getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const colorPrincipal = isDark ? '#3b82f6' : '#1e3a8a';
        const colorInterest = isDark ? '#f87171' : '#dc2626';
        
        if (chartInstance) {
            chartInstance.data.datasets[0].data = [principal, interest];
            chartInstance.options.plugins.legend.labels.color = textColor;
            chartInstance.update();
            return;
        }
        
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal Amount', 'Total Interest'],
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
                cutout: '75%',
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
    [inAmount, inRate, inYears].forEach(el => {
        el.addEventListener('input', calculate);
    });
    
    window.addEventListener('themeChanged', calculate);
    
    // Initial Calc
    calculate();
});
