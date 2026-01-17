/**
 * Health Predictions
 * Analyzes transits related to physical health, vitality, and wellness
 */

const interpretations = require('../interpretations.json');

/**
 * Generate health predictions for a month
 * @param {object} natalChart - Birth chart
 * @param {object} monthData - Monthly transit data
 * @param {array} transitAspects - Aspects from transits to natal
 * @param {object} housePlacements - Transit house positions
 * @returns {object} Health prediction
 */
function generateHealthPrediction(natalChart, monthData, transitAspects, housePlacements) {
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

    let vitalityScore = 0;
    let stressScore = 0;

    // Check 6th house transits (health, daily routine)
    const sixthHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 6)
        .map(([planet]) => planet);

    if (sixthHouseTransits.length > 0) {
        predictions.highlights.push(
            `Health sector activated by ${formatPlanets(sixthHouseTransits)}`
        );

        if (sixthHouseTransits.includes('jupiter')) {
            vitalityScore += 2;
            predictions.opportunities.push('Good time to start new health routines; healing energy is strong');
        }
        if (sixthHouseTransits.includes('mars')) {
            stressScore += 1;
            predictions.challenges.push('Watch for overexertion; balance activity with rest');
            predictions.opportunities.push('High energy for fitness and physical goals');
        }
        if (sixthHouseTransits.includes('saturn')) {
            stressScore += 1;
            predictions.challenges.push('Pay attention to chronic issues; preventive care is important');
        }
    }

    // Check 1st house transits (body, vitality)
    const firstHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 1)
        .map(([planet]) => planet);

    if (firstHouseTransits.includes('mars')) {
        vitalityScore += 2;
        predictions.opportunities.push('High physical energy and motivation');
    }
    if (firstHouseTransits.includes('jupiter')) {
        vitalityScore += 2;
        predictions.opportunities.push('Strong vitality and optimistic outlook');
    }
    if (firstHouseTransits.includes('saturn')) {
        stressScore += 1;
        predictions.challenges.push('Energy may feel depleted; pace yourself');
    }

    // Check Mars transits (energy, vitality)
    const marsPlacement = housePlacements.mars;
    if (marsPlacement) {
        predictions.highlights.push(
            `Mars energizes your ${getOrdinal(marsPlacement.house)} house`
        );
        vitalityScore += 1;
    }

    // Check Mars aspects
    const marsAspects = transitAspects.filter(a => a.transitPlanet === 'mars');
    for (const aspect of marsAspects) {
        if (aspect.nature === 'harmonious') {
            vitalityScore += 1;
            if (aspect.natalPlanet === 'sun') {
                predictions.opportunities.push('Strong vital force and physical confidence');
            }
        } else if (aspect.nature === 'challenging') {
            stressScore += 1;
            if (aspect.natalPlanet === 'sun' || aspect.natalPlanet === 'moon') {
                predictions.challenges.push('Manage stress and avoid accidents through mindfulness');
            }
        }
    }

    // Check Saturn aspects (limitations, chronic issues)
    const saturnAspects = transitAspects.filter(a => a.transitPlanet === 'saturn');
    for (const aspect of saturnAspects) {
        if (aspect.nature === 'challenging') {
            stressScore += 1;
            if (['sun', 'moon', 'mars'].includes(aspect.natalPlanet)) {
                predictions.challenges.push('Energy conservation important; don\'t overcommit');
            }
        }
    }

    // Check Moon (emotional health)
    const moonAspects = transitAspects.filter(a =>
        a.natalPlanet === 'moon' && ['saturn', 'pluto', 'neptune'].includes(a.transitPlanet)
    );

    for (const aspect of moonAspects) {
        if (aspect.nature === 'challenging') {
            stressScore += 1;
            predictions.challenges.push('Emotional well-being needs attention; practice self-care');
        }
    }

    // Check 12th house (rest, recovery)
    const twelfthHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 12)
        .map(([planet]) => planet);

    if (twelfthHouseTransits.length > 0) {
        predictions.highlights.push('Focus on rest and spiritual renewal');
        predictions.opportunities.push('Good period for healing retreats and restful activities');
    }

    // Generate theme and advice
    if (vitalityScore > stressScore) {
        predictions.theme = 'Strong Vitality & Wellness';
        predictions.advice = 'Your energy is good. This is an excellent time to establish healthy habits, exercise, and focus on physical goals. Your body is resilient now.';
        predictions.rating = Math.min(5, 3 + Math.floor((vitalityScore - stressScore) / 2));
    } else if (stressScore > vitalityScore) {
        predictions.theme = 'Rest & Recovery Period';
        predictions.advice = 'Prioritize rest and avoid overexertion. Listen to your body and address any health concerns early. Prevention is better than cure.';
        predictions.rating = Math.max(1, 3 - Math.floor((stressScore - vitalityScore) / 2));
    } else {
        predictions.theme = 'Balanced Health Energy';
        predictions.advice = 'Maintain your current health routines. Focus on balance in diet, exercise, and rest. Regular check-ups are beneficial now.';
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

module.exports = { generateHealthPrediction };
