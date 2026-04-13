// ===== FINANCE MASTERY - CORE APP JS =====

// --- Progress Tracking ---
const Progress = {
  KEY: 'finance-mastery-progress',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || {};
    } catch { return {}; }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  markSection(pageId, sectionId, done = true) {
    const data = this.getAll();
    if (!data[pageId]) data[pageId] = {};
    data[pageId][sectionId] = done;
    this.save(data);
    this.updateUI();
  },

  isSectionDone(pageId, sectionId) {
    const data = this.getAll();
    return !!(data[pageId] && data[pageId][sectionId]);
  },

  getPageProgress(pageId) {
    const data = this.getAll();
    const sections = data[pageId] || {};
    const total = document.querySelectorAll(`[data-section-page="${pageId}"]`).length;
    if (total === 0) return 0;
    const done = Object.values(sections).filter(Boolean).length;
    return Math.round((done / total) * 100);
  },

  getOverallProgress() {
    const pages = ['foundations', 'ibd', 'pe', 'vc', 'consulting', 'interview', 'excel'];
    const data = this.getAll();
    let totalSections = 0;
    let doneSections = 0;
    pages.forEach(p => {
      const pageData = data[p] || {};
      // Count from stored data
      doneSections += Object.values(pageData).filter(Boolean).length;
    });
    // Get total from DOM if on index, otherwise estimate
    const sectionEls = document.querySelectorAll('[data-section-page]');
    if (sectionEls.length > 0) {
      totalSections = sectionEls.length;
    } else {
      // Estimate: each page has ~8-12 sections, 7 pages
      totalSections = Math.max(doneSections + 1, 65);
    }
    return totalSections > 0 ? Math.round((doneSections / totalSections) * 100) : 0;
  },

  updateUI() {
    // Update sidebar badges
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      const pageId = link.dataset.page;
      const badge = link.querySelector('.badge');
      if (!badge) return;
      const data = this.getAll();
      const sections = data[pageId] || {};
      const done = Object.values(sections).filter(Boolean).length;
      if (done > 0) {
        badge.textContent = `${done} done`;
        badge.className = 'badge badge-progress';
      }
    });

    // Update overall progress bar
    const fill = document.querySelector('.progress-bar-fill');
    const pct = document.querySelector('.progress-pct-text');
    if (fill) {
      const overall = this.getOverallProgress();
      fill.style.width = overall + '%';
      if (pct) pct.textContent = overall + '%';
    }

    // Update page progress bar
    const pageProgress = document.querySelector('.page-progress');
    if (pageProgress) {
      const pageId = pageProgress.dataset.page;
      const checks = document.querySelectorAll(`[data-section-page="${pageId}"]`);
      const done = Array.from(checks).filter(c => c.classList.contains('done')).length;
      const total = checks.length;
      const pctVal = total > 0 ? Math.round((done / total) * 100) : 0;
      const bar = pageProgress.querySelector('.progress-bar-fill');
      const pctEl = pageProgress.querySelector('.progress-pct');
      if (bar) bar.style.width = pctVal + '%';
      if (pctEl) pctEl.textContent = pctVal + '% complete';
    }
  },

  reset() {
    localStorage.removeItem(this.KEY);
    location.reload();
  }
};

// --- Collapsibles ---
function initCollapsibles() {
  document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.parentElement;
      parent.classList.toggle('open');
    });
  });
}

// --- Section Completion Checks ---
function initSectionChecks() {
  document.querySelectorAll('.section-check').forEach(check => {
    const pageId = check.dataset.sectionPage;
    const sectionId = check.dataset.sectionId;

    // Restore state
    if (Progress.isSectionDone(pageId, sectionId)) {
      check.classList.add('done');
      check.textContent = '✓ Completed';
    }

    check.addEventListener('click', () => {
      const isDone = check.classList.toggle('done');
      check.textContent = isDone ? '✓ Completed' : 'Mark Complete';
      Progress.markSection(pageId, sectionId, isDone);
    });
  });
}

