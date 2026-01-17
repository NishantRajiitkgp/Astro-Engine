/**
 * Detailed Narrative Report Generator
 * Generates comprehensive, magazine-style astrological reports
 */

const relationshipTexts = require('./detailed-interpretations/relationships-texts.json');
const financialTexts = require('./detailed-interpretations/financial-texts.json');
const healthTexts = require('./detailed-interpretations/health-texts.json');
const careerTexts = require('./detailed-interpretations/career-texts.json');

const { calculateBirthChart } = require('./birthChart');
const { calculate12MonthTransits, analyzeTransitsToNatal, getTransitHousePlacements } = require('./transits');
const { SIGNS } = require('./ephemeris');

/**
 * Generate a detailed narrative report
 * @param {object} birthData - User's birth information  
 * @param {string} category - 'relationships', 'financial', 'health', or 'career'
 * @returns {Promise<object>} Detailed narrative report
 */
async function generateDetailedReport(birthData, category = 'relationships') {
    const natalChart = await calculateBirthChart(birthData);

    const now = new Date();
    const startYear = now.getFullYear();
    const startMonth = now.getMonth() + 1;

    const monthlyTransits = await calculate12MonthTransits(startYear, startMonth);

    const textsDb = getTextsDatabase(category);
    const report = {
        title: getCategoryTitle(category, birthData.name),
        generatedFor: birthData.name,
        birthDate: `${birthData.day}/${birthData.month}/${birthData.year}`,
        birthPlace: birthData.placeName,
        generatedAt: new Date().toISOString(),

        // Report sections
        introduction: generateIntroduction(natalChart, category, textsDb),
        lifetimeAnalysis: generateLifetimeAnalysis(natalChart, category, textsDb),
        yearlyOverview: generateYearlyOverview(natalChart, monthlyTransits, category, textsDb),
        monthlyForecasts: [],
        conclusion: generateConclusion(category)
    };

    // Generate detailed monthly forecasts
    for (const monthData of monthlyTransits) {
        const transitAspects = analyzeTransitsToNatal(natalChart, monthData.transitsMid);
        const housePlacements = getTransitHousePlacements(natalChart, monthData.transitsMid);

        const monthlyForecast = generateMonthlyForecast(
            natalChart,
            monthData,
            transitAspects,
            housePlacements,
            category,
            textsDb
        );

        report.monthlyForecasts.push(monthlyForecast);
    }

    return report;
}

/**
 * Get the appropriate texts database for a category
 */
function getTextsDatabase(category) {
    switch (category) {
        case 'relationships': return relationshipTexts;
        case 'financial': return financialTexts;
        case 'health': return healthTexts;
        case 'career': return careerTexts;
        default: return relationshipTexts;
    }
}

/**
 * Get category-specific title
 */
function getCategoryTitle(category, name) {
    const titles = {
        relationships: `Love & Relationship Forecast for ${name}`,
        financial: `Financial Prosperity Forecast for ${name}`,
        health: `Health & Vitality Forecast for ${name}`,
        career: `Career & Achievement Forecast for ${name}`
    };
    return titles[category] || `Astrological Forecast for ${name}`;
}

/**
 * Generate personalized introduction
 */
function generateIntroduction(chart, category, textsDb) {
    const keyPlanet = getKeyPlanet(category);
    const keyHouse = getKeyHouse(category);
    const planetSign = chart.planets[keyPlanet]?.sign || 'Aries';
    const houseSign = chart.houses.cusps[keyHouse]?.sign || 'Aries';

    let intro = textsDb.introduction.template
        .replace('{venusSign}', chart.planets.venus?.sign || 'Libra')
        .replace('{jupiterSign}', chart.planets.jupiter?.sign || 'Sagittarius')
        .replace('{marsSign}', chart.planets.mars?.sign || 'Aries')
        .replace('{saturnSign}', chart.planets.saturn?.sign || 'Capricorn')
        .replace('{secondHouseSign}', chart.houses.cusps[2]?.sign || 'Taurus')
        .replace('{sixthHouseSign}', chart.houses.cusps[6]?.sign || 'Virgo')
        .replace('{seventhHouseSign}', chart.houses.cusps[7]?.sign || 'Libra')
        .replace('{tenthHouseSign}', chart.houses.cusps[10]?.sign || 'Capricorn');

    return intro;
}

