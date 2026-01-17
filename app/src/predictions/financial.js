/**
 * Financial Predictions
 * Analyzes transits related to money, resources, and material security
 */

const interpretations = require('../interpretations.json');

/**
 * Generate financial predictions for a month
 * @param {object} natalChart - Birth chart
 * @param {object} monthData - Monthly transit data
 * @param {array} transitAspects - Aspects from transits to natal
 * @param {object} housePlacements - Transit house positions
 * @returns {object} Financial prediction
 */
function generateFinancialPrediction(natalChart, monthData, transitAspects, housePlacements) {
    const predictions = {
        month: monthData.monthName,
        year: monthData.year,
        theme: '',
        highlights: [],
        opportunities: [],
        challenges: [],
        advice: '',
        rating: 0
    };

    let positiveScore = 0;
    let challengeScore = 0;

    // Check 2nd house transits (personal income, values)
    const secondHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 2)
        .map(([planet]) => planet);

    if (secondHouseTransits.length > 0) {
        predictions.highlights.push(
            `Income sector activated by ${formatPlanets(secondHouseTransits)}`
        );

        if (secondHouseTransits.includes('jupiter')) {
            positiveScore += 3;
            predictions.opportunities.push('Excellent period for income growth and financial abundance');
        }
        if (secondHouseTransits.includes('venus')) {
            positiveScore += 2;
            predictions.opportunities.push('Money flows more easily; good for purchases you value');
        }
        if (secondHouseTransits.includes('saturn')) {
            challengeScore += 1;
            predictions.challenges.push('Financial discipline required; need to budget carefully');
        }
    }

    // Check 8th house transits (shared resources, investments)
    const eighthHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 8)
        .map(([planet]) => planet);

    if (eighthHouseTransits.length > 0) {
        predictions.highlights.push(
            `Investments and shared resources in focus with ${formatPlanets(eighthHouseTransits)}`
        );

        if (eighthHouseTransits.includes('jupiter')) {
            positiveScore += 2;
            predictions.opportunities.push('Favorable for investments, loans, or partner finances');
        }
        if (eighthHouseTransits.includes('pluto')) {
            predictions.highlights.push('Deep financial transformation possible');
        }
    }

    // Check Jupiter transits (expansion, opportunity)
    const jupiterPlacement = housePlacements.jupiter;
    if (jupiterPlacement) {
        const jupiterHouse = jupiterPlacement.house;
        if ([2, 8, 10, 11].includes(jupiterHouse)) {
            positiveScore += 2;
            predictions.opportunities.push(
                `Jupiter expands ${interpretations.houses[jupiterHouse].theme.toLowerCase()}`
            );
        }
    }

    // Check Jupiter aspects to natal planets
    const jupiterAspects = transitAspects.filter(a => a.transitPlanet === 'jupiter');
    for (const aspect of jupiterAspects) {
        if (aspect.nature === 'harmonious') {
            positiveScore += 1;
            if (['sun', 'venus', 'jupiter'].includes(aspect.natalPlanet)) {
                predictions.opportunities.push('Lucky period for financial ventures');
            }
        }
    }

    // Check Saturn aspects (discipline, restrictions)
    const saturnAspects = transitAspects.filter(a => a.transitPlanet === 'saturn');
    for (const aspect of saturnAspects) {
        if (aspect.nature === 'challenging') {
            challengeScore += 1;
            if (['sun', 'moon', 'venus'].includes(aspect.natalPlanet)) {
                predictions.challenges.push('Financial caution advised; avoid risky ventures');
            }
        } else if (aspect.nature === 'harmonious') {
            predictions.opportunities.push('Steady building of long-term financial security');
        }
    }

    // Check 10th house (career income potential)
    const tenthHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 10)
        .map(([planet]) => planet);

    if (tenthHouseTransits.includes('jupiter') || tenthHouseTransits.includes('venus')) {
        positiveScore += 1;
        predictions.opportunities.push('Career advancement may boost income');
    }

    // Generate theme and advice
    if (positiveScore > challengeScore) {
        predictions.theme = 'Financial Growth & Opportunity';
        predictions.advice = 'A favorable period for financial matters. Consider expanding income sources and making strategic investments. Generosity now returns to you.';
        predictions.rating = Math.min(5, 3 + Math.floor((positiveScore - challengeScore) / 2));
    } else if (challengeScore > positiveScore) {
        predictions.theme = 'Financial Discipline & Restructuring';
        predictions.advice = 'Focus on budgeting and reducing unnecessary expenses. Avoid major financial risks. This is a time for building solid foundations.';
        predictions.rating = Math.max(1, 3 - Math.floor((challengeScore - positiveScore) / 2));
    } else {
        predictions.theme = 'Stable Financial Energy';
        predictions.advice = 'A balanced month financially. Maintain your current strategies and avoid impulsive purchases. Review your long-term financial goals.';
        predictions.rating = 3;
    }

    return predictions;
}

function formatPlanets(planets) {
    return planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
}

module.exports = { generateFinancialPrediction };
