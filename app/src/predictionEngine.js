/**
 * Main Prediction Engine
 * Orchestrates birth chart calculation and 12-month forecast generation
 */

const { calculateBirthChart } = require('./birthChart');
const { calculate12MonthTransits, analyzeTransitsToNatal, getTransitHousePlacements } = require('./transits');
const { generateRelationshipPrediction } = require('./predictions/relationships');
const { generateFinancialPrediction } = require('./predictions/financial');
const { generateHealthPrediction } = require('./predictions/health');
const { generateCareerPrediction } = require('./predictions/career');

/**
 * Generate complete 12-month prediction report
 * @param {object} birthData - User's birth information
 * @returns {Promise<object>} Complete prediction report
 */
async function generatePredictionReport(birthData) {
    // Calculate birth chart
    const natalChart = await calculateBirthChart(birthData);

    // Get current date for starting predictions
    const now = new Date();
    const startYear = now.getFullYear();
    const startMonth = now.getMonth() + 1;

    // Calculate 12 months of transits
    const monthlyTransits = await calculate12MonthTransits(startYear, startMonth);

    // Generate predictions for each month
    const monthlyPredictions = [];

    for (const monthData of monthlyTransits) {
        // Analyze transits at mid-month for more accurate aspects
        const transitAspects = analyzeTransitsToNatal(natalChart, monthData.transitsMid);
        const housePlacements = getTransitHousePlacements(natalChart, monthData.transitsMid);

        // Generate predictions for each life area
        const predictions = {
            monthIndex: monthData.monthIndex,
            month: monthData.monthName,
            year: monthData.year,
            relationships: generateRelationshipPrediction(natalChart, monthData, transitAspects, housePlacements),
            financial: generateFinancialPrediction(natalChart, monthData, transitAspects, housePlacements),
            health: generateHealthPrediction(natalChart, monthData, transitAspects, housePlacements),
            career: generateCareerPrediction(natalChart, monthData, transitAspects, housePlacements),
            keyTransits: transitAspects.filter(a => a.exact || a.orb < 2).slice(0, 5)
        };

        // Calculate overall month rating
        predictions.overallRating = Math.round(
            (predictions.relationships.rating +
                predictions.financial.rating +
                predictions.health.rating +
                predictions.career.rating) / 4
        );

        monthlyPredictions.push(predictions);
    }

    // Generate summary insights
    const summary = generateSummary(monthlyPredictions);

    return {
        birthData: {
            name: birthData.name,
            dateOfBirth: `${birthData.day}/${birthData.month}/${birthData.year}`,
            timeOfBirth: `${birthData.hour}:${String(birthData.minute).padStart(2, '0')}`,
            location: birthData.placeName || `${birthData.latitude}, ${birthData.longitude}`
        },
        natalChart: formatNatalChartForDisplay(natalChart),
        monthlyPredictions: monthlyPredictions,
        summary: summary,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Format natal chart for user-friendly display
 */
function formatNatalChartForDisplay(chart) {
    const planets = {};
    for (const [name, data] of Object.entries(chart.planets)) {
        planets[name] = {
            sign: data.sign,
            degree: `${data.degree}°${data.minutes}'`,
            house: data.house,
            retrograde: data.isRetrograde
        };
    }

    return {
        sunSign: chart.planets.sun.sign,
        moonSign: chart.planets.moon.sign,
        risingSign: chart.ascendant.sign,
        planets: planets,
        houses: Object.entries(chart.houses.cusps).reduce((acc, [num, data]) => {
            acc[num] = { sign: data.sign, degree: data.degree };
            return acc;
        }, {})
    };
}

/**
 * Generate overall summary insights
 */
function generateSummary(monthlyPredictions) {
    // Find best months for each area
    const bestRelationshipMonth = [...monthlyPredictions].sort((a, b) =>
        b.relationships.rating - a.relationships.rating
    )[0];

    const bestFinancialMonth = [...monthlyPredictions].sort((a, b) =>
        b.financial.rating - a.financial.rating
    )[0];

    const bestHealthMonth = [...monthlyPredictions].sort((a, b) =>
        b.health.rating - a.health.rating
    )[0];

    const bestCareerMonth = [...monthlyPredictions].sort((a, b) =>
        b.career.rating - a.career.rating
    )[0];

    // Calculate average ratings
    const avgRatings = {
        relationships: average(monthlyPredictions.map(m => m.relationships.rating)),
        financial: average(monthlyPredictions.map(m => m.financial.rating)),
        health: average(monthlyPredictions.map(m => m.health.rating)),
        career: average(monthlyPredictions.map(m => m.career.rating))
    };

    return {
        bestMonths: {
            relationships: `${bestRelationshipMonth.month} ${bestRelationshipMonth.year}`,
            financial: `${bestFinancialMonth.month} ${bestFinancialMonth.year}`,
            health: `${bestHealthMonth.month} ${bestHealthMonth.year}`,
            career: `${bestCareerMonth.month} ${bestCareerMonth.year}`
        },
        averageRatings: avgRatings,
        overallOutlook: getOverallOutlook(avgRatings)
    };
}

function average(arr) {
    return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}

function getOverallOutlook(ratings) {
    const avg = (ratings.relationships + ratings.financial + ratings.health + ratings.career) / 4;

    if (avg >= 4) return 'Excellent year ahead with many opportunities for growth and success.';
    if (avg >= 3.5) return 'A positive year with good prospects across most life areas.';
    if (avg >= 3) return 'A balanced year with both opportunities and challenges to navigate.';
    if (avg >= 2.5) return 'A year of growth through challenges. Focus on building foundations.';
    return 'A transformative year. Patience and perseverance will be your greatest allies.';
}

module.exports = { generatePredictionReport };