/**
 * Generate lifetime analysis based on natal chart
 */
function generateLifetimeAnalysis(chart, category, textsDb) {
    const sections = [];

    // Get key planet interpretation
    const keyPlanet = getKeyPlanet(category);
    const planetSign = chart.planets[keyPlanet]?.sign || 'Aries';
    const planetData = getPlanetInSignText(keyPlanet, planetSign, textsDb);

    if (planetData) {
        sections.push({
            title: `Your ${capitalizeFirst(keyPlanet)} in ${planetSign}`,
            content: planetData.natal,
            strength: planetData.strength,
            challenge: planetData.challenge
        });
    }

    // Add Rising Sign context for relationships
    if (category === 'relationships') {
        sections.push({
            title: `Your Rising Sign: ${chart.ascendant.sign}`,
            content: `With ${chart.ascendant.sign} rising, you present yourself to the world—and to potential partners—with the qualities of this sign. First impressions in romantic situations carry the flavor of ${chart.ascendant.sign}, shaping how others initially perceive you and how you approach new connections.`
        });
    }

    // Add Sun/Moon for all categories
    sections.push({
        title: `Your Sun in ${chart.planets.sun.sign} & Moon in ${chart.planets.moon.sign}`,
        content: generateSunMoonSection(chart, category)
    });

    return {
        title: 'Your Lifetime Patterns in ' + getCategoryLabel(category),
        description: `These patterns are part of your birth chart and influence your ${getCategoryLabel(category).toLowerCase()} throughout your entire life.`,
        sections: sections
    };
}

/**
 * Generate yearly overview
 */
function generateYearlyOverview(chart, monthlyTransits, category, textsDb) {
    const keyPlanets = getKeyTransitPlanets(category);
    const overviewParagraphs = [];

    overviewParagraphs.push(`The year ahead brings important developments to your ${getCategoryLabel(category).toLowerCase()} as several major planetary cycles unfold. Understanding these larger patterns helps you work with cosmic timing rather than against it.`);

    // Check for major Jupiter transits
    const jupiterHouse = getAverageHouse(monthlyTransits, 'jupiter', chart);
    if (jupiterHouse) {
        overviewParagraphs.push(`Jupiter, the planet of expansion and opportunity, spends most of this year in your ${getOrdinal(jupiterHouse)} house of ${getHouseTheme(jupiterHouse)}. This brings growth potential to ${getHouseImplication(jupiterHouse, category)}.`);
    }

    // Check for Saturn transits  
    const saturnHouse = getAverageHouse(monthlyTransits, 'saturn', chart);
    if (saturnHouse) {
        overviewParagraphs.push(`Saturn, the planet of discipline and maturation, continues through your ${getOrdinal(saturnHouse)} house, bringing lessons and responsibility to ${getHouseTheme(saturnHouse).toLowerCase()}. This long-term transit (lasting about 2.5 years) asks for serious commitment and realistic assessment in related areas of life.`);
    }

    return {
        title: 'Your Year at a Glance',
        paragraphs: overviewParagraphs
    };
}

/**
 * Generate detailed monthly forecast
 */
function generateMonthlyForecast(chart, monthData, transitAspects, housePlacements, category, textsDb) {
    const forecast = {
        month: monthData.monthName,
        year: monthData.year,
        monthIndex: monthData.monthIndex,
        sections: []
    };

    // Monthly overview section
    const overviewType = getMonthType(transitAspects, category);
    const template = textsDb.monthly_templates[overviewType] || textsDb.monthly_templates.mixed_month;

    forecast.sections.push({
        title: 'Monthly Overview',
        content: textsDb.monthly_templates.introduction
            .replace('{month}', monthData.monthName)
            .replace('{year}', monthData.year) + '\n\n' + template
    });

    // Key transits section - detailed paragraphs for significant transits
    const keyTransits = getKeyTransitsForCategory(transitAspects, housePlacements, category);

    if (keyTransits.length > 0) {
        forecast.sections.push({
            title: 'Key Planetary Movements',
            content: generateTransitNarratives(keyTransits, textsDb)
        });
    }

    // Opportunities section
    const opportunities = extractOpportunities(transitAspects, housePlacements, category);
    if (opportunities.length > 0) {
        forecast.sections.push({
            title: 'Opportunities This Month',
            content: opportunities.join('\n\n')
        });
    }

    // Challenges section
    const challenges = extractChallenges(transitAspects, housePlacements, category);
    if (challenges.length > 0) {
        forecast.sections.push({
            title: 'Navigating Challenges',
            content: challenges.join('\n\n')
        });
    }

    // Guidance section
    forecast.sections.push({
        title: 'Guidance for This Month',
        content: generateMonthlyGuidance(transitAspects, housePlacements, category)
    });

    return forecast;
}

