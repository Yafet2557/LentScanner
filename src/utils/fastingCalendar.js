import { getPascha } from './lentDates';

// Fasting levels (strictest to most relaxed)
export const FAST_LEVELS = {
  strict: {
    key: 'strict',
    label: 'Strict Fast',
    description: 'No meat, dairy, eggs, fish, oil, or wine',
    icon: 'leaf-outline',
    color: '#AB47BC', // purple
  },
  oilWine: {
    key: 'oilWine',
    label: 'Oil & Wine Allowed',
    description: 'No meat, dairy, eggs, or fish',
    icon: 'water-outline',
    color: '#7E57C2', // lighter purple
  },
  fishAllowed: {
    key: 'fishAllowed',
    label: 'Fish Allowed',
    description: 'No meat, dairy, or eggs',
    icon: 'fish-outline',
    color: '#42A5F5', // blue
  },
  noFast: {
    key: 'noFast',
    label: 'No Fast Today',
    description: 'All foods permitted',
    icon: 'sunny-outline',
    color: '#66BB6A', // green
  },
};

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isDateInRange(date, start, end) {
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

// Get all fasting periods for a given year
function getFastingPeriods(year) {
  const pascha = getPascha(year);
  const prevPascha = getPascha(year - 1);
  const nextPascha = getPascha(year + 1);

  // Pentecost = Pascha + 49 days
  const pentecost = addDays(pascha, 49);
  const allSaintsMonday = addDays(pentecost, 8);

  const prevPentecost = addDays(prevPascha, 49);
  const prevAllSaintsMonday = addDays(prevPentecost, 8);

  return {
    // Great Lent: Clean Monday (48 days before Pascha) to Holy Saturday
    greatLent: {
      name: 'Great Lent',
      start: addDays(pascha, -48),
      end: addDays(pascha, -1),
      icon: 'cross-outline',
    },
    // Apostles' Fast: Monday after All Saints to June 28
    // Could span year boundary if Pascha is very late
    apostlesFast: {
      name: "Apostles' Fast",
      start: allSaintsMonday,
      end: new Date(year, 5, 28), // June 28
      icon: 'people-outline',
    },
    // Also check if previous year's Apostles' fast extends into this year
    prevApostlesFast: {
      name: "Apostles' Fast",
      start: prevAllSaintsMonday,
      end: new Date(year - 1, 5, 28),
      icon: 'people-outline',
    },
    // Dormition Fast: August 1-14
    dormitionFast: {
      name: 'Dormition Fast',
      start: new Date(year, 7, 1),
      end: new Date(year, 7, 14),
      icon: 'flower-outline',
    },
    // Nativity Fast: November 15 - December 24
    nativityFast: {
      name: 'Nativity Fast',
      start: new Date(year, 10, 15),
      end: new Date(year, 11, 24),
      icon: 'star-outline',
    },
    // Previous year's Nativity fast may extend into this year
    prevNativityFast: {
      name: 'Nativity Fast',
      start: new Date(year - 1, 10, 15),
      end: new Date(year - 1, 11, 24),
      icon: 'star-outline',
    },
  };
}

// Fast-free weeks (no fasting even on Wed/Fri)
function getFastFreeWeeks(year) {
  const pascha = getPascha(year);
  const prevPascha = getPascha(year - 1);

  return [
    // Bright Week (week after Pascha)
    { start: pascha, end: addDays(pascha, 6), name: 'Bright Week' },
    // Previous year's Bright Week in case it falls in Jan
    { start: prevPascha, end: addDays(prevPascha, 6), name: 'Bright Week' },
    // Trinity Week (week after Pentecost)
    { start: addDays(pascha, 49), end: addDays(pascha, 55), name: 'Trinity Week' },
    // Christmastide (Dec 25 - Jan 4)
    { start: new Date(year - 1, 11, 25), end: new Date(year, 0, 4), name: 'Christmastide' },
    { start: new Date(year, 11, 25), end: new Date(year + 1, 0, 4), name: 'Christmastide' },
    // Week of Publican and Pharisee (3 weeks before Great Lent start)
    {
      start: addDays(pascha, -69),
      end: addDays(pascha, -63),
      name: 'Week of the Publican & Pharisee',
    },
  ];
}

// Special single fast days
function getSingleFastDays(year) {
  return [
    { date: new Date(year, 0, 5), name: 'Theophany Eve', level: 'strict' },
    { date: new Date(year, 7, 29), name: 'Beheading of St. John', level: 'strict' },
    { date: new Date(year, 8, 14), name: 'Elevation of the Cross', level: 'strict' },
  ];
}

// Special relaxed days within fasting periods
function getRelaxedDays(year) {
  const pascha = getPascha(year);
  return [
    // Annunciation (March 25) - fish allowed during Lent
    { date: new Date(year, 2, 25), name: 'Annunciation', level: 'fishAllowed' },
    // Palm Sunday - fish allowed
    { date: addDays(pascha, -7), name: 'Palm Sunday', level: 'fishAllowed' },
    // Lazarus Saturday - fish allowed
    { date: addDays(pascha, -8), name: 'Lazarus Saturday', level: 'fishAllowed' },
  ];
}

// Cheesefare week (last week before Lent - no meat, but dairy/eggs/fish ok)
function getCheesfareWeek(year) {
  const pascha = getPascha(year);
  return {
    start: addDays(pascha, -55),
    end: addDays(pascha, -49),
    name: 'Cheesefare Week',
  };
}

/**
 * Get today's fasting rule.
 * Returns { level, label, description, icon, color, reason, period }
 */
export function getTodaysFastingRule(date = new Date()) {
  const year = date.getFullYear();
  const dayOfWeek = date.getDay(); // 0=Sun, 3=Wed, 5=Fri

  const periods = getFastingPeriods(year);
  const fastFreeWeeks = getFastFreeWeeks(year);
  const singleDays = getSingleFastDays(year);
  const relaxedDays = getRelaxedDays(year);
  const cheesefare = getCheesfareWeek(year);

  // 1. Check fast-free weeks first
  for (const week of fastFreeWeeks) {
    if (isDateInRange(date, week.start, week.end)) {
      return {
        ...FAST_LEVELS.noFast,
        reason: week.name,
        period: null,
      };
    }
  }

  // 2. Check special relaxed days (Annunciation, Palm Sunday, etc.)
  for (const rd of relaxedDays) {
    if (sameDay(date, rd.date)) {
      return {
        ...FAST_LEVELS[rd.level],
        reason: rd.name,
        period: 'Great Lent',
      };
    }
  }

  // 3. Check if in Great Lent
  if (isDateInRange(date, periods.greatLent.start, periods.greatLent.end)) {
    // Holy Week (last week) is strict every day
    const holySaturday = periods.greatLent.end;
    const holyMonday = addDays(holySaturday, -5);
    if (isDateInRange(date, holyMonday, holySaturday)) {
      return {
        ...FAST_LEVELS.strict,
        reason: 'Holy Week',
        period: 'Great Lent',
      };
    }

    // Sat/Sun in Lent: oil and wine
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        ...FAST_LEVELS.oilWine,
        reason: 'Great Lent (weekend)',
        period: 'Great Lent',
      };
    }

    // Weekdays: strict
    return {
      ...FAST_LEVELS.strict,
      reason: 'Great Lent',
      period: 'Great Lent',
    };
  }

  // 4. Check Cheesefare week (no meat, but dairy/fish ok)
  if (isDateInRange(date, cheesefare.start, cheesefare.end)) {
    return {
      ...FAST_LEVELS.fishAllowed,
      label: 'No Meat',
      description: 'Dairy, eggs, and fish are permitted',
      reason: 'Cheesefare Week',
      period: null,
    };
  }

  // 5. Check Nativity Fast (current or previous year's)
  const nativityPeriods = [periods.nativityFast, periods.prevNativityFast];
  for (const nf of nativityPeriods) {
    if (isDateInRange(date, nf.start, nf.end)) {
      // Sat/Sun: fish allowed; Weekdays: varies but generally oil/wine
      // Dec 20-24 stricter
      const dec20 = new Date(nf.end.getFullYear(), 11, 20);
      if (isDateInRange(date, dec20, nf.end)) {
        return {
          ...FAST_LEVELS.strict,
          reason: 'Nativity Fast (final days)',
          period: 'Nativity Fast',
        };
      }
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return {
          ...FAST_LEVELS.fishAllowed,
          reason: 'Nativity Fast (weekend)',
          period: 'Nativity Fast',
        };
      }
      return {
        ...FAST_LEVELS.oilWine,
        reason: 'Nativity Fast',
        period: 'Nativity Fast',
      };
    }
  }

  // 6. Check Apostles' Fast
  const apostlesPeriods = [periods.apostlesFast, periods.prevApostlesFast];
  for (const af of apostlesPeriods) {
    if (af.start < af.end && isDateInRange(date, af.start, af.end)) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return {
          ...FAST_LEVELS.fishAllowed,
          reason: "Apostles' Fast (weekend)",
          period: "Apostles' Fast",
        };
      }
      if (dayOfWeek === 2 || dayOfWeek === 4) { // Tue, Thu
        return {
          ...FAST_LEVELS.oilWine,
          reason: "Apostles' Fast",
          period: "Apostles' Fast",
        };
      }
      return {
        ...FAST_LEVELS.strict,
        reason: "Apostles' Fast",
        period: "Apostles' Fast",
      };
    }
  }

  // 7. Check Dormition Fast
  if (isDateInRange(date, periods.dormitionFast.start, periods.dormitionFast.end)) {
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        ...FAST_LEVELS.oilWine,
        reason: 'Dormition Fast (weekend)',
        period: 'Dormition Fast',
      };
    }
    return {
      ...FAST_LEVELS.strict,
      reason: 'Dormition Fast',
      period: 'Dormition Fast',
    };
  }

  // 8. Check single fast days
  for (const sd of singleDays) {
    if (sameDay(date, sd.date)) {
      return {
        ...FAST_LEVELS[sd.level],
        reason: sd.name,
        period: null,
      };
    }
  }

  // 9. Regular Wednesday/Friday fast
  if (dayOfWeek === 3 || dayOfWeek === 5) {
    return {
      ...FAST_LEVELS.oilWine,
      reason: dayOfWeek === 3 ? 'Wednesday fast' : 'Friday fast',
      period: null,
    };
  }

  // 10. No fast
  return {
    ...FAST_LEVELS.noFast,
    reason: 'Regular day',
    period: null,
  };
}

