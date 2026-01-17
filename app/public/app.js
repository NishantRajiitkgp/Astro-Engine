/**
 * Astro Engine - Frontend Application
 */

// DOM Elements
const form = document.getElementById('prediction-form');
const inputSection = document.getElementById('input-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const monthsContainer = document.getElementById('months-container');
const newPredictionBtn = document.getElementById('new-prediction-btn');
const tabs = document.querySelectorAll('.tab');

// State
let currentReport = null;
let currentCategory = 'relationships';
let currentBirthData = null;

// API Base URL
const API_BASE = '';

/**
 * Initialize the app
 */
function init() {
  form.addEventListener('submit', handleFormSubmit);
  newPredictionBtn.addEventListener('click', showInputForm);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchCategory(tab.dataset.category));
  });
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validate
  if (!data.name || !data.place || !data.year || !data.month || !data.day) {
    alert('Please fill in all required fields');
    return;
  }

  // Show loading
  inputSection.classList.add('hidden');
  loadingSection.classList.remove('hidden');
  resultsSection.classList.add('hidden');

  try {
    const response = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate predictions');
    }

    currentReport = await response.json();
    currentBirthData = data; // Store birth data for detailed reports
    sessionStorage.setItem('birthData', JSON.stringify(data)); // Persist for report page
    displayResults(currentReport);

  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
    showInputForm();
  }
}

/**
 * Display the prediction results
 */
function displayResults(report) {
  loadingSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');

  // Update profile
  document.getElementById('result-name').textContent = report.birthData.name;

  const chart = report.natalChart;
  document.getElementById('result-signs').textContent =
    `☀️ ${chart.sunSign} Sun • 🌙 ${chart.moonSign} Moon • ⬆️ ${chart.risingSign} Rising`;

  // Update best months
  document.getElementById('best-love').textContent = report.summary.bestMonths.relationships;
  document.getElementById('best-money').textContent = report.summary.bestMonths.financial;
  document.getElementById('best-health').textContent = report.summary.bestMonths.health;
  document.getElementById('best-career').textContent = report.summary.bestMonths.career;

  // Update outlook
  document.getElementById('overall-outlook').textContent = report.summary.overallOutlook;

  // Display months
  displayMonths(report.monthlyPredictions, currentCategory);
}

/**
 * Display monthly predictions for a category
 */
function displayMonths(monthlyPredictions, category) {
  monthsContainer.innerHTML = '';

  monthlyPredictions.forEach((month, index) => {
    const prediction = month[category];
    const card = createMonthCard(month, prediction, index);
    monthsContainer.appendChild(card);
  });
}

/**
 * Create a month card element
 */
function createMonthCard(month, prediction, index) {
  const card = document.createElement('div');
  card.className = 'month-card';
  card.dataset.index = index;

  // Rating stars
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < prediction.rating ? 'filled' : ''}">★</span>`
  ).join('');

  // Main content (always visible)
  card.innerHTML = `
    <div class="month-header">
      <span class="month-name">${prediction.month} ${prediction.year}</span>
      <div class="month-rating">${stars}</div>
    </div>
    <div class="month-theme">${prediction.theme}</div>
    
    <div class="month-details">
      ${prediction.highlights.length > 0 ? `
        <div class="detail-section">
          <h4>Highlights</h4>
          <ul>${prediction.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      ${prediction.opportunities.length > 0 ? `
        <div class="detail-section opportunities">
          <h4>✨ Opportunities</h4>
          <ul>${prediction.opportunities.map(o => `<li>${o}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      ${prediction.challenges.length > 0 ? `
        <div class="detail-section challenges">
          <h4>⚡ Challenges</h4>
          <ul>${prediction.challenges.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      <div class="detail-section">
        <h4>💡 Advice</h4>
        <p class="advice-text">${prediction.advice}</p>
      </div>
    </div>
  `;

  // Toggle expand on click
  card.addEventListener('click', () => {
    const wasExpanded = card.classList.contains('expanded');

    // Collapse all cards
    document.querySelectorAll('.month-card').forEach(c => c.classList.remove('expanded'));

    // Expand this card if it wasn't already expanded
    if (!wasExpanded) {
      card.classList.add('expanded');
    }
  });

  return card;
}

/**
 * Switch category tab
 */
function switchCategory(category) {
  currentCategory = category;

  // Update active tab
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });

  // Re-display months
  if (currentReport) {
    displayMonths(currentReport.monthlyPredictions, category);
  }
}

/**
 * Show input form
 */
function showInputForm() {
  inputSection.classList.remove('hidden');
  loadingSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