/**
 * Generate transit narratives from the database
 */
function generateTransitNarratives(transits, textsDb) {
    const narratives = [];

    for (const transit of transits.slice(0, 3)) { // Top 3 most significant
        const key = `${transit.transitPlanet}_${transit.aspectName || 'conjunct'}_${transit.natalPlanet}`;
        const dbEntry = textsDb.transit_aspects?.[key];

        if (dbEntry) {
            narratives.push(`**${dbEntry.title}** (${dbEntry.duration})\n\n${dbEntry.narrative}`);
        } else {
            // Generate dynamic narrative if not in database
            narratives.push(generateDynamicTransitNarrative(transit));
        }
    }

    return narratives.join('\n\n---\n\n');
}

/**
 * Generate dynamic transit narrative when not in database
 */
function generateDynamicTransitNarrative(transit) {
    const transitPlanetName = capitalizeFirst(transit.transitPlanet);
    const natalPlanetName = capitalizeFirst(transit.natalPlanet);
    const aspectName = transit.name || 'conjunction';
    const nature = transit.nature || 'neutral';

    let narrative = `**Transiting ${transitPlanetName} ${aspectName} Natal ${natalPlanetName}**\n\n`;

    if (nature === 'harmonious') {
        narrative += `This harmonious aspect brings supportive energy as ${transitPlanetName}'s influence flows smoothly to your natal ${natalPlanetName}. `;
        narrative += `Opportunities related to ${getPlanetTheme(transit.transitPlanet)} align favorably with your ${getPlanetTheme(transit.natalPlanet)}. `;
        narrative += `This is a time to take advantage of this positive alignment by actively pursuing opportunities in related areas.`;
    } else if (nature === 'challenging') {
        narrative += `This challenging aspect creates tension between ${transitPlanetName}'s energy and your natal ${natalPlanetName}. `;
        narrative += `You may experience friction or obstacles related to ${getPlanetTheme(transit.transitPlanet)} that require adjustment in how you express ${getPlanetTheme(transit.natalPlanet)}. `;
        narrative += `Rather than resisting, work with this energy by embracing necessary changes and learning from any difficulties that arise.`;
    } else {
        narrative += `As ${transitPlanetName} aligns with your natal ${natalPlanetName}, themes of ${getPlanetTheme(transit.transitPlanet)} become intensified in your ${getPlanetTheme(transit.natalPlanet)} expression. `;
        narrative += `This is a significant period for integrating these energies consciously into your life.`;
    }

    return narrative;
}

/**
 * Extract opportunities based on transits
 */
function extractOpportunities(transitAspects, housePlacements, category) {
    const opportunities = [];
    const keyPlanets = getKeyTransitPlanets(category);

    for (const aspect of transitAspects) {
        if (aspect.nature === 'harmonious' && keyPlanets.includes(aspect.transitPlanet)) {
            opportunities.push(getOpportunityText(aspect, category));
        }
    }

    // Check favorable house placements
    for (const [planet, data] of Object.entries(housePlacements)) {
        const house = data.house;
        if (isFavorableHouse(house, category) && keyPlanets.includes(planet)) {
            opportunities.push(`${capitalizeFirst(planet)} in your ${getOrdinal(house)} house supports ${getHouseOpportunity(house, category)}.`);
        }
    }

    return opportunities.slice(0, 4); // Top 4 opportunities
}

/**
 * Extract challenges based on transits
 */
function extractChallenges(transitAspects, housePlacements, category) {
    const challenges = [];
    const keyPlanets = getKeyTransitPlanets(category);

    for (const aspect of transitAspects) {
        if (aspect.nature === 'challenging' && keyPlanets.includes(aspect.transitPlanet)) {
            challenges.push(getChallengeText(aspect, category));
        }
    }

    return challenges.slice(0, 3); // Top 3 challenges
}

/**
 * Generate monthly guidance
 */
