/**
 * Transit Calculator
 * Calculates transiting planet positions for future months
 * and detects aspects to natal chart
 */

const ephemeris = require('./ephemeris');

/**
 * Calculate transits for a given date
 * @param {number} year 
 * @param {number} month 
 * @param {number} day 
 * @returns {Promise<object>} Transiting planet positions
 */
async function calculateTransits(year, month, day) {
    await ephemeris.initialize();

    const julianDay = ephemeris.dateToJulianDay(year, month, day, 12); // Noon

    const transits = {};
    for (const [name, code] of Object.entries(ephemeris.PLANETS)) {
        try {
            transits[name.toLowerCase()] = ephemeris.calculatePlanetPosition(julianDay, code);
        } catch (err) {
            console.warn(`Could not calculate transit for ${name}: ${err.message}`);
        }
    }

    return {
        date: { year, month, day },
        julianDay,
        planets: transits
    };
}

/**
 * Calculate transits for 12 months from a starting date
 * @param {number} startYear 
 * @param {number} startMonth 
 * @returns {Promise<array>} Monthly transit data
 */
async function calculate12MonthTransits(startYear, startMonth) {
    const monthlyTransits = [];

    let year = startYear;
    let month = startMonth;

    for (let i = 0; i < 12; i++) {
        // Calculate transits for the 1st and 15th of each month
        const firstOfMonth = await calculateTransits(year, month, 1);
        const midMonth = await calculateTransits(year, month, 15);

        monthlyTransits.push({
            monthIndex: i,
            year,
            month,
            monthName: getMonthName(month),
            transitsStart: firstOfMonth,
            transitsMid: midMonth
        });

        // Move to next month
        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
    }

    return monthlyTransits;
}

/**
 * Analyze transits to natal chart
 * @param {object} natalChart - The natal chart
 * @param {object} transits - Current transits
 * @returns {array} List of transit aspects
 */
function analyzeTransitsToNatal(natalChart, transits) {
    const transitAspects = [];

    for (const [transitPlanet, transitPos] of Object.entries(transits.planets)) {
        for (const [natalPlanet, natalPos] of Object.entries(natalChart.planets)) {
            const aspect = ephemeris.calculateAspect(transitPos.longitude, natalPos.longitude);

            if (aspect) {
                transitAspects.push({
                    transitPlanet,
                    natalPlanet,
                    transitPosition: transitPos,
                    natalPosition: natalPos,
                    ...aspect,
                    description: `Transiting ${formatName(transitPlanet)} ${aspect.symbol} Natal ${formatName(natalPlanet)}`
                });
            }
        }

        // Also check aspects to Ascendant and MC
        const ascAspect = ephemeris.calculateAspect(transitPos.longitude, natalChart.ascendant.longitude);
        if (ascAspect) {
            transitAspects.push({
                transitPlanet,
                natalPlanet: 'ascendant',
                ...ascAspect,
                description: `Transiting ${formatName(transitPlanet)} ${ascAspect.symbol} Ascendant`
            });
        }

        const mcAspect = ephemeris.calculateAspect(transitPos.longitude, natalChart.midheaven.longitude);
        if (mcAspect) {
            transitAspects.push({
                transitPlanet,
                natalPlanet: 'midheaven',
                ...mcAspect,
                description: `Transiting ${formatName(transitPlanet)} ${mcAspect.symbol} Midheaven`
            });
        }
    }

    return transitAspects;
}

/**
 * Calculate which natal house transiting planets are in
 * @param {object} natalChart - The natal chart
 * @param {object} transits - Current transits  
 * @returns {object} House transits by planet
 */
function getTransitHousePlacements(natalChart, transits) {
    const housePlacements = {};

    for (const [planet, position] of Object.entries(transits.planets)) {
        const house = ephemeris.getHousePosition(position.longitude, natalChart.houses.cusps);
        housePlacements[planet] = {
            house,
            houseName: ephemeris.HOUSES[house],
            position
        };
    }

    return housePlacements;
}

/**
 * Get significant transits (major planets to personal points)
 * @param {array} transitAspects - All transit aspects
 * @returns {array} Significant transits only
 */
function getSignificantTransits(transitAspects) {
    const significantTransitPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const significantNatalPoints = ['sun', 'moon', 'mercury', 'venus', 'mars', 'ascendant', 'midheaven'];

    return transitAspects.filter(aspect =>
        significantTransitPlanets.includes(aspect.transitPlanet) &&
        significantNatalPoints.includes(aspect.natalPlanet)
    );
}

function formatName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ');
}

function getMonthName(month) {
    const months = [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

module.exports = {
    calculateTransits,
    calculate12MonthTransits,
    analyzeTransitsToNatal,
    getTransitHousePlacements,
    getSignificantTransits
};
