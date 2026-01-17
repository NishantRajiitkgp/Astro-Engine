/**
 * Career Predictions
 * Analyzes transits related to profession, public image, and achievements
 */

const interpretations = require('../interpretations.json');

/**
 * Generate career predictions for a month
 * @param {object} natalChart - Birth chart
 * @param {object} monthData - Monthly transit data
 * @param {array} transitAspects - Aspects from transits to natal
 * @param {object} housePlacements - Transit house positions
 * @returns {object} Career prediction
 */
function generateCareerPrediction(natalChart, monthData, transitAspects, housePlacements) {
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

    let successScore = 0;
    let challengeScore = 0;

    // Check 10th house transits (career, public image)
    const tenthHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 10)
        .map(([planet]) => planet);

    if (tenthHouseTransits.length > 0) {
        predictions.highlights.push(
            `Career sector activated by ${formatPlanets(tenthHouseTransits)}`
        );

        if (tenthHouseTransits.includes('jupiter')) {
            successScore += 3;
            predictions.opportunities.push('Excellent period for career advancement and recognition');
        }
        if (tenthHouseTransits.includes('venus')) {
            successScore += 2;
            predictions.opportunities.push('Favorable impressions on authority figures; charm helps career');
        }
        if (tenthHouseTransits.includes('saturn')) {
            predictions.highlights.push('Important period for career responsibilities and achievements');
            predictions.challenges.push('Heavy workload but lasting results from efforts');
        }
        if (tenthHouseTransits.includes('mars')) {
            successScore += 1;
            predictions.opportunities.push('Strong drive and ambition for professional goals');
            predictions.challenges.push('Avoid conflicts with superiors or colleagues');
        }
    }

    // Check Midheaven aspects
    const mcAspects = transitAspects.filter(a => a.natalPlanet === 'midheaven');
    for (const aspect of mcAspects) {
        if (aspect.nature === 'harmonious') {
            successScore += 2;
            predictions.opportunities.push(`${formatPlanet(aspect.transitPlanet)} supports career progress`);
        } else if (aspect.nature === 'challenging') {
            challengeScore += 1;
            predictions.challenges.push(`${formatPlanet(aspect.transitPlanet)} brings career tests`);
        }
    }

    // Check 6th house (daily work environment)
    const sixthHouseTransits = Object.entries(housePlacements)
        .filter(([planet, data]) => data.house === 6)
        .map(([planet]) => planet);

    if (sixthHouseTransits.includes('jupiter')) {
        successScore += 1;
        predictions.opportunities.push('Improved work environment and colleague relationships');
    }
    if (sixthHouseTransits.includes('saturn')) {
        challengeScore += 1;
        predictions.challenges.push('Increased workload and responsibilities in daily tasks');
    }

    // Check Saturn transits (career milestones)
    const saturnPlacement = housePlacements.saturn;
    if (saturnPlacement && [1, 4, 7, 10].includes(saturnPlacement.house)) {
        predictions.highlights.push('Saturn in angular house: significant career development period');
    }

    const saturnAspects = transitAspects.filter(a => a.transitPlanet === 'saturn');
    for (const aspect of saturnAspects) {
        if (['sun', 'moon', 'midheaven'].includes(aspect.natalPlanet)) {
            if (aspect.nature === 'harmonious') {
                predictions.opportunities.push('Recognition for hard work and dedication');
            } else {
                challengeScore += 1;
                predictions.challenges.push('Career restructuring or increased responsibilities');
            }
        }
    }

    // Check Jupiter transits (opportunities)
    const jupiterAspects = transitAspects.filter(a => a.transitPlanet === 'jupiter');
    for (const aspect of jupiterAspects) {
        if (['sun', 'midheaven'].includes(aspect.natalPlanet)) {
            if (aspect.nature === 'harmonious' || aspect.name === 'conjunction') {
                successScore += 2;
                predictions.opportunities.push('Lucky breaks and expansion in career');
            }
        }
    }

    // Check Mercury transits (communication, networking)
    const mercuryAspects = transitAspects.filter(a =>
        a.transitPlanet === 'mercury' && ['sun', 'mercury', 'midheaven'].includes(a.natalPlanet)
    );

    if (mercuryAspects.length > 0) {
        predictions.opportunities.push('Good period for negotiations, presentations, and networking');
    }

    // Generate theme and advice
    if (successScore > challengeScore) {
        predictions.theme = 'Career Advancement & Success';
        predictions.advice = 'This is a favorable time for career initiatives. Put yourself forward for opportunities, network actively, and showcase your skills. Recognition is likely.';
        predictions.rating = Math.min(5, 3 + Math.floor((successScore - challengeScore) / 2));
    } else if (challengeScore > successScore) {
        predictions.theme = 'Career Challenges & Growth';
        predictions.advice = 'Focus on demonstrating reliability and handling responsibilities well. Avoid power struggles. Challenges now build your professional reputation.';
        predictions.rating = Math.max(1, 3 - Math.floor((challengeScore - successScore) / 2));
    } else {
        predictions.theme = 'Steady Career Progress';
        predictions.advice = 'Maintain consistent effort in your work. This is a good time for skill development and planning future career moves.';
        predictions.rating = 3;
    }

    return predictions;
}

function formatPlanets(planets) {
    return planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
}

function formatPlanet(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

module.exports = { generateCareerPrediction };
