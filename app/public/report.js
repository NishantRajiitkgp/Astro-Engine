/**
 * Detailed Report Page JavaScript
 */

const API_BASE = '';
let currentReport = null;
let currentCategory = 'relationships';
let birthData = null;

/**
 * Initialize the page
 */
async function init() {
    // Get birth data from session storage
    birthData = JSON.parse(sessionStorage.getItem('birthData'));

    if (!birthData) {
        // Redirect to home if no birth data
        window.location.href = '/';
        return;
    }

    // Set up event listeners
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => switchCategory(btn.dataset.category));
    });

    document.getElementById('print-btn').addEventListener('click', () => {
        window.print();
    });

    // Load initial report
    await loadReport(currentCategory);
}

/**
 * Load detailed report for a category
 */
async function loadReport(category) {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/detailed-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...birthData, category })
        });

        if (!response.ok) {
            throw new Error('Failed to generate report');
        }

        currentReport = await response.json();
        displayReport(currentReport);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load report. Please try again.');
        window.location.href = '/';
    }

    showLoading(false);
}

/**
 * Display the report
 */
function displayReport(report) {
    // Update cover section
    document.getElementById('report-title').textContent = report.title;
    document.getElementById('report-for').innerHTML = `Prepared for <strong>${report.generatedFor}</strong>`;
    document.getElementById('report-birth').textContent = `Born: ${report.birthDate} | ${report.birthPlace}`;
    document.getElementById('report-date').textContent = `Generated: ${new Date(report.generatedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    })}`;

    // Display introduction
    document.getElementById('introduction-content').innerHTML = formatProse(report.introduction);

    // Display lifetime analysis
    displayLifetimeAnalysis(report.lifetimeAnalysis);

    // Display yearly overview
    displayYearlyOverview(report.yearlyOverview);

    // Display monthly forecasts
    displayMonthlyForecasts(report.monthlyForecasts);

    // Display conclusion
    document.getElementById('conclusion-content').innerHTML = formatProse(report.conclusion);

    // Show the report
    document.getElementById('report-container').classList.remove('hidden');
}

/**
 * Display lifetime analysis section
 */
function displayLifetimeAnalysis(analysis) {
    document.getElementById('lifetime-title').textContent = analysis.title;
    document.getElementById('lifetime-description').textContent = analysis.description;

    const container = document.getElementById('lifetime-content');
    container.innerHTML = '';

    for (const section of analysis.sections) {
        const card = document.createElement('div');
        card.className = 'lifetime-card';

        let cardHtml = `<h3>${section.title}</h3>`;
        cardHtml += `<p>${section.content}</p>`;

        if (section.strength) {
            cardHtml += `<div class="strength">${section.strength}</div>`;
        }
        if (section.challenge) {
            cardHtml += `<div class="challenge">${section.challenge}</div>`;
        }

        card.innerHTML = cardHtml;
        container.appendChild(card);
    }
}

/**
 * Display yearly overview
 */
function displayYearlyOverview(overview) {
    document.getElementById('yearly-title').textContent = overview.title;

    const container = document.getElementById('yearly-content');
    container.innerHTML = overview.paragraphs.map(p => `<p>${p}</p>`).join('');
}

/**
 * Display monthly forecasts
 */
function displayMonthlyForecasts(forecasts) {
    const container = document.getElementById('monthly-content');
    container.innerHTML = '';

    forecasts.forEach((forecast, index) => {
        const monthEl = document.createElement('div');
        monthEl.className = 'month-forecast' + (index === 0 ? ' expanded' : '');

        let sectionsHtml = '';
        for (const section of forecast.sections) {
            sectionsHtml += `
        <div class="forecast-subsection">
          <h4>${section.title}</h4>
          <div class="prose">${formatProse(section.content)}</div>
        </div>
      `;
        }

        monthEl.innerHTML = `
      <div class="month-header" onclick="toggleMonth(this.parentElement)">
        <h3 class="month-title">${forecast.month} ${forecast.year}</h3>
        <span class="month-toggle">▼</span>
      </div>
      <div class="month-content">
        <div class="month-inner">
          ${sectionsHtml}
        </div>
      </div>
    `;

        container.appendChild(monthEl);
    });
}

/**
 * Toggle month expansion
 */
function toggleMonth(monthEl) {
    monthEl.classList.toggle('expanded');
}

/**
 * Switch category
 */
async function switchCategory(category) {
    if (category === currentCategory) return;

    currentCategory = category;

    // Update button states
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Load new report
    await loadReport(category);
}

/**
 * Format text for prose display
 */
function formatProse(text) {
    if (!text) return '';

    // Handle markdown-style formatting
    let html = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/---/g, '<hr>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    if (!html.startsWith('<p>')) {
        html = '<p>' + html + '</p>';
    }

    return html;
}

/**
 * Show/hide loading screen
 */
function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
    document.getElementById('report-container').classList.toggle('hidden', show);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

// Make toggleMonth global for onclick
window.toggleMonth = toggleMonth;