/**
 * Get the currently active fasting period, if any.
 * Returns { name, start, end, day, totalDays, icon } or null.
 */
export function getActiveFastingPeriod(date = new Date()) {
  const year = date.getFullYear();
  const periods = getFastingPeriods(year);

  const allPeriods = [
    periods.greatLent,
    periods.apostlesFast,
    periods.dormitionFast,
    periods.nativityFast,
    periods.prevNativityFast,
  ];

  for (const p of allPeriods) {
    if (p.start < p.end && isDateInRange(date, p.start, p.end)) {
      const day = Math.floor((date - p.start) / (1000 * 60 * 60 * 24)) + 1;
      const totalDays = Math.floor((p.end - p.start) / (1000 * 60 * 60 * 24)) + 1;
      return {
        name: p.name,
        start: p.start,
        end: p.end,
        day,
        totalDays,
        icon: p.icon,
      };
    }
  }

  return null;
}

/**
 * Get the next upcoming fasting period.
 * Returns { name, start, daysUntil, icon } or null.
 */
export function getNextFastingPeriod(date = new Date()) {
  const year = date.getFullYear();
  const nextYear = year + 1;

  const periods = [
    ...Object.values(getFastingPeriods(year)),
    ...Object.values(getFastingPeriods(nextYear)),
  ].filter((p) => p.start > date && p.start < p.end);

  // Sort by start date
  periods.sort((a, b) => a.start - b.start);

  if (periods.length === 0) return null;

  const next = periods[0];
  const daysUntil = Math.ceil((next.start - date) / (1000 * 60 * 60 * 24));

  return {
    name: next.name,
    start: next.start,
    daysUntil,
    icon: next.icon,
  };
}

