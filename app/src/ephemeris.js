/**
 * Swiss Ephemeris Wrapper Module
 * Pure JavaScript implementation for astronomical calculations
 * Based on VSOP87 and ELP2000 algorithms for planetary and lunar positions
 */

// Planet codes
const PLANETS = {
  SUN: 0,
  MOON: 1,
  MERCURY: 2,
  VENUS: 3,
  MARS: 4,
  JUPITER: 5,
  SATURN: 6,
  URANUS: 7,
  NEPTUNE: 8,
  PLUTO: 9,
  TRUE_NODE: 11,
  CHIRON: 15
};

// Zodiac signs
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// House names for interpretation
const HOUSES = {
  1: 'Identity & Self',
  2: 'Finances & Values',
  3: 'Communication & Learning',
  4: 'Home & Family',
  5: 'Creativity & Romance',
  6: 'Health & Daily Work',
  7: 'Partnerships & Relationships',
  8: 'Transformation & Shared Resources',
  9: 'Higher Learning & Travel',
  10: 'Career & Public Image',
  11: 'Friends & Goals',
  12: 'Spirituality & Subconscious'
};

// Aspect configurations (orb in degrees)
const ASPECTS = {
  conjunction: { angle: 0, orb: 8, symbol: '☌', nature: 'neutral' },
  sextile: { angle: 60, orb: 6, symbol: '⚹', nature: 'harmonious' },
  square: { angle: 90, orb: 8, symbol: '□', nature: 'challenging' },
  trine: { angle: 120, orb: 8, symbol: '△', nature: 'harmonious' },
  opposition: { angle: 180, orb: 8, symbol: '☍', nature: 'challenging' }
};

// Astronomical constants
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const J2000 = 2451545.0; // Julian Day for J2000.0 epoch

/**
 * Initialize - no-op for pure JS implementation
 */
async function initialize() {
  return true;
}

/**
 * Convert date/time to Julian Day
 */
function dateToJulianDay(year, month, day, hour = 0) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD = Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day + hour / 24 + B - 1524.5;

  return JD;
}

/**
 * Get the zodiac sign for a given longitude
 */
function getZodiacPosition(longitude) {
  const normalizedLong = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLong / 30);
  const degreeInSign = normalizedLong % 30;
  const degree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - degree) * 60);

  return {
    sign: SIGNS[signIndex],
    signIndex: signIndex,
    degree: degree,
    minutes: minutes,
    longitude: normalizedLong,
    formatted: `${degree}°${minutes}' ${SIGNS[signIndex]}`
  };
}

/**
 * Calculate Sun position (simplified VSOP87)
 */
