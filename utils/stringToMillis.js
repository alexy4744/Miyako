module.exports = {
  units: {
    "years": {
      "value": 3.154e+10,
      "abbreviations": ["y", "yr", "yrs", "year", "years"]
    },
    "months": {
      "value": 2.628e+9,
      "abbreviations": ["mo", "mos", "month", "months"]
    },
    "weeks": {
      "value": 6.048e+8,
      "abbreviations": ["w", "wk", "wks", "week", "weeks"]
    },
    "days": {
      "value": 8.64e+7,
      "abbreviations": ["d", "day", "days"]
    },
    "hours": {
      "value": 3.6e+6,
      "abbreviations": ["h", "hr", "hour", "hours"]
    },
    "minutes": {
      "value": 60000,
      "abbreviations": ["m", "min", "mins", "minute", "minutes"]
    },
    "seconds": {
      "value": 1000,
      "abbreviations": ["s", "sec", "secs", "second", "seconds"]
    }
  },

  allUnits: () => {
    const units = module.exports.units;
    const allUnits = [];

    for (const unit in units) allUnits.push(...units[unit].abbreviations); // eslint-disable-line

    return allUnits;
  },

  convert: str => {
    const t = str.split(/(\d+)/);

    let ms = 0;

    str.replace(/[^\W\s]/gi, ""); // Remove whitespace and unicode from original input
    t.shift();

    for (let i = 0; i < t.length; i++) {
      if (!isNaN(t[i])) {
        if (!isNaN(t[i + 1])) {
          throw new Error("Invalid time format");
        } else {
          const units = module.exports.units;
          for (const unit in units) { // eslint-disable-line
            for (const abbrev of units[unit].abbreviations) {
              if (abbrev === t[i + 1]) ms += t[i] * units[unit].value;
            }
          }
        }
      }
    }

    return {
      "ms": ms,
      "splitted": t
    };
  },

  // Basically, the unit should always be after the number, that way it knows whether the value should be a year/month/etc
  // 12h10y11s => valid
  // h12y1011s => invalid
  isValid: str => {
    if (isNaN(str[0]) || !isNaN(str[str.length - 1])) return false;

    try {
      const units = module.exports.convert(str).splitted.filter(el => isNaN(el));
      let unitCounter = 0;

      for (let i = 0; i < units.length; i++) {
        if (!isNaN(units[i])) return false;
        if (module.exports.allUnits().includes(units[i])) unitCounter++;
      }

      if (unitCounter < units.length) return false;

      return true;
    } catch (error) {
      return false;
    }
  }
};