function generateMonthlyGuidance(transitAspects, housePlacements, category) {
    const harmonious = transitAspects.filter(a => a.nature === 'harmonious').length;
    const challenging = transitAspects.filter(a => a.nature === 'challenging').length;

    if (harmonious > challenging + 2) {
        return getPositiveGuidance(category);
    } else if (challenging > harmonious + 2) {
        return getChallengingGuidance(category);
    } else {
        return getBalancedGuidance(category);
    }
}

/**
 * Generate conclusion
 */
function generateConclusion(category) {
    const conclusions = {
        relationships: "Remember that astrology shows tendencies and opportunities, not fixed fate. Your choices, growth, and willingness to engage authentically with others are the true determinants of your relationship happiness. Use this cosmic guidance to work with the energies rather than against them, timing important relationship moves when stars are favorable and developing patience when they're not. May your path to love be blessed with the wisdom that comes from knowing both yourself and the patterns of the cosmos.",
        financial: "Remember that prosperity is created through the intersection of cosmic timing, personal effort, and wise stewardship. This astrological guidance illuminates when doors are more likely to open and when caution serves you best. Combined with practical financial wisdom and your own hard work, these insights can help you build lasting abundance. May your material path be blessed with both opportunity and wisdom.",
        health: "Remember that astrology illuminates tendencies and timing, not fixed destiny. Your daily choices, self-care practices, and relationship with your body are the true foundations of health. Use these cosmic insights to understand your constitution's unique needs and to time health initiatives wisely. May your physical journey be blessed with vitality, awareness, and the wisdom to care for the miraculous body you inhabit.",
        career: "Remember that professional success emerges from the meeting of cosmic timing, personal effort, and authentic purpose. Astrology can illuminate when conditions favor advancement and when patience serves better than pushing, but your daily work, skill development, and integrity remain the true foundations of achievement. May your professional journey be blessed with both opportunity and the wisdom to build something of lasting value."
    };

    return conclusions[category] || conclusions.relationships;
}

// Helper functions
function getKeyPlanet(category) {
    const map = { relationships: 'venus', financial: 'jupiter', health: 'mars', career: 'saturn' };
    return map[category] || 'venus';
}

function getKeyHouse(category) {
    const map = { relationships: 7, financial: 2, health: 6, career: 10 };
    return map[category] || 7;
}

function getKeyTransitPlanets(category) {
    const map = {
        relationships: ['venus', 'mars', 'jupiter', 'saturn'],
        financial: ['jupiter', 'saturn', 'venus', 'pluto'],
        health: ['mars', 'saturn', 'jupiter', 'sun'],
        career: ['saturn', 'jupiter', 'sun', 'pluto']
    };
    return map[category] || ['venus', 'mars', 'jupiter', 'saturn'];
}

function getCategoryLabel(category) {
    const labels = { relationships: 'Love & Relationships', financial: 'Financial Life', health: 'Health & Vitality', career: 'Career & Achievement' };
    return labels[category] || category;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace('_', ' ');
}

function getOrdinal(n) {
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    return ordinals[n] || n + 'th';
}

function getHouseTheme(house) {
    const themes = {
        1: 'Self & Identity', 2: 'Money & Values', 3: 'Communication',
        4: 'Home & Family', 5: 'Creativity & Romance', 6: 'Health & Work',
        7: 'Partnerships', 8: 'Transformation', 9: 'Higher Learning',
        10: 'Career & Reputation', 11: 'Friends & Goals', 12: 'Spirituality'
    };
    return themes[house] || 'Life';
}

function getHouseImplication(house, category) {
    // Returns what this house means for the specific category
    const implications = {
        relationships: {
            1: 'your personal magnetism and approach to love',
            5: 'romance, dating, and creative self-expression',
            7: 'committed partnerships and marriage',
            8: 'intimate bonding and shared resources',
            11: 'friendship and social connections'
        },
        financial: {
            2: 'income, earning capacity, and personal resources',
            6: 'work environment and daily earnings',
            8: 'investments, shared finances, and inheritance',
            10: 'career advancement and professional income',
            11: 'income from networking and group ventures'
        }
    };
    return implications[category]?.[house] || 'related areas of life';
}

