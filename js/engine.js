/*
 * js/engine.js
 * The offline Financial Intelligence Engine v2.0
 * Provides deep, deterministic financial analysis, roadmap generation,
 * goal priority optimization, milestone tracking, and scenario simulation.
 * 
 * Architecture Rule: This engine is the SINGLE source of truth.
 * All dashboards, reports, and features consume the output of this engine.
 * No other file should duplicate calculation logic.
 */

const FinancialEngine = {

    /**
     * Core analysis function. Reads planner data, runs all sub-engines,
     * compiles a comprehensive report, and saves it to localStorage.
     * @param {Object} overrides - Optional. Used by Scenario Simulator to test
     *                             hypothetical values without permanently saving.
     * @returns {Object} The complete financial report.
     */
    analyze(overrides = {}) {
        try {
            const personal  = FutureFundStorage.get('planner_step1') || {};
            const incomeRaw = FutureFundStorage.get('planner_step2') || {};
            const expensesRaw = FutureFundStorage.get('planner_step3') || {};
            const positionRaw = FutureFundStorage.get('planner_step4') || {};
            const goalsRaw  = FutureFundStorage.get('planner_step5') || { goals: [] };
            const risk      = FutureFundStorage.get('planner_step6') || {};

            // Merge any overrides (for Scenario Simulator)
            const income   = { ...incomeRaw,   ...overrides.income   };
            const expenses = { ...expensesRaw, ...overrides.expenses };
            const position = { ...positionRaw, ...overrides.position };

            // ---------------------------------------------------------------
            // MODULE 1: Core Metrics & Cash Flow
            // ---------------------------------------------------------------
            const monthlyIncome = (parseFloat(income.primaryIncome) || 0)
                                + (parseFloat(income.additionalIncome) || 0);

            let monthlyExpenses = 0;
            const EXPENSE_KEYS = ['expHousing','expFood','expTransport','expUtilities',
                                  'expEntertainment','expEducation','expHealthcare','expMisc'];
            EXPENSE_KEYS.forEach(key => { monthlyExpenses += (parseFloat(expenses[key]) || 0); });

            const surplus            = monthlyIncome - monthlyExpenses;
            const savingsRatio       = monthlyIncome > 0 ? (surplus / monthlyIncome) * 100 : 0;
            const emergencyFund      = parseFloat(position.posEmergency)    || 0;
            const emergencyMonths    = monthlyExpenses > 0 ? (emergencyFund / monthlyExpenses) : 0;
            const totalLoans         = parseFloat(position.posLoans)        || 0;
            const totalCreditCard    = parseFloat(position.posCreditCard)   || 0;
            const totalDebt          = totalLoans + totalCreditCard;
            const totalInvestments   = parseFloat(position.posInvestments)  || 0;
            const netWorth           = emergencyFund + totalInvestments - totalDebt;
            const debtToIncomeRatio  = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;
            const expenseRatio       = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
            const salaryGrowth       = parseFloat(income.salaryGrowth) || 0;
            const age                = parseInt(personal.age) || 25;
            const dependents         = parseInt(personal.dependents) || 0;

            // ---------------------------------------------------------------
            // MODULE 2: Risk Profile & Explanation
            // ---------------------------------------------------------------
            let riskScore = (parseInt(risk.q1) || 2)
                          + (parseInt(risk.q2) || 2)
                          + (parseInt(risk.q3) || 2);

            let riskProfile     = 'Moderate';
            let riskExplanation = 'Your balanced approach to volatility suggests a Moderate growth strategy, combining equity and fixed-income instruments.';

            if (riskScore <= 4) {
                riskProfile     = 'Conservative';
                riskExplanation = 'Capital protection is your priority. A Conservative portfolio focused on fixed deposits, bonds, and low-volatility debt funds is most suitable.';
            } else if (riskScore >= 7) {
                riskProfile     = 'Aggressive';
                riskExplanation = 'Your high risk tolerance and long investment horizon make an Aggressive portfolio maximizing equity exposure highly suitable for wealth creation.';
            }
            if (emergencyMonths < 3 && riskProfile === 'Aggressive') {
                riskExplanation += ' However, your emergency fund is critically low — secure that first before aggressive market exposure.';
                riskProfile = 'Moderate';
            }
            const expectedReturn = riskProfile === 'Aggressive' ? 0.12
                                 : riskProfile === 'Moderate'   ? 0.10 : 0.07;

            // ---------------------------------------------------------------
            // MODULE 3: Health Score 2.0 — with current, ideal, gap, impact
            // ---------------------------------------------------------------
            const health = {
                emergency: {
                    label: 'Emergency Fund',
                    score: 0, max: 20, status: 'Red',
                    currentValue: `${emergencyMonths.toFixed(1)} months`,
                    idealValue:   '6 months',
                    gap:          emergencyMonths >= 6 ? 'None' : `${(6 - emergencyMonths).toFixed(1)} months missing`,
                    whyItMatters: 'Covers living expenses during job loss or medical emergency without taking debt.',
                    suggestion:   emergencyMonths >= 6
                        ? 'Excellent! Maintain this buffer.'
                        : `Save an additional ₹${FutureFundUtils.formatNumber((6 - emergencyMonths) * monthlyExpenses)} to reach 6 months.`,
                    scoreGainIfFixed: 0
                },
                savings: {
                    label: 'Savings Rate',
                    score: 0, max: 20, status: 'Red',
                    currentValue: `${savingsRatio.toFixed(1)}% of income`,
                    idealValue:   '≥ 20% of income',
                    gap:          savingsRatio >= 20 ? 'None' : `${(20 - savingsRatio).toFixed(1)}% below ideal`,
                    whyItMatters: 'Savings rate is the single biggest predictor of financial independence timeline.',
                    suggestion:   savingsRatio >= 20
                        ? 'Great savings discipline! Consider investing the surplus.'
                        : `Reduce expenses by ₹${FutureFundUtils.formatNumber(monthlyIncome * (20 - savingsRatio) / 100)} to reach a 20% savings rate.`,
                    scoreGainIfFixed: 0
                },
                debt: {
                    label: 'Debt Health',
                    score: 0, max: 20, status: 'Red',
                    currentValue: totalDebt === 0 ? 'Debt Free ✓' : `₹${FutureFundUtils.formatNumber(totalDebt)} total debt`,
                    idealValue:   'Zero high-interest debt',
                    gap:          totalDebt === 0 ? 'None' : `₹${FutureFundUtils.formatNumber(totalDebt)} outstanding`,
                    whyItMatters: 'High-interest debt (especially credit cards at 30-40%) destroys wealth faster than investments can build it.',
                    suggestion:   totalDebt === 0
                        ? 'Debt free! You can redirect everything to investments.'
                        : totalCreditCard > 0
                            ? `Pay off credit card debt of ₹${FutureFundUtils.formatNumber(totalCreditCard)} immediately — it costs 30-40% annually.`
                            : 'Loans are manageable. Prioritize prepaying high-interest ones first.',
                    scoreGainIfFixed: 0
                },
                insurance: {
                    label: 'Insurance Coverage',
                    score: 0, max: 20, status: 'Red',
                    currentValue: [
                        position.posHealthInsurance === 'yes' ? 'Health ✓' : 'No Health',
                        position.posLifeInsurance   === 'yes' ? 'Life ✓'   : 'No Life'
                    ].join(', '),
                    idealValue:   'Both Health & Life Insurance',
                    gap:          (position.posHealthInsurance === 'yes' && position.posLifeInsurance === 'yes')
                        ? 'None' : 'One or more coverage gaps',
                    whyItMatters: 'Insurance protects your accumulated wealth from catastrophic events — medical emergencies and untimely death.',
                    suggestion:   (position.posHealthInsurance === 'yes' && position.posLifeInsurance === 'yes')
                        ? 'Well protected! Review coverage amounts annually.'
                        : [
                            position.posHealthInsurance !== 'yes' ? 'Buy a comprehensive health policy (₹5-10L base).' : '',
                            (position.posLifeInsurance !== 'yes' && dependents > 0) ? `Buy a term plan worth ₹${FutureFundUtils.formatNumber(monthlyIncome * 12 * 15)} (15x annual income).` : ''
                          ].filter(Boolean).join(' '),
                    scoreGainIfFixed: 0
                },
                investments: {
                    label: 'Investment Portfolio',
                    score: 0, max: 20, status: 'Red',
                    currentValue: totalInvestments === 0 ? 'Not Started' : `₹${FutureFundUtils.formatNumber(totalInvestments)} invested`,
                    idealValue:   '≥ 12 months income invested',
                    gap:          totalInvestments >= monthlyIncome * 12
                        ? 'None' : `₹${FutureFundUtils.formatNumber(Math.max(0, monthlyIncome * 12 - totalInvestments))} away from milestone`,
                    whyItMatters: 'Investments are the engine of wealth creation. The earlier you start, the more compounding works in your favor.',
                    suggestion:   totalInvestments >= monthlyIncome * 12
                        ? 'Excellent investment base! Consider diversification across asset classes.'
                        : surplus > 0
                            ? `Start a monthly SIP of ₹${FutureFundUtils.formatNumber(Math.min(surplus * 0.5, 10000))} to begin wealth creation.`
                            : 'Reduce expenses to create investable surplus.',
                    scoreGainIfFixed: 0
                }
            };

            // Calculate scores and score gain potential
            const scoreCalc = (metricKey, fn) => {
                const result = fn();
                health[metricKey].score  = result.score;
                health[metricKey].status = result.status;
                health[metricKey].scoreGainIfFixed = health[metricKey].max - result.score;
            };

            scoreCalc('emergency', () => {
                if (emergencyMonths >= 6) return { score: 20, status: 'Green' };
                if (emergencyMonths >= 3) return { score: 15, status: 'Orange' };
                if (emergencyMonths >= 1) return { score: 5,  status: 'Red' };
                return { score: 0, status: 'Red' };
            });
            scoreCalc('savings', () => {
                if (savingsRatio >= 20) return { score: 20, status: 'Green' };
                if (savingsRatio >= 10) return { score: 10, status: 'Orange' };
                if (savingsRatio > 0)   return { score: 5,  status: 'Red' };
                return { score: 0, status: 'Red' };
            });
            scoreCalc('debt', () => {
                if (totalDebt === 0)            return { score: 20, status: 'Green' };
                if (debtToIncomeRatio < 30)     return { score: 15, status: 'Orange' };
                return { score: 5, status: 'Red' };
            });
            scoreCalc('insurance', () => {
                let s = 0;
                if (position.posHealthInsurance === 'yes') s += 10;
                if (position.posLifeInsurance   === 'yes') s += 10;
                return { score: s, status: s === 20 ? 'Green' : s === 10 ? 'Orange' : 'Red' };
            });
            scoreCalc('investments', () => {
                if (totalInvestments > monthlyIncome * 12) return { score: 20, status: 'Green' };
                if (totalInvestments > 0)                  return { score: 10, status: 'Orange' };
                return { score: 0, status: 'Red' };
            });

            const totalScore = Object.values(health).reduce((sum, m) => sum + m.score, 0);

            // ---------------------------------------------------------------
            // MODULE 4: Goal Priority Optimizer
            // Ranks goals by urgency, affordability, and feasibility
            // ---------------------------------------------------------------
            const currentYear = new Date().getFullYear();
            const goalAnalysis = (goalsRaw.goals || []).map(g => {
                const targetAmt   = parseFloat(g.amount);
                const years       = parseInt(g.year) - currentYear;
                const r           = expectedReturn / 12;
                const n           = Math.max(years, 0) * 12;

                let requiredSIP   = 0;
                if (n > 0) {
                    requiredSIP = (targetAmt * r) / (Math.pow(1 + r, n) - 1);
                } else {
                    requiredSIP = targetAmt;
                }

                // Feasibility
                let feasibilityStatus = 'Red';
                let probability       = 'Low';
                let priorityReason    = '';
                let recommendation    = '';

                if (requiredSIP <= surplus * 0.3) {
                    feasibilityStatus = 'Green'; probability = 'High';
                    recommendation    = `Allocate ₹${FutureFundUtils.formatNumber(requiredSIP)}/mo — easily fundable from your current surplus.`;
                } else if (requiredSIP <= surplus * 0.8) {
                    feasibilityStatus = 'Orange'; probability = 'Medium';
                    recommendation    = `Requires ₹${FutureFundUtils.formatNumber(requiredSIP)}/mo — increase income or extend timeline by 1-2 years.`;
                } else {
                    feasibilityStatus = 'Red'; probability = 'Low';
                    recommendation    = `Requires ₹${FutureFundUtils.formatNumber(requiredSIP)}/mo — currently unaffordable. Consider extending target year or reducing target amount.`;
                }

                // Priority reasoning
                const urgencyLevel = years <= 2 ? 'Urgent' : years <= 5 ? 'Near-term' : 'Long-term';
                if (g.priority === 'High' && years <= 3) {
                    priorityReason = `High priority + ${years <= 2 ? 'urgent' : 'near-term'} timeline — fund this first.`;
                } else if (g.priority === 'Low' || years > 7) {
                    priorityReason = `${urgencyLevel} goal — use long-term equity SIP for maximum compounding.`;
                } else {
                    priorityReason = `${urgencyLevel} goal — balance this with your other priorities.`;
                }

                return {
                    name: g.name,
                    target: targetAmt,
                    year: parseInt(g.year),
                    priority: g.priority,
                    yearsLeft: years,
                    urgency: urgencyLevel,
                    requiredSIP,
                    feasibilityStatus,
                    probability,
                    priorityReason,
                    recommendation
                };
            });

            // Sort goals: High priority + nearest year first
            goalAnalysis.sort((a, b) => {
                const priorityMap = { High: 0, Medium: 1, Low: 2 };
                const pDiff = (priorityMap[a.priority] || 1) - (priorityMap[b.priority] || 1);
                return pDiff !== 0 ? pDiff : a.yearsLeft - b.yearsLeft;
            });

            // ---------------------------------------------------------------
            // MODULE 5: Milestone Tracker with estimated dates
            // ---------------------------------------------------------------
            const today = new Date();
            const estimateDate = (monthsNeeded) => {
                const d = new Date(today);
                d.setMonth(d.getMonth() + Math.ceil(monthsNeeded));
                return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            };

            const emergencyTarget    = monthlyExpenses * 6;
            const monthsToEmergency  = surplus > 0 && emergencyMonths < 6
                ? ((emergencyTarget - emergencyFund) / surplus) : 0;

            const debtPayoffMonths   = surplus > 0 && totalDebt > 0
                ? (totalDebt / (surplus * 0.5)) : 0;

            const investmentMilestone = monthlyIncome * 12;
            const monthsToInvMile     = surplus > 0 && totalInvestments < investmentMilestone
                ? ((investmentMilestone - totalInvestments) / Math.max(surplus * 0.4, 1)) : 0;

            const milestones = [
                {
                    id: 'emergency_fund',
                    title: 'Emergency Fund Complete',
                    desc: '6 months of expenses in liquid savings',
                    completed: emergencyMonths >= 6,
                    estimatedDate: emergencyMonths >= 6 ? 'Achieved ✓' : estimateDate(monthsToEmergency),
                    requiredAction: emergencyMonths >= 6
                        ? null
                        : `Save ₹${FutureFundUtils.formatNumber(Math.max(0, emergencyTarget - emergencyFund))} more`
                },
                {
                    id: 'insurance_done',
                    title: 'Fully Insured',
                    desc: 'Health & Life insurance in place',
                    completed: position.posHealthInsurance === 'yes' && position.posLifeInsurance === 'yes',
                    estimatedDate: (position.posHealthInsurance === 'yes' && position.posLifeInsurance === 'yes')
                        ? 'Achieved ✓' : 'This month',
                    requiredAction: (position.posHealthInsurance !== 'yes' || position.posLifeInsurance !== 'yes')
                        ? 'Purchase missing insurance policies' : null
                },
                {
                    id: 'debt_free',
                    title: 'Debt Free',
                    desc: 'Zero high-interest debt',
                    completed: totalDebt === 0,
                    estimatedDate: totalDebt === 0 ? 'Achieved ✓' : (surplus > 0 ? estimateDate(debtPayoffMonths) : 'Increase surplus first'),
                    requiredAction: totalDebt > 0
                        ? `Allocate ₹${FutureFundUtils.formatNumber(surplus * 0.5)}/mo to debt payoff` : null
                },
                {
                    id: 'first_investment_milestone',
                    title: `First ₹${FutureFundUtils.formatNumber(investmentMilestone)} Invested`,
                    desc: '12 months of income invested — wealth creation milestone',
                    completed: totalInvestments >= investmentMilestone,
                    estimatedDate: totalInvestments >= investmentMilestone
                        ? 'Achieved ✓' : estimateDate(monthsToInvMile),
                    requiredAction: totalInvestments < investmentMilestone
                        ? `Invest ₹${FutureFundUtils.formatNumber(Math.max(0, investmentMilestone - totalInvestments))} more` : null
                },
                {
                    id: 'financial_independence',
                    title: 'Financial Independence',
                    desc: 'Passive income covers monthly expenses',
                    completed: (totalInvestments * expectedReturn / 12) >= monthlyExpenses,
                    estimatedDate: 'Long-term goal',
                    requiredAction: `Build corpus of ₹${FutureFundUtils.formatNumber(monthlyExpenses * 12 / expectedReturn)}`
                }
            ];

            // ---------------------------------------------------------------
            // MODULE 6: Action Center — Today's Financial Actions
            // ---------------------------------------------------------------
            const todayActions = [];
            if (emergencyMonths < 6) {
                const monthlyNeeded = Math.ceil((emergencyTarget - emergencyFund) / Math.max(surplus, 1));
                todayActions.push({
                    priority: 1,
                    category: 'Protection',
                    icon: 'fa-shield-alt',
                    color: 'danger',
                    action: `Transfer ₹${FutureFundUtils.formatNumber(Math.min(surplus * 0.5, emergencyTarget - emergencyFund))} to Emergency Fund`,
                    reason: `You have ${emergencyMonths.toFixed(1)} months coverage. Goal: 6 months.`,
                    impact: `Completes emergency fund in ~${monthlyNeeded} months`
                });
            }
            if (totalCreditCard > 0) {
                todayActions.push({
                    priority: 2,
                    category: 'Debt',
                    icon: 'fa-credit-card',
                    color: 'danger',
                    action: `Pay ₹${FutureFundUtils.formatNumber(Math.min(surplus * 0.6, totalCreditCard))} toward Credit Card`,
                    reason: 'Credit card interest (30-40%) destroys wealth faster than any investment builds it.',
                    impact: 'Frees up cash flow and improves credit score'
                });
            }
            if (position.posHealthInsurance !== 'yes') {
                todayActions.push({
                    priority: 3,
                    category: 'Insurance',
                    icon: 'fa-heartbeat',
                    color: 'warning',
                    action: 'Purchase Health Insurance this week',
                    reason: 'One medical emergency without insurance can wipe out years of savings.',
                    impact: '+10 Health Score points + wealth protection'
                });
            }
            if (surplus > 2000 && totalCreditCard === 0 && emergencyMonths >= 3) {
                todayActions.push({
                    priority: 4,
                    category: 'Investing',
                    icon: 'fa-chart-line',
                    color: 'success',
                    action: `Start SIP of ₹${FutureFundUtils.formatNumber(Math.floor(surplus * 0.4))} in a ${riskProfile} mutual fund`,
                    reason: `Your surplus of ₹${FutureFundUtils.formatNumber(surplus)}/mo can compound into wealth.`,
                    impact: `${riskProfile} returns over 10 years on this SIP`
                });
            }
            if (position.posLifeInsurance !== 'yes' && dependents > 0) {
                todayActions.push({
                    priority: 5,
                    category: 'Insurance',
                    icon: 'fa-umbrella',
                    color: 'warning',
                    action: `Get Term Life Insurance worth ₹${FutureFundUtils.formatNumber(monthlyIncome * 12 * 15)}`,
                    reason: `You have ${dependents} dependent(s) relying on your income.`,
                    impact: 'Protects your family\'s financial future'
                });
            }
            if (todayActions.length === 0) {
                todayActions.push({
                    priority: 1,
                    category: 'Growth',
                    icon: 'fa-rocket',
                    color: 'success',
                    action: 'Review and increase your monthly SIP amount',
                    reason: 'Your financial foundation is solid. Now focus on wealth acceleration.',
                    impact: 'Each 10% SIP increase can shorten your financial independence timeline by years'
                });
            }

            // ---------------------------------------------------------------
            // MODULE 7: Smart Roadmap with 4-tier timeline & explainability
            // ---------------------------------------------------------------
            const addItem = (tier, title, desc, why, inputData, ignoreConsequence, benefit) => {
                tier.push({ title, desc, explain: { why, input: inputData, ignore: ignoreConsequence, benefit } });
            };

            const months0_3  = [];
            const months6_12 = [];
            const years1_3   = [];
            const years3_10  = [];

            // Tier 1: First 3 months
            if (emergencyMonths < 1) {
                addItem(months0_3, 'Establish Initial Emergency Buffer',
                    'Open a high-yield savings account and redirect 100% of surplus there.',
                    'With near-zero cash reserves, any surprise expense forces you into high-cost debt.',
                    `Current emergency savings: ₹${FutureFundUtils.formatNumber(emergencyFund)}`,
                    'You will need a personal loan (12-18% interest) for even minor emergencies.',
                    'Peace of mind and avoidance of debt traps.');
            } else if (emergencyMonths < 3) {
                addItem(months0_3, 'Build 3-Month Emergency Fund',
                    `Save ₹${FutureFundUtils.formatNumber((3 * monthlyExpenses) - emergencyFund)} more to reach 3 months.`,
                    'A 3-month buffer is the minimum safety net against job loss.',
                    `You currently cover ${emergencyMonths.toFixed(1)} months.`,
                    'Financial anxiety and potential debt during any income disruption.',
                    'A solid base to begin investing with confidence.');
            }
            if (totalCreditCard > 0) {
                addItem(months0_3, 'Clear Credit Card Debt First',
                    'Use your surplus to pay off the full credit card balance.',
                    'Credit cards charge 30-40% annual interest — the highest-cost debt you can carry.',
                    `Credit card outstanding: ₹${FutureFundUtils.formatNumber(totalCreditCard)}`,
                    'Wealth erosion through compounding interest that outpaces any investment.',
                    'Free up cash flow and eliminate a major drain on net worth.');
            }
            if (position.posHealthInsurance !== 'yes') {
                addItem(months0_3, 'Secure Health Insurance Immediately',
                    'Purchase a base policy of ₹5-10 lakh this week.',
                    'Medical inflation runs at 15% per year. One hospitalisation can eliminate years of savings.',
                    'No health insurance detected in your profile.',
                    'Catastrophic wealth erosion from a single medical event.',
                    'Protection of accumulated savings + tax benefit under Section 80D.');
            }
            if (months0_3.length === 0) {
                addItem(months0_3, 'Automate and Increase SIPs',
                    'Set up auto-debit for investments on salary day.',
                    'Automation removes behavioural bias and ensures disciplined investing.',
                    `Healthy surplus of ₹${FutureFundUtils.formatNumber(surplus)}/mo with solid emergency fund.`,
                    'You risk spending the investable surplus on non-essential items.',
                    'Consistent wealth building with zero effort after setup.');
            }

            // Tier 2: 6–12 months
            if (emergencyMonths >= 3 && emergencyMonths < 6) {
                addItem(months6_12, 'Expand Emergency Fund to 6 Months',
                    `Add ₹${FutureFundUtils.formatNumber((6 * monthlyExpenses) - emergencyFund)} more to reach the full 6-month standard.`,
                    '6 months is the professional benchmark for complete job-loss resilience.',
                    `Currently covers ${emergencyMonths.toFixed(1)} months.`,
                    'Partial vulnerability during prolonged unemployment or medical crisis.',
                    'Absolute financial security and freedom to take career risks.');
            }
            if (position.posLifeInsurance !== 'yes' && dependents > 0) {
                addItem(months6_12, 'Secure Term Life Insurance',
                    `Buy a term plan worth ₹${FutureFundUtils.formatNumber(monthlyIncome * 12 * 15)} (15x annual income).`,
                    `You have ${dependents} financial dependent(s) — your income is their safety net.`,
                    `No life insurance + ${dependents} dependent(s).`,
                    'Leaves your family financially unprotected if something happens to you.',
                    'Complete financial security for your loved ones at a very low monthly premium.');
            }
            if (surplus > 0) {
                addItem(months6_12, 'Scale Up SIPs by 10%',
                    `Increase your monthly investments from ₹${FutureFundUtils.formatNumber(surplus * 0.4)} to ₹${FutureFundUtils.formatNumber(surplus * 0.44)}.`,
                    `Your salary is expected to grow at ${salaryGrowth}% — your investments should grow too.`,
                    `Salary growth rate: ${salaryGrowth}%, Monthly surplus: ₹${FutureFundUtils.formatNumber(surplus)}`,
                    'Flat SIPs lose real value to inflation over time.',
                    'Dramatically shorter path to financial independence.');
            }
            if (months6_12.length === 0) {
                addItem(months6_12, 'Review and Diversify Portfolio',
                    `Ensure your ${riskProfile} portfolio is spread across asset classes.`,
                    'Diversification reduces risk without sacrificing returns.',
                    'Financial foundation is complete. Next: optimise growth.',
                    'Concentration in one asset class creates unnecessary risk.',
                    'Better risk-adjusted returns over the long term.');
            }

            // Tier 3: 1–3 years
            const shortGoals = goalAnalysis.filter(g => g.yearsLeft > 0 && g.yearsLeft <= 3);
            if (shortGoals.length > 0) {
                shortGoals.forEach(g => {
                    addItem(years1_3, `Fund Goal: ${g.name}`,
                        `Allocate ₹${FutureFundUtils.formatNumber(g.requiredSIP)}/mo in a liquid/debt fund — not equities.`,
                        'Short-term goals must not be exposed to equity market volatility.',
                        `Target: ₹${FutureFundUtils.formatNumber(g.target)} by ${g.year}`,
                        'Market downturn risk could leave you short of your goal amount at the exact moment you need it.',
                        'Guaranteed capital availability when your goal date arrives.');
                });
            } else {
                addItem(years1_3, 'Investment Diversification',
                    `Build a ${riskProfile} portfolio across equity, debt, and gold.`,
                    'No short-term goals — this window is ideal for medium-risk wealth building.',
                    'No goals in the 1-3 year horizon.',
                    'Missed compounding opportunity in peak earning years.',
                    'Optimised risk-adjusted portfolio growth.');
            }
            addItem(years1_3, 'Tax Optimisation',
                'Maximise 80C deductions (₹1.5L: ELSS, PPF, EPF) and Section 80D (insurance).',
                'Tax saved is money invested — each rupee saved in tax is a rupee that compounds for you.',
                'Assumes Indian tax context based on income level.',
                'Overpaying income tax, leaving thousands on the table every year.',
                `Save up to ₹46,800 in taxes annually by maximising all deductions.`);

            // Tier 4: 3–10 years
            const longGoals = goalAnalysis.filter(g => g.yearsLeft > 3);
            if (longGoals.length > 0) {
                addItem(years3_10, 'Aggressive Goal Corpus Building',
                    'Use equity mutual funds and index funds for all long-term goals.',
                    'Equities have historically delivered 12-15% returns over 7+ year periods.',
                    `Long-term goals: ${longGoals.map(g => g.name).join(', ')}.`,
                    'Keeping money in FDs or savings accounts will not beat inflation.',
                    'Maximum wealth accumulation powered by long-term compounding.');
            }
            addItem(years3_10, 'Retirement Corpus Planning',
                `Start building toward a corpus of ₹${FutureFundUtils.formatNumber(monthlyExpenses * 12 * 25)}.`,
                'The 25x annual expense rule (4% safe withdrawal rate) is the global standard for retirement planning.',
                `Age: ${age}. Monthly expenses: ₹${FutureFundUtils.formatNumber(monthlyExpenses)}.`,
                'Dependency on others or government in old age.',
                'True financial independence — where work becomes a choice, not a necessity.');

            // ---------------------------------------------------------------
            // MODULE 8: Insights for Dashboard
            // ---------------------------------------------------------------
            const insights = { strengths: [], improvements: [] };

            if (savingsRatio >= 20) insights.strengths.push(`Excellent savings rate of ${savingsRatio.toFixed(1)}%. You are building wealth faster than most.`);
            else insights.improvements.push(`Savings rate is ${savingsRatio.toFixed(1)}%. Increasing to 20% will significantly accelerate your financial freedom timeline.`);

            if (emergencyMonths >= 6) insights.strengths.push(`Emergency fund covers ${emergencyMonths.toFixed(1)} months — you have robust financial protection.`);
            else insights.improvements.push(`Emergency fund covers only ${emergencyMonths.toFixed(1)} months. Build it to 6 months for complete security.`);

            if (position.posHealthInsurance === 'yes') insights.strengths.push('Health insurance in place — your savings are protected from medical emergencies.');
            else insights.improvements.push('No health insurance. One medical event could wipe out your savings. Get insured immediately.');

            if (totalDebt === 0) insights.strengths.push('Debt free! Every rupee of surplus can now build wealth.');
            else if (totalCreditCard > 0) insights.improvements.push(`Credit card debt of ₹${FutureFundUtils.formatNumber(totalCreditCard)} is costing ~30-40% annually. Clearing it should be your top priority.`);

            if (totalInvestments > 0) insights.strengths.push(`Investment portfolio of ₹${FutureFundUtils.formatNumber(totalInvestments)} is growing through compounding.`);
            else insights.improvements.push('No investments yet. Even ₹500/month started today beats starting with ₹5,000 five years from now.');

            // ---------------------------------------------------------------
            // MODULE 9: Financial Journey Timeline
            // A personalized milestone narrative generated from real user data.
            // ---------------------------------------------------------------
            const journeyTimeline = [];
            let phaseMonth = 1;

            // Phase 1: Foundation (Emergency + Insurance)
            const emergencyShortfall = Math.max(0, (6 * monthlyExpenses) - emergencyFund);
            const monthsToFullEmergency = surplus > 0 ? Math.ceil(emergencyShortfall / (surplus * 0.6)) : 0;
            const phase1End = Math.max(monthsToFullEmergency, 3);

            journeyTimeline.push({
                phase: `Month 1–${phase1End}`,
                label: 'Phase 1: Build Your Safety Net',
                status: emergencyMonths >= 6 ? 'complete' : 'active',
                actions: [
                    emergencyMonths < 6
                        ? `Save ₹${FutureFundUtils.formatNumber(Math.min(surplus * 0.6, emergencyShortfall))} per month toward a ₹${FutureFundUtils.formatNumber(6 * monthlyExpenses)} emergency fund.`
                        : `Emergency fund is complete ✓ — ₹${FutureFundUtils.formatNumber(emergencyFund)} secured.`,
                    position.posHealthInsurance !== 'yes' ? 'Purchase a health insurance policy (₹5-10L cover).' : 'Health insurance is active ✓.',
                    totalCreditCard > 0 ? `Clear credit card debt of ₹${FutureFundUtils.formatNumber(totalCreditCard)}.` : 'No credit card debt ✓.'
                ].filter(Boolean),
                reason: 'A solid safety net lets you invest without fear of derailing your finances.',
                estimatedCost: `₹${FutureFundUtils.formatNumber(emergencyShortfall + totalCreditCard)}`
            });

            // Phase 2: Investing Begins
            const phase2Start = phase1End + 1;
            const phase2End   = phase1End + 12;
            const suggestedSIP = Math.max(Math.round(surplus * 0.4 / 100) * 100, 500);

            journeyTimeline.push({
                phase: `Month ${phase2Start}–${phase2End}`,
                label: 'Phase 2: Start Building Wealth',
                status: totalInvestments > 0 ? 'active' : 'upcoming',
                actions: [
                    `Start a monthly SIP of ₹${FutureFundUtils.formatNumber(suggestedSIP)} in a ${riskProfile.toLowerCase()} mutual fund.`,
                    position.posLifeInsurance !== 'yes' && dependents > 0
                        ? `Buy a term life insurance plan worth ₹${FutureFundUtils.formatNumber(monthlyIncome * 12 * 15)}.`
                        : 'Life insurance is active ✓.',
                    `Automate salary-day transfers to investments.`
                ],
                reason: 'Once protected, your surplus should start compounding for future goals.',
                estimatedCost: `₹${FutureFundUtils.formatNumber(suggestedSIP)}/month`
            });

            // Phase 3: Goal-Specific Investing (short-to-mid goals)
            const shortMidGoals = goalAnalysis.filter(g => g.yearsLeft > 0 && g.yearsLeft <= 5);
            if (shortMidGoals.length > 0) {
                journeyTimeline.push({
                    phase: `Year 2–5`,
                    label: 'Phase 3: Fund Priority Goals',
                    status: 'upcoming',
                    actions: shortMidGoals.map(g =>
                        `Invest ₹${FutureFundUtils.formatNumber(g.requiredSIP)}/mo toward "${g.name}" (target: ₹${FutureFundUtils.formatNumber(g.target)} by ${g.year}).`
                    ),
                    reason: 'Near-term goals need dedicated funds in safe, liquid instruments.',
                    estimatedCost: `₹${FutureFundUtils.formatNumber(shortMidGoals.reduce((s, g) => s + g.requiredSIP, 0))}/month`
                });
            }

            // Phase 4: Wealth Acceleration
            const phase4CorpusTarget = monthlyIncome * 12 * 5; // 5x annual income
            journeyTimeline.push({
                phase: `Year 5–10`,
                label: 'Phase 4: Wealth Acceleration',
                status: 'upcoming',
                actions: [
                    `Build an investment corpus of ₹${FutureFundUtils.formatNumber(phase4CorpusTarget)} (5x annual income).`,
                    `Increase SIP by 10% every year to harness salary growth.`,
                    `Review and rebalance portfolio annually.`
                ],
                reason: 'With compounding and annual SIP increases, wealth grows exponentially in this phase.',
                estimatedCost: 'Increase SIPs by 10% annually'
            });

            // Phase 5: Financial Independence
            const fiCorpus = monthlyExpenses * 12 * 25;
            journeyTimeline.push({
                phase: `Year 10+`,
                label: 'Phase 5: Financial Independence',
                status: 'upcoming',
                actions: [
                    `Reach a retirement corpus of ₹${FutureFundUtils.formatNumber(fiCorpus)} (25x annual expenses).`,
                    `Passive income from investments covers monthly expenses.`,
                    `Work becomes a choice, not a necessity.`
                ],
                reason: 'The 4% safe withdrawal rate means 25x expenses gives indefinite passive income.',
                estimatedCost: `Target corpus: ₹${FutureFundUtils.formatNumber(fiCorpus)}`
            });

            // Enrich todayActions with difficulty and duration metadata
            const enrichedActions = todayActions.map(a => ({
                ...a,
                difficulty:  a.category === 'Investing' ? 'Easy'
                           : a.category === 'Insurance' ? 'Easy'
                           : a.category === 'Debt'      ? 'Medium'
                           : 'Easy',
                duration:    a.category === 'Investing' ? '10 min setup'
                           : a.category === 'Insurance' ? '30 min online'
                           : a.category === 'Debt'      ? 'Ongoing monthly'
                           : '15 min'
            }));

            // ---------------------------------------------------------------
            // MODULE 10: SWOT and Risks/Opportunities (for Report page)
            // ---------------------------------------------------------------
            const swot = {
                strengths: insights.strengths.slice(0, 3),
                weaknesses: insights.improvements.slice(0, 3),
                opportunities: [],
                threats: []
            };

            if (salaryGrowth >= 10) swot.opportunities.push('High expected salary growth creates room to rapidly increase investments.');
            if (riskProfile === 'Aggressive' && age < 35) swot.opportunities.push('Young age + high risk tolerance = maximum compounding runway.');
            if (totalDebt === 0) swot.opportunities.push('Debt-free status lets you direct 100% of surplus to wealth creation.');
            if (goalAnalysis.some(g => g.feasibilityStatus === 'Green')) swot.opportunities.push('Several goals are already on track — maintain momentum.');
            if (swot.opportunities.length === 0) swot.opportunities.push('Reducing expenses by even 5% can unlock significant investable surplus.');

            if (totalCreditCard > 0) swot.threats.push('High-interest credit card debt eroding net worth at 30-40% annually.');
            if (position.posHealthInsurance !== 'yes') swot.threats.push('No health insurance — a single medical event can wipe out savings.');
            if (emergencyMonths < 3) swot.threats.push('Low emergency fund increases risk of forced debt during income disruption.');
            if (expenseRatio > 80) swot.threats.push('Expense ratio exceeds 80% of income — very little room for wealth building.');
            if (swot.threats.length === 0) swot.threats.push('Market volatility could affect short-term investment goals if not hedged properly.');

            // ---------------------------------------------------------------
            // MODULE 11: Compile Final Structured Report
            // ---------------------------------------------------------------
            const report = {
                personal: { name: personal.fullName || 'User', age, occupation: personal.occupationType || '' },
                metrics: {
                    monthlyIncome, monthlyExpenses, surplus,
                    savingsRatio, expenseRatio,
                    emergencyMonths, emergencyFund,
                    totalDebt, totalLoans, totalCreditCard,
                    totalInvestments, netWorth, debtToIncomeRatio,
                    salaryGrowth, expectedReturn
                },
                health: { totalScore, breakdown: health },
                risk: { profile: riskProfile, explanation: riskExplanation, score: riskScore },
                goals: goalAnalysis,
                milestones,
                todayActions: enrichedActions,
                roadmap: { months0_3, months6_12, years1_3, years3_10 },
                insights,
                journeyTimeline,
                swot,
                generatedAt: new Date().toISOString()
            };

            // Only persist to localStorage if this is NOT a simulation run
            if (Object.keys(overrides).length === 0) {
                FutureFundStorage.save('financial_report', report);
            }

            return report;

        } catch (e) {
            console.error('FutureFund Engine Error:', e);
            return null;
        }
    },

    /**
     * Scenario Simulator — runs a hypothetical analysis without saving.
     * @param {Object} overrides - { income: {}, expenses: {}, position: {} }
     * @returns {Object} Simulated report (not saved to localStorage).
     */
    simulate(overrides) {
        return this.analyze(overrides);
    }
};

window.FinancialEngine = FinancialEngine;

