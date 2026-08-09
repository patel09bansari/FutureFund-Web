/*
 * js/dashboard.js  v3.0
 * Financial Command Center renderer.
 * Consumes engine output only — zero duplicate calculations.
 * All markup uses CSS component classes from components.css.
 */

/* ── Formatting shortcuts ────────────────────────────────────────── */
const fmt  = (v) => FutureFundUtils.formatCurrency(v);
const fmtN = (v) => FutureFundUtils.formatNumber(v);
const fmtP = (v) => `${v.toFixed(1)}%`;

/* ── Color maps (status → CSS) ───────────────────────────────────── */
const STATUS_COLOR = {
    Green:  { bar: '#16A34A', badge: 'green',  text: 'text-success'  },
    Orange: { bar: '#f59e0b', badge: 'orange', text: 'text-warning'  },
    Red:    { bar: '#ef4444', badge: 'red',    text: 'text-danger'   }
};
const ACTION_CLASS = { danger: 'danger', warning: 'warning', success: 'success' };

/* ── DOM helper ──────────────────────────────────────────────────── */
const el = (id) => document.getElementById(id);
const set = (id, html) => { const e = el(id); if (e) e.innerHTML = html; };

/* ── Entry point ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    
    // Why this approach: On load, we try to hydrate from the backend if a token exists. 
    // This allows seamless multi-device usage. If offline or no token, it safely falls back to local.
    if (window.FutureFundAPI && localStorage.getItem('ff_jwt')) {
        try {
            const apiRes = await FutureFundAPI.getPlanner();
            if (apiRes.success && apiRes.data && apiRes.data.result) {
                FutureFundStorage.save('financial_report', apiRes.data.result);
            }
        } catch (e) {
            console.warn("Dashboard Hydration failed, falling back to offline mode", e);
        }
    }

    let report = FutureFundStorage.get('financial_report');

    if (!report) {
        if (typeof FinancialEngine !== 'undefined') report = FinancialEngine.analyze();
        if (!report) { renderOnboarding(); return; }
    }

    renderAll(report);
    initSimulator(report);
});

/* ── Master render ───────────────────────────────────────────────── */
function renderAll(report) {
    const { personal, metrics, health, risk, goals, milestones, todayActions, roadmap, insights, journeyTimeline } = report;

    renderHero(personal, metrics, health, risk);
    renderActionCenter(todayActions);
    renderPriorityActions(roadmap.months0_3.slice(0, 3));
    renderHealthSection(health);
    renderGoals(goals);
    renderCashFlowChart(metrics);
    renderJourneyTimeline(journeyTimeline);
    renderInsights(insights);
    renderMilestones(milestones);
    renderRiskCard(risk);
    renderLearningProgress();

    // Report date
    if (report.generatedAt) {
        const d = new Date(report.generatedAt);
        const dateEl = el('reportDate');
        if (dateEl) dateEl.textContent = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
}

/* ── Sidebar: Learning Progress ──────────────────────────────────── */
function renderLearningProgress() {
    const TOTAL_ARTICLES = 19; // From resources.html
    let bookmarks = [];
    try {
        bookmarks = JSON.parse(localStorage.getItem('ff_bookmarks') || '[]');
    } catch(e) {}
    
    const completed = Math.min(bookmarks.length, TOTAL_ARTICLES);
    const pct = Math.round((completed / TOTAL_ARTICLES) * 100);
    
    const bar = el('learningProgressBar');
    const text = el('learningProgressText');
    
    if (bar) {
        bar.style.width = `${pct}%`;
        bar.setAttribute('aria-valuenow', pct);
    }
    if (text) {
        text.textContent = `${pct}%`;
    }
}

/* ── 1. Hero ─────────────────────────────────────────────────────── */
function renderHero(personal, metrics, health, risk) {
    const name = personal.name || 'User';
    const firstName = name.split(' ')[0];

    set('navName', firstName);
    set('dashName', firstName);
    set('dashScore', health.totalScore);

    // Stage label
    let stage = 'Building Foundation';
    if (health.totalScore > 50) stage = 'Growing Wealth';
    if (health.totalScore > 75) stage = 'Wealth Accumulation';
    if (health.totalScore > 90) stage = 'Financial Independence';
    set('dashStage', `Stage: <strong>${stage}</strong> &nbsp;·&nbsp; ${risk.profile} Investor`);

    // Score ring color
    const ring = el('scoreRing');
    if (ring) {
        ring.textContent = health.totalScore;
        ring.style.background = health.totalScore >= 75 ? '#16A34A' : health.totalScore >= 50 ? '#f59e0b' : '#ef4444';
    }

    // Snapshot strip
    const surplus = metrics.surplus;
    set('snapNetWorth', fmt(metrics.netWorth));
    set('snapSurplus', fmt(surplus));
    const surplusEl = el('snapSurplus');
    if (surplusEl) surplusEl.style.color = surplus >= 0 ? 'var(--accent-secondary)' : 'var(--accent-danger)';

    set('snapSavingsRate', fmtP(metrics.savingsRatio));
    set('snapEmergency', `${metrics.emergencyMonths.toFixed(1)} mo`);
    set('snapDebt', fmt(metrics.totalDebt));
    set('snapInvestments', fmt(metrics.totalInvestments));
}

/* ── 2. Action Center ────────────────────────────────────────────── */
function renderActionCenter(actions) {
    const container = el('actionCenter');
    if (!container) return;
    if (!actions || actions.length === 0) {
        container.innerHTML = mkEmpty("All immediate priorities are addressed — keep up the great work!");
        return;
    }
    container.innerHTML = actions.map(a => {
        const cls = ACTION_CLASS[a.color] || 'warning';
        return `
        <div class="action-card ${cls}">
            <div class="action-icon"><i class="fas ${a.icon}"></i></div>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
                    <div class="action-title">${a.action}</div>
                    <span class="meta-pill">${a.category}</span>
                </div>
                <div class="action-reason">${a.reason}</div>
                <div class="action-impact"><i class="fas fa-bolt me-1"></i>${a.impact}</div>
                <div class="action-meta">
                    ${a.difficulty ? `<span class="meta-pill"><i class="fas fa-signal me-1"></i>${a.difficulty}</span>` : ''}
                    ${a.duration   ? `<span class="meta-pill"><i class="fas fa-clock me-1"></i>${a.duration}</span>`   : ''}
                </div>
            </div>
        </div>`;
    }).join('');
}

/* ── 3. Priority Actions (XAI) ───────────────────────────────────── */
function renderPriorityActions(actions) {
    const container = el('priorityActions');
    if (!container) return;
    if (!actions || actions.length === 0) {
        container.innerHTML = `<div class="priority-card" style="border-left-color:var(--accent-secondary)">
            <div class="priority-title"><i class="fas fa-check-circle text-success me-2"></i>All immediate roadmap actions are complete.</div>
            <div class="priority-desc">View the full report for medium and long-term strategies.</div>
        </div>`;
        return;
    }
    container.innerHTML = actions.map(a => `
        <div class="priority-card">
            <div class="priority-title">${a.title}</div>
            <div class="priority-desc">${a.desc}</div>
            <div class="xai-box">
                <div class="xai-row"><span class="xai-label">Why: </span><span class="xai-value">${a.explain.why}</span></div>
                <div class="xai-row"><span class="xai-label">Based on: </span><span class="xai-value">${a.explain.input}</span></div>
                <div class="xai-row"><span class="xai-label">If Ignored: </span><span class="xai-value">${a.explain.ignore}</span></div>
                <div class="xai-row"><span class="xai-label">Benefit: </span><span class="xai-value">${a.explain.benefit}</span></div>
            </div>
        </div>`).join('');
}

/* ── 4. Health — Radar + Breakdown ──────────────────────────────── */
function renderHealthSection(health) {
    // Radar Chart
    const radarCtx = el('radarChart');
    if (radarCtx) {
        const labels  = Object.values(health.breakdown).map(m => m.label);
        const scores  = Object.values(health.breakdown).map(m => m.score);
        const maxes   = Object.values(health.breakdown).map(m => m.max);
        const pcts    = scores.map((s, i) => Math.round((s / maxes[i]) * 100));

        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels,
                datasets: [{
                    label: 'Your Score',
                    data: pcts,
                    backgroundColor: 'rgba(30,58,138,.15)',
                    borderColor: '#1E3A8A',
                    pointBackgroundColor: '#1E3A8A',
                    pointRadius: 4,
                    borderWidth: 2
                }, {
                    label: 'Ideal',
                    data: Array(labels.length).fill(100),
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(148,163,184,.3)',
                    borderDash: [4, 4],
                    pointRadius: 0,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        min: 0, max: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(148,163,184,.2)' },
                        pointLabels: {
                            font: { size: 11, family: 'Inter', weight: '600' },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                        }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Detailed Breakdown
    const container = el('healthBreakdown');
    if (!container) return;
    container.innerHTML = Object.values(health.breakdown).map(m => {
        const c = STATUS_COLOR[m.status] || STATUS_COLOR.Red;
        const pct = (m.score / m.max) * 100;
        return `
        <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-semibold text-primary-theme" style="font-size:.85rem">${m.label}</span>
                <span class="goal-badge ${c.badge}">${m.score} / ${m.max}</span>
            </div>
            <div class="health-bar-track mb-2">
                <div class="health-bar-fill" style="width:${pct}%;background:${c.bar}"></div>
            </div>
            <p class="text-secondary-theme mb-1" style="font-size:.78rem">${m.suggestion}</p>
            ${m.scoreGainIfFixed > 0 ? `<p class="text-success mb-0" style="font-size:.75rem;font-weight:600">
                <i class="fas fa-arrow-up me-1"></i>Resolve this to gain +${m.scoreGainIfFixed} points
            </p>` : ''}
        </div>`;
    }).join('');
}

/* ── 5. Goals Grid ───────────────────────────────────────────────── */
function renderGoals(goals) {
    const container = el('goalGrid');
    if (!container) return;
    if (!goals || goals.length === 0) {
        container.innerHTML = `<div class="col-12">${mkEmpty('No goals added yet.', 'planner/step5-goals.html', 'Add Your First Goal')}</div>`;
        return;
    }
    container.innerHTML = goals.map(g => {
        const c = STATUS_COLOR[g.feasibilityStatus] || STATUS_COLOR.Red;
        const label = g.feasibilityStatus === 'Green' ? 'On Track' : g.feasibilityStatus === 'Orange' ? 'Needs Focus' : 'At Risk';
        return `
        <div class="col-md-6">
            <div class="goal-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h6 class="fw-bold mb-0 text-primary-theme text-truncate me-2" style="max-width:170px" title="${g.name}">${g.name}</h6>
                    <span class="goal-badge ${c.badge}">${label}</span>
                </div>
                <h4 class="fw-bold text-primary-theme mb-1">${fmt(g.target)}</h4>
                <p class="text-muted-theme small mb-3">Target year: ${g.year} · ${g.yearsLeft} year${g.yearsLeft !== 1 ? 's' : ''} away</p>
                <div class="mb-3">
                    <div class="goal-stat-row"><span class="goal-stat-label">Required SIP</span><span class="goal-stat-value ${c.text}">${fmt(g.requiredSIP)}/mo</span></div>
                    <div class="goal-stat-row"><span class="goal-stat-label">Probability</span><span class="goal-stat-value ${c.text}">${g.probability}</span></div>
                    <div class="goal-stat-row"><span class="goal-stat-label">Priority</span><span class="goal-stat-value">${g.priority}</span></div>
                    <div class="goal-stat-row"><span class="goal-stat-label">Urgency</span><span class="goal-stat-value">${g.urgency}</span></div>
                </div>
                <p class="text-secondary-theme mb-2" style="font-size:.8rem"><strong>Recommendation:</strong> ${g.recommendation}</p>
                <p class="text-muted-theme" style="font-size:.78rem"><i class="fas fa-info-circle me-1"></i>${g.priorityReason}</p>
            </div>
        </div>`;
    }).join('');
}

/* ── 6. Cash Flow Chart ──────────────────────────────────────────── */
function renderCashFlowChart(metrics) {
    const ctx = el('cashFlowChart');
    if (!ctx) return;

    const stepExpenses = FutureFundStorage.get('planner_step3') || {};
    const expLabels = ['Housing','Food','Transport','Utilities','Entertainment','Education','Healthcare','Misc'];
    const expKeys   = ['expHousing','expFood','expTransport','expUtilities','expEntertainment','expEducation','expHealthcare','expMisc'];
    const expValues = expKeys.map(k => parseFloat(stepExpenses[k]) || 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', ...expLabels, 'Surplus'],
            datasets: [{
                label: 'Amount (₹)',
                data: [metrics.monthlyIncome, ...expValues, Math.max(metrics.surplus, 0)],
                backgroundColor: [
                    '#1E3A8A',
                    ...Array(8).fill('rgba(148,163,184,.7)'),
                    '#16A34A'
                ],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: c => ' ' + fmt(c.raw) } }
            },
            scales: {
                y: {
                    ticks: { callback: v => '₹' + fmtN(v), color: 'var(--text-secondary)' },
                    grid: { color: 'rgba(148,163,184,.1)' }
                },
                x: {
                    ticks: { color: 'var(--text-secondary)', font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

/* ── 7. Financial Journey ────────────────────────────────────────── */
function renderJourneyTimeline(phases) {
    const container = el('journeyTimeline');
    if (!container || !phases || phases.length === 0) return;

    container.innerHTML = phases.map(p => `
        <div class="journey-phase ${p.status}">
            <div class="journey-phase-label">${p.phase}</div>
            <div class="journey-phase-title">${p.label}</div>
            ${p.actions.map(a => `<div class="journey-action">
                <i class="fas ${p.status === 'complete' ? 'fa-check-circle text-success' : 'fa-circle-dot'} me-2" style="font-size:.75rem;${p.status !== 'complete' ? 'color:var(--text-muted)' : ''}"></i>${a}
            </div>`).join('')}
            <div class="d-flex gap-3 mt-2 small">
                <span class="text-muted-theme"><i class="fas fa-lightbulb me-1"></i>${p.reason}</span>
            </div>
            ${p.estimatedCost ? `<div class="mt-1"><span class="meta-pill"><i class="fas fa-tag me-1"></i>${p.estimatedCost}</span></div>` : ''}
        </div>`).join('');
}

/* ── 8. Smart Insights ───────────────────────────────────────────── */
function renderInsights(insights) {
    const container = el('insightsGrid');
    if (!container) return;
    const all = [
        ...(insights.strengths    || []).map(t => ({ type: 'positive', text: t, icon: 'fa-check-circle text-success' })),
        ...(insights.improvements || []).map(t => ({ type: 'negative', text: t, icon: 'fa-exclamation-circle text-warning' }))
    ];
    if (all.length === 0) {
        container.innerHTML = `<div class="col-12">${mkEmpty('Complete your planner to unlock personalised insights.')}</div>`;
        return;
    }
    container.innerHTML = all.map(ins => `
        <div class="col-12">
            <div class="insight-card ${ins.type}">
                <i class="fas ${ins.icon} flex-shrink-0 mt-1"></i>
                <p class="insight-text mb-0">${ins.text}</p>
            </div>
        </div>`).join('');
}

/* ── Sidebar: Milestones ─────────────────────────────────────────── */
function renderMilestones(milestones) {
    const container = el('milestoneTimeline');
    if (!container || !milestones) return;
    container.innerHTML = milestones.map((m, i) => `
        <div class="timeline-item">
            <div class="timeline-track">
                <div class="timeline-dot ${m.completed ? 'done' : ''}"></div>
                ${i < milestones.length - 1 ? '<div class="timeline-line"></div>' : ''}
            </div>
            <div class="timeline-content">
                <div class="timeline-title ${m.completed ? 'done' : ''}">
                    ${m.completed ? '<i class="fas fa-check me-1"></i>' : ''}${m.title}
                </div>
                <div class="timeline-desc">${m.desc}</div>
                <div class="timeline-date">${m.estimatedDate}</div>
                ${m.requiredAction && !m.completed ? `<div class="meta-pill mt-1 d-inline-block" style="font-size:.68rem">${m.requiredAction}</div>` : ''}
            </div>
        </div>`).join('');
}

/* ── Sidebar: Risk Card ──────────────────────────────────────────── */
function renderRiskCard(risk) {
    const abbr = { Conservative: 'CON', Moderate: 'MOD', Aggressive: 'AGG' };
    const clr  = { Conservative: '#f59e0b', Moderate: '#1E3A8A', Aggressive: '#16A34A' };
    const icon = el('riskIcon');
    if (icon) {
        icon.textContent   = abbr[risk.profile] || 'MOD';
        icon.style.background = clr[risk.profile] || '#1E3A8A';
    }
    set('riskProfile', risk.profile);
    set('riskExplanation', risk.explanation);
}

/* ── Simulator ───────────────────────────────────────────────────── */
function initSimulator(report) {
    const { metrics } = report;
    const step4 = FutureFundStorage.get('planner_step4') || {};

    const fields = [
        { label: 'Monthly Income (₹)',      id: 'sim_income',     val: Math.round(metrics.monthlyIncome)    },
        { label: 'Monthly Expenses (₹)',     id: 'sim_expenses',   val: Math.round(metrics.monthlyExpenses)  },
        { label: 'Emergency Fund (₹)',       id: 'sim_emergency',  val: Math.round(metrics.emergencyFund)    },
        { label: 'Total Investments (₹)',    id: 'sim_invest',     val: Math.round(metrics.totalInvestments) },
        { label: 'Total Loans / Debt (₹)',   id: 'sim_debt',       val: Math.round(metrics.totalDebt)        },
        { label: 'Credit Card Debt (₹)',     id: 'sim_cc',         val: Math.round(metrics.totalCreditCard)  }
    ];

    const simFieldsEl = el('simFields');
    if (simFieldsEl) {
        simFieldsEl.innerHTML = fields.map(f => `
            <div class="col-md-4 col-sm-6">
                <label class="form-label fw-semibold small">${f.label}</label>
                <div class="input-group">
                    <span class="input-group-text">₹</span>
                    <input type="number" class="form-control" id="${f.id}" value="${f.val}" min="0">
                </div>
            </div>`).join('');
    }

    // Run btn
    const runBtn = el('simRunBtn');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            const simIncome    = parseFloat(el('sim_income').value)    || 0;
            const simExpenses  = parseFloat(el('sim_expenses').value)  || 0;
            const simEmergency = parseFloat(el('sim_emergency').value) || 0;
            const simInvest    = parseFloat(el('sim_invest').value)    || 0;
            const simDebt      = parseFloat(el('sim_debt').value)      || 0;
            const simCC        = parseFloat(el('sim_cc').value)        || 0;

            const overrides = {
                income:   { primaryIncome: simIncome, additionalIncome: 0 },
                expenses: { expHousing: simExpenses },
                position: {
                    posEmergency:       simEmergency,
                    posInvestments:     simInvest,
                    posLoans:           simDebt,
                    posCreditCard:      simCC,
                    posHealthInsurance: step4.posHealthInsurance || 'no',
                    posLifeInsurance:   step4.posLifeInsurance   || 'no'
                }
            };

            const simReport = FinancialEngine.simulate(overrides);
            if (!simReport) return;

            // Current vs Projected
            const currScore   = report.health.totalScore;
            const newScore    = simReport.health.totalScore;
            const scoreDiff   = newScore - currScore;
            const currSurplus = report.metrics.surplus;
            const newSurplus  = simReport.metrics.surplus;
            const surplusDiff = newSurplus - currSurplus;

            set('simCurrScore',  currScore);
            set('simNewScore',   newScore);
            const diffEl = el('simScoreDiff');
            if (diffEl) {
                diffEl.textContent = (scoreDiff >= 0 ? '+' : '') + scoreDiff;
                diffEl.className   = `value ${scoreDiff >= 0 ? 'sim-diff-positive' : 'sim-diff-negative'}`;
            }
            set('simCurrSurplus', fmt(currSurplus));
            set('simNewSurplus',  fmt(newSurplus));
            const sdEl = el('simSurplusDiff');
            if (sdEl) {
                sdEl.textContent = (surplusDiff >= 0 ? '+' : '') + fmt(surplusDiff);
                sdEl.className   = `value ${surplusDiff >= 0 ? 'sim-diff-positive' : 'sim-diff-negative'}`;
            }

            // Goal impact
            const goalLines = simReport.goals.map(g =>
                `<span class="me-3 d-inline-block"><strong>${g.name}:</strong> ${g.probability} · SIP ${fmt(g.requiredSIP)}/mo</span>`
            ).join('');
            set('simGoalImpact', goalLines ? `<strong>Goal Impact:</strong><br>${goalLines}` : '');

            const resultEl = el('simResult');
            if (resultEl) resultEl.classList.remove('d-none');
            const saveBtn = el('simSaveBtn');
            if (saveBtn) {
                saveBtn.classList.remove('d-none');
                saveBtn._overrides = overrides;
            }
        });
    }

    // Save btn
    const saveBtn = el('simSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const o = saveBtn._overrides;
            if (!o) return;
            const step2 = FutureFundStorage.get('planner_step2') || {};
            step2.primaryIncome    = o.income.primaryIncome;
            step2.additionalIncome = 0;
            FutureFundStorage.save('planner_step2', step2);

            const s4 = FutureFundStorage.get('planner_step4') || {};
            Object.assign(s4, o.position);
            FutureFundStorage.save('planner_step4', s4);

            const newReport = FinancialEngine.analyze();
            bootstrap.Modal.getInstance(el('simulatorModal')).hide();
            renderAll(newReport);
            initSimulator(newReport);
        });
    }
}

/* ── Onboarding ──────────────────────────────────────────────────── */
function renderOnboarding() {
    const main = document.querySelector('.container-xl.py-5') || document.querySelector('body');
    if (!main) return;
    main.innerHTML = `
        <div class="row justify-content-center" style="min-height:70vh">
            <div class="col-md-6 d-flex flex-column justify-content-center text-center py-5">
                <div class="empty-state">
                    <i class="fas fa-map-signs"></i>
                    <h3 class="fw-bold mb-3 text-primary-theme">Your Dashboard Awaits</h3>
                    <p>Complete your Financial Profile to unlock your personalised command center — health scores, smart goals, roadmap, and insights.</p>
                    <a href="planner/step1-personal.html" class="btn btn-primary-fintech">
                        <i class="fas fa-arrow-right me-2"></i>Build My Financial Profile
                    </a>
                </div>
            </div>
        </div>`;
}

/* ── Reusable empty state helper ─────────────────────────────────── */
function mkEmpty(msg, href = null, label = null) {
    return `<div class="empty-state">
        <i class="fas fa-seedling"></i>
        <p>${msg}</p>
        ${href ? `<a href="${href}" class="btn btn-sm btn-outline-fintech">${label}</a>` : ''}
    </div>`;
}