function getAverageHouse(monthlyTransits, planet, chart) {
    if (!monthlyTransits[0]?.transitsMid?.planets?.[planet]) return null;
    const planetLong = monthlyTransits[0].transitsMid.planets[planet].longitude;
    // Simplified - return house for first month
    const ephemeris = require('./ephemeris');
    return ephemeris.getHousePosition(planetLong, chart.houses.cusps);
}

function getMonthType(transitAspects, category) {
    const keyPlanets = getKeyTransitPlanets(category);
    const relevantAspects = transitAspects.filter(a => keyPlanets.includes(a.transitPlanet));

    const harmonious = relevantAspects.filter(a => a.nature === 'harmonious').length;
    const challenging = relevantAspects.filter(a => a.nature === 'challenging').length;

    if (harmonious > challenging + 1) return 'favorable_month';
    if (challenging > harmonious + 1) return 'challenging_month';
    return 'mixed_month';
}

function getKeyTransitsForCategory(transitAspects, housePlacements, category) {
    const keyPlanets = getKeyTransitPlanets(category);
    return transitAspects
        .filter(a => keyPlanets.includes(a.transitPlanet))
        .sort((a, b) => a.orb - b.orb)
        .slice(0, 5);
}

function getPlanetInSignText(planet, sign, textsDb) {
    const planetKey = `${planet}_in_signs`;
    if (textsDb[planetKey] && textsDb[planetKey][sign]) {
        return textsDb[planetKey][sign];
    }
    // Try alternative keys
    const altKeys = ['venus_in_signs', 'jupiter_in_signs', 'mars_in_signs', 'saturn_in_signs'];
    for (const key of altKeys) {
        if (textsDb[key] && textsDb[key][sign]) {
            return textsDb[key][sign];
        }
    }
    return null;
}

function generateSunMoonSection(chart, category) {
    const sunSign = chart.planets.sun.sign;
    const moonSign = chart.planets.moon.sign;

    return `Your Sun in ${sunSign} represents your core identity and life purpose, while your Moon in ${moonSign} reveals your emotional needs and instinctive responses. In ${getCategoryLabel(category).toLowerCase()}, your ${sunSign} Sun drives you to express ${getSunDrive(sunSign)}, while your ${moonSign} Moon needs ${getMoonNeed(moonSign)} to feel truly fulfilled.`;
}

function getSunDrive(sign) {
    const drives = {
        Aries: 'initiative and independence',
        Taurus: 'stability and sensual satisfaction',
        Gemini: 'variety and intellectual stimulation',
        Cancer: 'emotional security and nurturing',
        Leo: 'recognition and creative self-expression',
        Virgo: 'perfection and practical service',
        Libra: 'harmony and partnership',
        Scorpio: 'depth and transformative experiences',
        Sagittarius: 'freedom and meaningful adventure',
        Capricorn: 'achievement and lasting success',
        Aquarius: 'innovation and authentic expression',
        Pisces: 'transcendence and spiritual connection'
    };
    return drives[sign] || 'authentic self-expression';
}

function getMoonNeed(sign) {
    const needs = {
        Aries: 'excitement and independence',
        Taurus: 'comfort and predictability',
        Gemini: 'mental stimulation and variety',
        Cancer: 'emotional safety and belonging',
        Leo: 'appreciation and warmth',
        Virgo: 'order and being helpful',
        Libra: 'harmony and companionship',
        Scorpio: 'emotional intensity and trust',
        Sagittarius: 'freedom and optimism',
        Capricorn: 'respect and structure',
        Aquarius: 'space and acceptance of uniqueness',
        Pisces: 'spiritual attunement and compassion'
    };
    return needs[sign] || 'emotional fulfillment';
}

function getPlanetTheme(planet) {
    const themes = {
        sun: 'identity and vitality',
        moon: 'emotions and nurturing',
        mercury: 'communication and thinking',
        venus: 'love and values',
        mars: 'action and energy',
        jupiter: 'expansion and opportunity',
        saturn: 'responsibility and structure',
        uranus: 'change and innovation',
        neptune: 'spirituality and imagination',
        pluto: 'transformation and power'
    };
    return themes[planet] || 'life expression';
}

function getOpportunityText(aspect, category) {
    return `The ${aspect.name} between transiting ${capitalizeFirst(aspect.transitPlanet)} and your natal ${capitalizeFirst(aspect.natalPlanet)} opens favorable channels for ${getPlanetTheme(aspect.transitPlanet)} to enhance your ${getPlanetTheme(aspect.natalPlanet)}.`;
}

