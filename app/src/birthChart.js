/**
 * Birth Chart Calculator
 * Generates a complete natal chart with planets, houses, and aspects
 */

const ephemeris = require('./ephemeris');

/**
 * Calculate complete birth chart
 * @param {object} birthData - Birth information
 * @param {number} birthData.year - Birth year
 * @param {number} birthData.month - Birth month (1-12)
 * @param {number} birthData.day - Birth day (1-31)
 * @param {number} birthData.hour - Birth hour (0-23)
 * @param {number} birthData.minute - Birth minute (0-59)
 * @param {number} birthData.latitude - Birth location latitude
 * @param {number} birthData.longitude - Birth location longitude
 * @param {string} birthData.timezone - Timezone offset in hours (e.g., 5.5 for IST)
 * @returns {Promise<object>} Complete birth chart
 */
async function calculateBirthChart(birthData) {
    // Initialize Swiss Ephemeris
    await ephemeris.initialize();

    // Convert local time to UTC
    const utcHour = ephemeris.timeToDecimal(birthData.hour, birthData.minute) - (birthData.timezone || 0);

    // Handle day rollover for UTC conversion
    let utcDay = birthData.day;
    let utcMonth = birthData.month;
    let utcYear = birthData.year;

    if (utcHour < 0) {
        // Previous day
        utcDay -= 1;
        if (utcDay < 1) {
            utcMonth -= 1;
            if (utcMonth < 1) {
                utcMonth = 12;
                utcYear -= 1;
            }
            utcDay = getDaysInMonth(utcMonth, utcYear);
        }
    } else if (utcHour >= 24) {
        // Next day
        utcDay += 1;
        const daysInMonth = getDaysInMonth(utcMonth, utcYear);
        if (utcDay > daysInMonth) {
            utcDay = 1;
            utcMonth += 1;
            if (utcMonth > 12) {
                utcMonth = 1;
                utcYear += 1;
            }
        }
    }

    const adjustedUtcHour = ((utcHour % 24) + 24) % 24;

    // Calculate Julian Day
    const julianDay = ephemeris.dateToJulianDay(utcYear, utcMonth, utcDay, adjustedUtcHour);

    // Calculate house cusps
    const houses = ephemeris.calculateHouses(julianDay, birthData.latitude, birthData.longitude);

    // Calculate planetary positions
    const planets = {};
    for (const [name, code] of Object.entries(ephemeris.PLANETS)) {
        try {
            const position = ephemeris.calculatePlanetPosition(julianDay, code);
            const houseNum = ephemeris.getHousePosition(position.longitude, houses.cusps);

            planets[name.toLowerCase()] = {
                ...position,
                house: houseNum,
                houseName: ephemeris.HOUSES[houseNum]
            };
        } catch (err) {
            console.warn(`Could not calculate position for ${name}: ${err.message}`);
        }
    }

    // Calculate aspects between planets
    const aspects = calculateAllAspects(planets);

    return {
        birthData: {
            ...birthData,
            julianDay: julianDay
        },
        planets: planets,
        houses: houses,
        ascendant: houses.ascendant,
        midheaven: houses.mc,
        aspects: aspects
    };
}

/**
 * Get days in a month
 */
function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

/**
 * Calculate all aspects between planets
 * @param {object} planets 
 * @returns {array} List of aspects
 */
function calculateAllAspects(planets) {
    const aspects = [];
    const planetNames = Object.keys(planets);

    for (let i = 0; i < planetNames.length; i++) {
        for (let j = i + 1; j < planetNames.length; j++) {
            const planet1 = planetNames[i];
            const planet2 = planetNames[j];

            const aspect = ephemeris.calculateAspect(
                planets[planet1].longitude,
                planets[planet2].longitude
            );

            if (aspect) {
                aspects.push({
                    planet1: planet1,
                    planet2: planet2,
                    ...aspect,
                    description: `${formatPlanetName(planet1)} ${aspect.symbol} ${formatPlanetName(planet2)}`
                });
            }
        }
    }

    return aspects;
}

/**
 * Format planet name for display
 */
function formatPlanetName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ');
}

/**
 * Get planets in a specific house
 * @param {object} chart - Birth chart
 * @param {number} houseNumber - House number (1-12)
 * @returns {array} Planets in that house
 */
function getPlanetsInHouse(chart, houseNumber) {
    const planetsInHouse = [];
    for (const [name, planet] of Object.entries(chart.planets)) {
        if (planet.house === houseNumber) {
            planetsInHouse.push({
                name: formatPlanetName(name),
                ...planet
            });
        }
    }
    return planetsInHouse;
}

/**
 * Get aspects to a specific planet
 * @param {object} chart - Birth chart
 * @param {string} planetName - Name of the planet
 * @returns {array} Aspects involving that planet
 */
function getAspectsToplanet(chart, planetName) {
    const normalizedName = planetName.toLowerCase();
    return chart.aspects.filter(
        aspect => aspect.planet1 === normalizedName || aspect.planet2 === normalizedName
    );
}

/**
 * Get the ruling planet of a house
 * @param {object} chart - Birth chart
 * @param {number} houseNumber - House number (1-12)
 * @returns {object} Ruling planet info
 */
function getHouseRuler(chart, houseNumber) {
    const signRulers = {
        'Aries': 'mars',
        'Taurus': 'venus',
        'Gemini': 'mercury',
        'Cancer': 'moon',
        'Leo': 'sun',
        'Virgo': 'mercury',
        'Libra': 'venus',
        'Scorpio': 'pluto',
        'Sagittarius': 'jupiter',
        'Capricorn': 'saturn',
        'Aquarius': 'uranus',
        'Pisces': 'neptune'
    };

    const houseCusp = chart.houses.cusps[houseNumber];
    const rulerName = signRulers[houseCusp.sign];

    return {
        house: houseNumber,
        cuspSign: houseCusp.sign,
        rulerPlanet: rulerName,
        rulerPosition: chart.planets[rulerName]
    };
}

module.exports = {
    calculateBirthChart,
    calculateAllAspects,
    getPlanetsInHouse,
    getAspectsToplanet,
    getHouseRuler,
    formatPlanetName
};
