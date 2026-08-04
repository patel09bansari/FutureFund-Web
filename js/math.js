/*
 * js/math.js
 * Pure mathematical functions for FutureFund calculators.
 * Zero DOM manipulation. Used by Engine and Calculators.
 */

const FutureFundMath = {
    /**
     * Calculate Future Value of SIP (Systematic Investment Plan)
     * @param {number} monthlyInvest - Monthly SIP amount
     * @param {number} annualRate - Annual interest rate (e.g. 12 for 12%)
     * @param {number} years - Number of years
     * @returns {Object} { investedAmount, estimatedReturns, totalValue }
     */
    calculateSIP(monthlyInvest, annualRate, years) {
        if (!monthlyInvest || !annualRate || !years) return { investedAmount: 0, estimatedReturns: 0, totalValue: 0 };
        
        const monthlyRate = (annualRate / 100) / 12;
        const months = years * 12;
        
        // FV = P * [ ((1 + r)^n - 1) / r ] * (1 + r)
        const totalValue = monthlyInvest * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const investedAmount = monthlyInvest * months;
        const estimatedReturns = totalValue - investedAmount;
        
        return {
            investedAmount: Math.round(investedAmount),
            estimatedReturns: Math.round(estimatedReturns),
            totalValue: Math.round(totalValue)
        };
    },

    /**
     * Calculate Loan EMI
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate (e.g. 8 for 8%)
     * @param {number} years - Loan tenure in years
     * @returns {Object} { emi, totalInterest, totalPayment }
     */
    calculateEMI(principal, annualRate, years) {
        if (!principal || !annualRate || !years) return { emi: 0, totalInterest: 0, totalPayment: 0 };
        
        const monthlyRate = (annualRate / 100) / 12;
        const months = years * 12;
        
        // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        const factor = Math.pow(1 + monthlyRate, months);
        const emi = principal * monthlyRate * factor / (factor - 1);
        const totalPayment = emi * months;
        const totalInterest = totalPayment - principal;
        
        return {
            emi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment)
        };
    },

    /**
     * Calculate Compound Interest (Lumpsum)
     * @param {number} principal - Initial amount
     * @param {number} annualRate - Annual interest rate
     * @param {number} years - Time in years
     * @param {number} compoundFrequency - Times interest is compounded per year (default 1)
     * @returns {Object} { principal, estimatedReturns, totalValue }
     */
    calculateCompoundInterest(principal, annualRate, years, compoundFrequency = 1) {
        if (!principal || !annualRate || !years) return { principal: 0, estimatedReturns: 0, totalValue: 0 };
        
        const rate = annualRate / 100;
        // A = P(1 + r/n)^(nt)
        const totalValue = principal * Math.pow(1 + (rate / compoundFrequency), compoundFrequency * years);
        const estimatedReturns = totalValue - principal;
        
        return {
            principal: Math.round(principal),
            estimatedReturns: Math.round(estimatedReturns),
            totalValue: Math.round(totalValue)
        };
    },

    /**
     * Calculate Inflation Impact (Future Value of money or required future amount)
     * @param {number} currentAmount - Current cost
     * @param {number} inflationRate - Expected inflation (e.g. 6 for 6%)
     * @param {number} years - Years into future
     * @returns {number} Inflated cost
     */
    calculateInflation(currentAmount, inflationRate, years) {
        if (!currentAmount || !inflationRate || !years) return currentAmount || 0;
        return Math.round(currentAmount * Math.pow(1 + (inflationRate / 100), years));
    },

    /**
     * Calculate Retirement Corpus Needed
     * @param {number} currentMonthlyExpenses - Expenses now
     * @param {number} yearsToRetire - Years until retirement
     * @param {number} expectedInflation - Inflation rate (e.g. 6%)
     * @param {number} withdrawalRate - Safe withdrawal rate post retirement (e.g. 4%)
     * @returns {Object} { futureMonthlyExpenses, requiredCorpus }
     */
    calculateRetirement(currentMonthlyExpenses, yearsToRetire, expectedInflation, withdrawalRate = 4) {
        const futureMonthlyExpenses = this.calculateInflation(currentMonthlyExpenses, expectedInflation, yearsToRetire);
        const annualFutureExpenses = futureMonthlyExpenses * 12;
        // Corpus = Annual Expenses / Safe Withdrawal Rate
        const requiredCorpus = annualFutureExpenses / (withdrawalRate / 100);
        
        return {
            futureMonthlyExpenses,
            requiredCorpus: Math.round(requiredCorpus)
        };
    },

    /**
     * Generate Yearly Schedule for SIP
     */
    generateSIPSchedule(monthlyInvest, annualRate, years) {
        const schedule = [];
        const monthlyRate = (annualRate / 100) / 12;
        let cumulativeInvested = 0;
        let cumulativeValue = 0;

        for (let y = 1; y <= years; y++) {
            for (let m = 1; m <= 12; m++) {
                cumulativeInvested += monthlyInvest;
                cumulativeValue = (cumulativeValue + monthlyInvest) * (1 + monthlyRate);
            }
            schedule.push({
                year: y,
                invested: Math.round(cumulativeInvested),
                value: Math.round(cumulativeValue)
            });
        }
        return schedule;
    }
};

window.FutureFundMath = FutureFundMath;