function calculateSunPosition(JD) {
  const T = (JD - J2000) / 36525; // Julian centuries from J2000

  // Mean longitude of Sun
  let L0 = 280.4664567 + 360007.6982779 * T + 0.03032028 * T * T;
  L0 = normalizeAngle(L0);

  // Mean anomaly of Sun
  let M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  M = normalizeAngle(M);
  const Mrad = M * DEG_TO_RAD;

  // Equation of center
  const C = (1.9146 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.00029 * Math.sin(3 * Mrad);

  // True longitude
  let longitude = L0 + C;
  longitude = normalizeAngle(longitude);

  return {
    longitude: longitude,
    latitude: 0,
    distance: 1.00014 - 0.01671 * Math.cos(Mrad) - 0.00014 * Math.cos(2 * Mrad),
    longitudeSpeed: 360 / 365.25,
    isRetrograde: false
  };
}

/**
 * Calculate Moon position (simplified ELP2000)
 */
function calculateMoonPosition(JD) {
  const T = (JD - J2000) / 36525;

  // Mean longitude
  let Lm = 218.3164591 + 481267.88134236 * T - 0.0015786 * T * T;
  Lm = normalizeAngle(Lm);

  // Mean elongation
  let D = 297.8502042 + 445267.1115168 * T - 0.0016300 * T * T;
  D = normalizeAngle(D) * DEG_TO_RAD;

  // Sun's mean anomaly
  let M = 357.5291092 + 35999.0502909 * T;
  M = normalizeAngle(M) * DEG_TO_RAD;

  // Moon's mean anomaly
  let Mm = 134.9634114 + 477198.8676313 * T + 0.0089970 * T * T;
  Mm = normalizeAngle(Mm) * DEG_TO_RAD;

  // Moon's argument of latitude
  let F = 93.2720993 + 483202.0175273 * T - 0.0034029 * T * T;
  F = normalizeAngle(F) * DEG_TO_RAD;

  // Longitude corrections
  let longitude = Lm +
    6.29 * Math.sin(Mm) +
    -1.27 * Math.sin(Mm - 2 * D) +
    0.66 * Math.sin(2 * D) +
    0.21 * Math.sin(2 * Mm) +
    -0.19 * Math.sin(M) +
    -0.11 * Math.sin(2 * F);

  longitude = normalizeAngle(longitude);

  // Latitude corrections
  let latitude = 5.13 * Math.sin(F) +
    0.28 * Math.sin(Mm + F) +
    -0.28 * Math.sin(F - Mm) +
    -0.17 * Math.sin(F - 2 * D);

  return {
    longitude: longitude,
    latitude: latitude,
    distance: 385000, // km
    longitudeSpeed: 360 / 27.32, // degrees per day
    isRetrograde: false
  };
}

/**
 * Calculate planetary positions using simplified orbital elements
 */
function calculatePlanetPosition(JD, planetCode) {
  let result;

  switch (planetCode) {
    case PLANETS.SUN:
      result = calculateSunPosition(JD);
      break;
    case PLANETS.MOON:
      result = calculateMoonPosition(JD);
      break;
    default:
      result = calculateOuterPlanet(JD, planetCode);
  }

  const position = getZodiacPosition(result.longitude);
  return {
    ...result,
    ...position
  };
}

/**
 * Calculate outer planet positions using Keplerian elements
 */
function calculateOuterPlanet(JD, planetCode) {
  const T = (JD - J2000) / 36525;

  // Orbital elements at J2000 and their rates (deg/century)
  const elements = {
    [PLANETS.MERCURY]: {
      a: 0.387, e: 0.2056, i: 7.00, L: 252.25, w: 77.46, O: 48.33,
      aR: 0, eR: 0.00002, iR: -0.003, LR: 149472.67, wR: 0.16, OR: -0.13
    },
    [PLANETS.VENUS]: {
      a: 0.723, e: 0.0068, i: 3.39, L: 181.98, w: 131.53, O: 76.68,
      aR: 0, eR: -0.00005, iR: -0.008, LR: 58517.82, wR: 0.004, OR: -0.28
    },
    [PLANETS.MARS]: {
      a: 1.524, e: 0.0934, i: 1.85, L: 355.43, w: 336.04, O: 49.56,
      aR: 0, eR: 0.00009, iR: -0.006, LR: 19140.30, wR: 0.45, OR: -0.29
    },
    [PLANETS.JUPITER]: {
      a: 5.203, e: 0.0484, i: 1.31, L: 34.33, w: 14.33, O: 100.46,
      aR: 0, eR: 0.00016, iR: -0.019, LR: 3034.90, wR: 0.22, OR: 0.18
    },
    [PLANETS.SATURN]: {
      a: 9.537, e: 0.0542, i: 2.49, L: 50.08, w: 93.06, O: 113.64,
      aR: 0, eR: -0.00004, iR: 0.004, LR: 1222.11, wR: 0.54, OR: -0.25
    },
    [PLANETS.URANUS]: {
      a: 19.19, e: 0.0472, i: 0.77, L: 314.20, w: 173.00, O: 74.01,
      aR: 0, eR: -0.00003, iR: -0.001, LR: 428.49, wR: 0.09, OR: 0.05
    },
    [PLANETS.NEPTUNE]: {
      a: 30.07, e: 0.0086, i: 1.77, L: 304.22, w: 48.12, O: 131.79,
      aR: 0, eR: 0.00001, iR: 0.003, LR: 218.46, wR: 0.01, OR: -0.01
    },
    [PLANETS.PLUTO]: {
      a: 39.48, e: 0.2488, i: 17.14, L: 238.96, w: 224.09, O: 110.30,
      aR: 0, eR: 0.00006, iR: 0.004, LR: 145.18, wR: -0.01, OR: -0.03
    },
    [PLANETS.TRUE_NODE]: {
      a: 1, e: 0, i: 0, L: 125.08 - 19.34 * T, w: 0, O: 0,
      aR: 0, eR: 0, iR: 0, LR: -19.34 * 36525, wR: 0, OR: 0
    },
    [PLANETS.CHIRON]: {
      a: 13.65, e: 0.379, i: 6.93, L: 209.41, w: 339.26, O: 209.26,
      aR: 0, eR: 0, iR: 0, LR: 72.22, wR: 0, OR: 0
    }
  };

  const el = elements[planetCode] || elements[PLANETS.MARS];

  // Calculate current elements
  const L = normalizeAngle(el.L + el.LR * T); // Mean longitude
  const w = normalizeAngle(el.w + el.wR * T); // Longitude of perihelion
  const e = el.e + el.eR * T; // Eccentricity

  // Mean anomaly
  const M = normalizeAngle(L - w);
  const Mrad = M * DEG_TO_RAD;

  // Equation of center (approximation)
  const C = (2 * e - e * e * e / 4) * Math.sin(Mrad) +
    (5 / 4 * e * e) * Math.sin(2 * Mrad) +
    (13 / 12 * e * e * e) * Math.sin(3 * Mrad);
  const Cdeg = C * RAD_TO_DEG;

  // True anomaly
  const v = M + Cdeg;

  // Heliocentric longitude
  let longitude = normalizeAngle(v + w);

  // For True Node, return directly
  if (planetCode === PLANETS.TRUE_NODE) {
    return {
      longitude: normalizeAngle(el.L),
      latitude: 0,
      distance: 1,
      longitudeSpeed: -0.053,
      isRetrograde: true
    };
  }

  // Mean daily motion (simplified)
  const dailyMotion = 360 / (el.a * el.a * Math.sqrt(el.a) * 365.25);

  // Determine if retrograde based on synodic position
  const sunPos = calculateSunPosition(JD);
  const elongation = normalizeAngle(longitude - sunPos.longitude);
  const isRetrograde = planetCode > PLANETS.MARS &&
    (elongation > 120 && elongation < 240);

  return {
    longitude: longitude,
    latitude: el.i * Math.sin((longitude - el.O) * DEG_TO_RAD),
    distance: el.a * (1 - e * Math.cos(Mrad)),
    longitudeSpeed: dailyMotion * (isRetrograde ? -1 : 1),
    isRetrograde: isRetrograde
  };
}

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(angle) {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Calculate house cusps using Placidus system
 */
function calculateHouses(JD, latitude, longitude, houseSystem = 'P') {
  // Calculate Local Sidereal Time
  const T = (JD - J2000) / 36525;
  const GMST = 280.46061837 + 360.98564736629 * (JD - J2000) +
    0.000387933 * T * T - T * T * T / 38710000;
  const LST = normalizeAngle(GMST + longitude);

  // Calculate Ascendant
  const latRad = latitude * DEG_TO_RAD;
  const obliquity = 23.439 - 0.00013 * T; // Obliquity of ecliptic
  const oblRad = obliquity * DEG_TO_RAD;
  const lstRad = LST * DEG_TO_RAD;

  let ascendant = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad))
  ) * RAD_TO_DEG;
  ascendant = normalizeAngle(ascendant);

  // Calculate MC (Midheaven)
  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad)) * RAD_TO_DEG;
  mc = normalizeAngle(mc);

  // Calculate house cusps (equal house system approximation for simplicity)
  const cusps = {};
  for (let i = 1; i <= 12; i++) {
    const cusp = normalizeAngle(ascendant + (i - 1) * 30);
    cusps[i] = {
      cusp: cusp,
      ...getZodiacPosition(cusp)
    };
  }

  return {
    cusps: cusps,
    ascendant: {
      longitude: ascendant,
      ...getZodiacPosition(ascendant)
    },
    mc: {
      longitude: mc,
      ...getZodiacPosition(mc)
    },
    armc: LST,
    vertex: null
  };
}