// --- Checklist Items ---
function initChecklists() {
  document.querySelectorAll('.checklist .check').forEach(check => {
    check.addEventListener('click', () => {
      check.classList.toggle('checked');
    });
  });
}

// --- Quizzes ---
function initQuizzes() {
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.addEventListener('click', () => {
      const question = option.closest('.quiz-question');
      if (question.classList.contains('answered')) return;
      question.classList.add('answered');

      const allOptions = question.querySelectorAll('.quiz-option');
      const correct = question.dataset.correct;
      const explanation = question.querySelector('.quiz-explanation');

      allOptions.forEach(opt => {
        opt.classList.add('disabled');
        if (opt.dataset.value === correct) {
          opt.classList.add('correct');
        }
      });

      if (option.dataset.value !== correct) {
        option.classList.add('incorrect');
      }

      if (explanation) explanation.classList.add('show');
    });
  });
}

// --- Tabs ---
function initTabs() {
  document.querySelectorAll('.tab-container').forEach(container => {
    const btns = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = container.querySelector(`#${btn.dataset.tab}`);
        if (target) target.classList.add('active');
      });
    });
  });
}

// --- Mobile Sidebar ---
function initMobileSidebar() {
  const hamburger = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  if (!hamburger || !sidebar) return;

  hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Close on nav click (mobile)
  sidebar.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  });
}

// --- Active Nav Highlighting ---
function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop().replace('.html', '') || 'index';
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// --- Interactive Calculators ---
const Calc = {
  // DCF NPV calculator
  npv(rate, cashflows) {
    return cashflows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i + 1), 0);
  },

  // WACC
  wacc(equityWeight, costEquity, debtWeight, costDebt, taxRate) {
    return equityWeight * costEquity + debtWeight * costDebt * (1 - taxRate);
  },

  // CAPM
  capm(riskFree, beta, marketReturn) {
    return riskFree + beta * (marketReturn - riskFree);
  },

  // Gordon Growth Terminal Value
  terminalValueGordon(fcf, growthRate, discountRate) {
    return (fcf * (1 + growthRate)) / (discountRate - growthRate);
  },

  // LBO IRR (simplified)
  irr(entryEquity, exitEquity, years) {
    return Math.pow(exitEquity / entryEquity, 1 / years) - 1;
  },

  // MOIC
  moic(exitEquity, entryEquity) {
    return exitEquity / entryEquity;
  },

  // EV/EBITDA implied price
  evFromMultiple(ebitda, multiple, netDebt) {
    return ebitda * multiple - netDebt;
  },

  // Format number
  fmt(n, decimals = 1) {
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(decimals) + 'B';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
    return n.toFixed(decimals);
  },

  pct(n) { return (n * 100).toFixed(1) + '%'; }
};