function getChallengeText(aspect, category) {
    return `The ${aspect.name} from transiting ${capitalizeFirst(aspect.transitPlanet)} to your natal ${capitalizeFirst(aspect.natalPlanet)} creates tension requiring conscious navigation. ${capitalizeFirst(aspect.transitPlanet)}'s pressure on ${capitalizeFirst(aspect.natalPlanet)} asks for growth and adjustment in related areas.`;
}

function isFavorableHouse(house, category) {
    const favorable = {
        relationships: [5, 7, 11],
        financial: [2, 8, 10],
        health: [1, 6],
        career: [10, 6, 2]
    };
    return favorable[category]?.includes(house);
}

function getHouseOpportunity(house, category) {
    return `growth in ${getHouseTheme(house).toLowerCase()}`;
}

function getPositiveGuidance(category) {
    const guidance = {
        relationships: "This month's supportive energies invite you to reach out, connect, and deepen bonds. Initiate conversations you've been postponing. Express appreciation to those you love. If seeking connection, put yourself in social situations where meaningful meetings are possible. The cosmic climate is favorable—your job is to show up and engage.",
        financial: "Take advantage of this month's supportive financial energies. Pursue opportunities, ask for what you're worth, and invest in your future. Your financial instincts are sound, and efforts made now are likely to yield positive returns. Fortune favors action during favorable periods—don't let good conditions pass without capitalizing on them.",
        health: "This month's vitality-supporting aspects favor active health improvement. Start that exercise program, establish new healthy habits, or tackle health goals requiring motivation. Your body responds well to positive efforts now. What you build during favorable periods sustains you through more challenging times.",
        career: "Pursue professional advancement actively this month. Apply for positions, pitch ideas, seek recognition, and put yourself forward for opportunities. Authority figures are inclined to view you favorably. The cosmic climate supports career success—match this support with bold, strategic action."
    };
    return guidance[category] || guidance.relationships;
}

function getChallengingGuidance(category) {
    const guidance = {
        relationships: "Navigate this month's relationship challenges with patience and self-awareness. Avoid major relationship decisions during the most intense periods. Focus on communication, understanding, and personal growth rather than expecting others to change. Difficulties now, properly handled, ultimately strengthen worthy bonds and reveal what isn't serving you.",
        financial: "Exercise caution in financial matters this month. Avoid major risks, speculative ventures, or significant purchases during challenging aspects. Focus instead on analysis, planning, and addressing weaknesses in your financial structure. The restrictions you experience now ultimately redirect you toward more sustainable prosperity.",
        health: "Listen to your body carefully this month. This is not a time for pushing hard or starting aggressive new regimens. Instead, focus on rest, recovery, and addressing any warning signs. Gentle self-care and stress reduction serve you better than intense effort. What your body needs now is respect for its limits.",
        career: "Navigate professional challenges with discipline and patience this month. Avoid impulsive career moves or conflicts with authority. Focus on solid work and demonstrating reliability. Difficulties now, properly handled, build professional strength. Sometimes the path to advancement requires proving yourself through adversity."
    };
    return guidance[category] || guidance.relationships;
}

function getBalancedGuidance(category) {
    const guidance = {
        relationships: "This month offers both opportunities and challenges in relationships. Stay flexible, responding appropriately to each situation's unique energy. Some conversations will flow easily while others require more care. Trust your relational instincts and maintain both openness and healthy boundaries.",
        financial: "Balance opportunity pursuit with prudent caution this month. Some financial initiatives are well-supported while others require more careful handling. Pay attention to timing within the month, advancing during favorable windows and consolidating during challenging ones. Both optimism and realism serve your prosperity.",
        health: "This month calls for balanced attention to both activity and rest. Some periods favor physical effort while others require gentler pacing. Listen to your body's day-to-day signals and adjust accordingly. Flexibility in your health approach serves you better than rigid routines this month.",
        career: "Navigate this month's mixed professional landscape with adaptability. Some opportunities deserve active pursuit while others require patience. Read the energy of each situation and adjust your approach accordingly. Both ambition and strategic waiting have their place this month."
    };
    return guidance[category] || guidance.relationships;
}

module.exports = {
    generateDetailedReport
};