// Daily fasting tips that cycle based on the day of the year
const FASTING_TIPS = [
  'Whey, casein, and caseinate are hidden dairy ingredients found in many processed foods.',
  'Natural flavors can sometimes be animal-derived. When in doubt, check with the manufacturer.',
  'Gelatin is made from animal bones and skin. Look for agar-agar or pectin as alternatives.',
  'Many breads contain milk, eggs, or butter. Check the ingredients carefully.',
  'Dark chocolate (70%+) is usually vegan, but milk chocolate is not fasting-safe.',
  'Honey is permitted during Orthodox fasting periods.',
  'Shellac (confectioner\'s glaze) is made from insects and found in some candies.',
  'Many margarines contain whey or other dairy derivatives.',
  'L-cysteine, used in some breads, can be derived from animal hair or feathers.',
  'Carmine (E120) is a red food coloring made from insects.',
  'Some wines and beers are clarified using animal-derived products like isinglass.',
  'Lecithin can be soy-based (fasting-safe) or egg-based. Check the source.',
  'Many pasta shapes are egg-free, but fresh pasta almost always contains eggs.',
  'Tahini, hummus, and baba ganoush are excellent fasting-friendly staples.',
  'Coconut milk and oat milk are great dairy alternatives for fasting periods.',
  'Nutritional yeast is a fasting-safe way to add a cheesy flavor to dishes.',
  'Check vitamins and supplements too — many capsules contain gelatin.',
  'Worcestershire sauce traditionally contains anchovies.',
  'Some sugar is processed with bone char. Look for organic or beet sugar.',
  'Fasting is not just about food — it is a spiritual discipline of self-control and prayer.',
  'The Wednesday fast commemorates the betrayal of Christ by Judas.',
  'The Friday fast commemorates the Crucifixion of Christ.',
];

export function getDailyTip(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return FASTING_TIPS[dayOfYear % FASTING_TIPS.length];
}