// --- Interactive Model Runners ---
function initCalculators() {
  // DCF Calculator
  const dcfForm = document.getElementById('dcf-calc');
  if (dcfForm) {
    dcfForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(dcfForm);
      const fcf = parseFloat(fd.get('fcf'));
      const growth = parseFloat(fd.get('growth')) / 100;
      const wacc = parseFloat(fd.get('wacc')) / 100;
      const tgr = parseFloat(fd.get('tgr')) / 100;
      const years = parseInt(fd.get('years'));
      const netDebt = parseFloat(fd.get('netDebt')) || 0;
      const shares = parseFloat(fd.get('shares')) || 1;

      let cashflows = [];
      let projected = fcf;
      let html = '<table><thead><tr><th>Year</th><th>FCF</th><th>PV of FCF</th></tr></thead><tbody>';
      for (let i = 1; i <= years; i++) {
        projected = i === 1 ? fcf : projected * (1 + growth);
        const pv = projected / Math.pow(1 + wacc, i);
        cashflows.push(pv);
        html += `<tr><td>${i}</td><td>$${Calc.fmt(projected)}</td><td>$${Calc.fmt(pv)}</td></tr>`;
      }

      const termFCF = projected * (1 + growth);
      const tv = termFCF / (wacc - tgr);
      const pvTV = tv / Math.pow(1 + wacc, years);
      const sumPVFCF = cashflows.reduce((a, b) => a + b, 0);
      const ev = sumPVFCF + pvTV;
      const equityVal = ev - netDebt;
      const pricePerShare = equityVal / shares;

      html += '</tbody></table>';
      html += `<div style="margin-top:1rem">
        <p><strong>Sum of PV of FCFs:</strong> $${Calc.fmt(sumPVFCF)}</p>
        <p><strong>Terminal Value:</strong> $${Calc.fmt(tv)} &rarr; PV: $${Calc.fmt(pvTV)}</p>
        <p><strong>Enterprise Value:</strong> $${Calc.fmt(ev)}</p>
        <p><strong>Equity Value:</strong> $${Calc.fmt(equityVal)}</p>
        <p><strong>Price per Share:</strong> $${(pricePerShare).toFixed(2)}</p>
      </div>`;

      document.getElementById('dcf-result').innerHTML = html;
    });
  }

  // LBO Calculator
  const lboForm = document.getElementById('lbo-calc');
  if (lboForm) {
    lboForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(lboForm);
      const ev = parseFloat(fd.get('ev'));
      const ebitda = parseFloat(fd.get('ebitda'));
      const debtPct = parseFloat(fd.get('debtPct')) / 100;
      const interestRate = parseFloat(fd.get('interestRate')) / 100;
      const ebitdaGrowth = parseFloat(fd.get('ebitdaGrowth')) / 100;
      const exitMultiple = parseFloat(fd.get('exitMultiple'));
      const holdYears = parseInt(fd.get('holdYears'));
      const fcfConversion = parseFloat(fd.get('fcfConversion')) / 100;

      const totalDebt = ev * debtPct;
      const equity = ev - totalDebt;
      let debt = totalDebt;
      let currentEbitda = ebitda;

      let html = '<table><thead><tr><th>Year</th><th>EBITDA</th><th>Interest</th><th>FCF</th><th>Debt Paydown</th><th>Remaining Debt</th></tr></thead><tbody>';

      for (let y = 1; y <= holdYears; y++) {
        currentEbitda *= (1 + ebitdaGrowth);
        const interest = debt * interestRate;
        const fcf = currentEbitda * fcfConversion - interest;
        const paydown = Math.min(Math.max(fcf, 0), debt);
        debt -= paydown;

        html += `<tr><td>${y}</td><td>$${Calc.fmt(currentEbitda)}</td><td>$${Calc.fmt(interest)}</td><td>$${Calc.fmt(fcf)}</td><td>$${Calc.fmt(paydown)}</td><td>$${Calc.fmt(debt)}</td></tr>`;
      }

      const exitEV = currentEbitda * exitMultiple;
      const exitEquity = exitEV - debt;
      const moic = exitEquity / equity;
      const irr = Math.pow(moic, 1 / holdYears) - 1;

      html += '</tbody></table>';
      html += `<div style="margin-top:1rem">
        <p><strong>Exit EBITDA:</strong> $${Calc.fmt(currentEbitda)}</p>
        <p><strong>Exit EV (${exitMultiple}x):</strong> $${Calc.fmt(exitEV)}</p>
        <p><strong>Remaining Debt:</strong> $${Calc.fmt(debt)}</p>
        <p><strong>Exit Equity:</strong> $${Calc.fmt(exitEquity)}</p>
        <p><strong>MOIC:</strong> ${moic.toFixed(2)}x</p>
        <p><strong>IRR:</strong> ${Calc.pct(irr)}</p>
      </div>`;

      document.getElementById('lbo-result').innerHTML = html;
    });
  }
}

// --- Init Everything ---
document.addEventListener('DOMContentLoaded', () => {
  initCollapsibles();
  initSectionChecks();
  initChecklists();
  initQuizzes();
  initTabs();
  initMobileSidebar();
  highlightActiveNav();
  initCalculators();
  Progress.updateUI();
});