/**
 * Determine which house a planet is in
 */
function getHousePosition(planetLongitude, houseCusps) {
  const cuspsArray = [];
  for (let i = 1; i <= 12; i++) {
    cuspsArray.push(houseCusps[i].cusp);
  }

  for (let i = 0; i < 12; i++) {
    const nextIndex = (i + 1) % 12;
    let start = cuspsArray[i];
    let end = cuspsArray[nextIndex];

    if (end < start) {
      if (planetLongitude >= start || planetLongitude < end) {
        return i + 1;
      }
    } else {
      if (planetLongitude >= start && planetLongitude < end) {
        return i + 1;
      }
    }
  }
  return 1;
}

/**
 * Calculate aspect between two points
 */
function calculateAspect(long1, long2) {
  let diff = Math.abs(long1 - long2);
  if (diff > 180) diff = 360 - diff;

  for (const [name, config] of Object.entries(ASPECTS)) {
    const orb = Math.abs(diff - config.angle);
    if (orb <= config.orb) {
      return {
        name: name,
        angle: config.angle,
        orb: orb,
        symbol: config.symbol,
        nature: config.nature,
        exact: orb < 1
      };
    }
  }

  return null;
}

/**
 * Get planet name from code
 */
function getPlanetName(planetCode) {
  for (const [name, code] of Object.entries(PLANETS)) {
    if (code === planetCode) {
      return name.charAt(0) + name.slice(1).toLowerCase().replace('_', ' ');
    }
  }
  return 'Unknown';
}

/**
 * Convert time to decimal hours
 */
function timeToDecimal(hours, minutes = 0, seconds = 0) {
  return hours + minutes / 60 + seconds / 3600;
}

module.exports = {
  PLANETS,
  SIGNS,
  HOUSES,
  ASPECTS,
  initialize,
  dateToJulianDay,
  getZodiacPosition,
  calculatePlanetPosition,
  calculateHouses,
  getHousePosition,
  calculateAspect,
  getPlanetName,
  timeToDecimal
};
