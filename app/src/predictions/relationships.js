/**
 * Relationship Predictions
 * Analyzes transits related to love, partnerships, and social connections
 */

const interpretations = require('../interpretations.json');

/**
 * Generate relationship predictions for a month
 * @param {object} natalChart - Birth chart
 * @param {object} monthData - Monthly transit data
 * @param {array} transitAspects - Aspects from transits to natal
 * @param {object} housePlacements - Transit house positions
 * @returns {object} Relationship prediction
 */
function generateRelationshipPrediction(natalChart, monthData, transitAspects, housePlacements) {
    const predictions = {
        month: monthData.monthName,
        year: monthData.year,
        theme: '',
        highlights: [],
        opportunities: [],
        challenges: [],
        advice: '',
        rating: 0 // 1-5 scale
    };

    let positiveScore = 0;
    let challengeScore = 0;

    // Check Venus transits (primary relationship planet)
    const venusPlacement = housePlacements.venus;
    if (venusPlacement) {
        const venusHouse = venusPlacement.house;
        predictions.highlights.push(
            `Venus in your ${getOrdinal(venusHouse)} house of ${interpretations.houses[venusHouse].theme}`
        );

        if ([5, 7, 11].includes(venusHouse)) {
            positiveScore += 2;
            predictions.opportunities.push('Favorable period for romance and social connections');
        }
    }

    // Check 7th house transits (partnerships)
    const seventhHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 7)
        .map(([planet]) => planet);

    if (seventhHouseTransits.length > 0) {
        predictions.highlights.push(
            `Partnership sector activated by ${formatPlanets(seventhHouseTransits)}`
        );

        if (seventhHouseTransits.includes('jupiter')) {
            positiveScore += 3;
            predictions.opportunities.push('Excellent time for committed relationships and beneficial partnerships');
        }
        if (seventhHouseTransits.includes('saturn')) {
            challengeScore += 1;
            predictions.challenges.push('Relationship responsibilities may feel heavier; commitment is tested');
        }
    }

    // Check Venus aspects to natal planets
    const venusAspects = transitAspects.filter(a =>
        a.transitPlanet === 'venus' || a.natalPlanet === 'venus'
    );

    for (const aspect of venusAspects) {
        if (aspect.nature === 'harmonious') {
            positiveScore += 1;
            if (aspect.natalPlanet === 'sun' || aspect.natalPlanet === 'moon') {
                predictions.opportunities.push('Increased magnetism and attractiveness');
            }
        } else if (aspect.nature === 'challenging') {
            challengeScore += 1;
            predictions.challenges.push(`Venus ${aspect.name}: Possible relationship tensions to navigate`);
        }
    }

    // Check Mars aspects (passion, conflict)
    const marsAspects = transitAspects.filter(a =>
        a.transitPlanet === 'mars' && ['venus', 'moon', 'sun'].includes(a.natalPlanet)
    );

    for (const aspect of marsAspects) {
        if (aspect.nature === 'harmonious') {
            positiveScore += 1;
            predictions.opportunities.push('Passion and romantic energy are heightened');
        } else if (aspect.nature === 'challenging') {
            challengeScore += 1;
            predictions.challenges.push('Watch for conflicts or impulsive actions in relationships');
        }
    }

    // Generate theme and advice
    if (positiveScore > challengeScore) {
        predictions.theme = 'Favorable Period for Love & Connection';
        predictions.advice = 'This is a good time to put yourself out there socially. Be open to new connections and nurture existing bonds.';
        predictions.rating = Math.min(5, 3 + Math.floor((positiveScore - challengeScore) / 2));
    } else if (challengeScore > positiveScore) {
        predictions.theme = 'Relationship Growth Through Challenge';
        predictions.advice = 'Focus on clear communication and patience. Challenges now help you understand what you truly need in relationships.';
        predictions.rating = Math.max(1, 3 - Math.floor((challengeScore - positiveScore) / 2));
    } else {
        predictions.theme = 'Steady Relationship Energy';
        predictions.advice = 'A balanced month for relationships. Focus on quality time with loved ones and honest self-reflection.';
        predictions.rating = 3;
    }

    return predictions;
}

function getOrdinal(n) {
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    return ordinals[n] || n + 'th';
}

function formatPlanets(planets) {
    return planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
}

module.exports = { generateRelationshipPrediction };
