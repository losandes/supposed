module.exports = {
  name: 'time',
  factory: () => {
    'use strict'

    const UNITS = {
      SECONDS: 's',
      MILLISECONDS: 'ms',
      MICROSECONDS: 'us',
      NANOSECONDS: 'ns'
    }
    const UNITS_ARRAY = Object.keys(UNITS).map((key) => UNITS[key])
    const isValidUnit = (unit) => UNITS_ARRAY.includes(unit)

    const makeClock = (MULTIPLIERS, makeTime) => {
      const clock = function (option) {
        switch (option) {
          case 's':
            return makeTime(MULTIPLIERS.SECONDS)
          case 'ms':
            return makeTime(MULTIPLIERS.MILLISECONDS)
          case 'us':
            return makeTime(MULTIPLIERS.MICROSECONDS)
          case 'ns':
            return makeTime(MULTIPLIERS.NANOSECONDS)
          default:
            return {
              seconds: makeTime(MULTIPLIERS.SECONDS),
              milliseconds: makeTime(MULTIPLIERS.MILLISECONDS),
              microseconds: makeTime(MULTIPLIERS.MICROSECONDS),
              nanoseconds: makeTime(MULTIPLIERS.NANOSECONDS)
            }
        }
      }

      clock.seconds = () => clock(UNITS.SECONDS)
      clock.milliseconds = () => clock(UNITS.MILLISECONDS)
      clock.microseconds = () => clock(UNITS.MICROSECONDS)
      clock.nanoseconds = () => clock(UNITS.NANOSECONDS)

      return clock
    }

    const CONVERSIONS = {
      s: {
        SECONDS: 1,
        MILLISECONDS: 1000,
        MICROSECONDS: 1000000,
        NANOSECONDS: 1000000000
      },
      ms: {
        SECONDS: 0.001,
        MILLISECONDS: 1,
        MICROSECONDS: 1000,
        NANOSECONDS: 1000000
      },
      us: {
        SECONDS: 0.000001,
        MILLISECONDS: 0.001,
        MICROSECONDS: 1,
        NANOSECONDS: 1000
      },
      ns: {
        SECONDS: 1e9,
        MILLISECONDS: 0.000001,
        MICROSECONDS: 0.001,
        NANOSECONDS: 1
      }
    }

    const duration = (start, end, timeUnits) => {
      const conversions = CONVERSIONS[timeUnits]

      return {
        seconds: (end - start) * conversions.SECONDS,
        milliseconds: (end - start) * conversions.MILLISECONDS,
        microseconds: (end - start) * conversions.MICROSECONDS,
        nanoseconds: (end - start) * conversions.NANOSECONDS
      }
    }

    const NODE_MULTIPLIERS = {
      SECONDS: [1, 1e-9],
      MILLISECONDS: [1e3, 1e-6],
      MICROSECONDS: [1e6, 1e-3],
      NANOSECONDS: [1e9, 1]
    }
    const BROWSER_MULTIPLIERS = {
      SECONDS: 0.001,
      MILLISECONDS: 1,
      MICROSECONDS: 1000,
      NANOSECONDS: 1000000
    }

    const nodeClock = (multipliers, hrtime) => {
      const time = Array.isArray(hrtime) ? process.hrtime(hrtime) : process.hrtime()
      return (time[0] * multipliers[0]) + (time[1] * multipliers[1])
    }

    const browserClock = (multiplier, hrtime) => {
      return window.performance.now() * multiplier
    }

    const clock = typeof process !== 'undefined' && typeof process.hrtime === 'function'
      ? makeClock(NODE_MULTIPLIERS, nodeClock)
      : makeClock(BROWSER_MULTIPLIERS, browserClock)

    return { clock, isValidUnit, duration }
  }
}
