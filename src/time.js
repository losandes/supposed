module.exports = {
  name: 'time',
  factory: () => {
    'use strict'

    if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
      const MULTIPLIERS = {
        SECONDS: [1, 1e-9],
        MILLISECONDS: [1e3, 1e-6],
        MICROSECONDS: [1e6, 1e-3],
        NANOSECONDS: [1e9, 1]
      }

      const _hrtime = (multipliers, hrtime) => {
        const time = Array.isArray(hrtime) ? process.hrtime(hrtime) : process.hrtime()
        return (time[0] * multipliers[0]) + (time[1] * multipliers[1])
      }

      const now = {
        in: {
          seconds: () => _hrtime(MULTIPLIERS.SECONDS),
          milliseconds: () => _hrtime(MULTIPLIERS.MILLISECONDS),
          microseconds: () => _hrtime(MULTIPLIERS.MICROSECONDS),
          nanoseconds: () => _hrtime(MULTIPLIERS.NANOSECONDS)
        }
      }

      const diff = {
        in: {
          seconds: (hrtime) => _hrtime(MULTIPLIERS.SECONDS, hrtime),
          milliseconds: (hrtime) => _hrtime(MULTIPLIERS.MILLISECONDS, hrtime),
          microseconds: (hrtime) => _hrtime(MULTIPLIERS.MICROSECONDS, hrtime),
          nanoseconds: (hrtime) => _hrtime(MULTIPLIERS.NANOSECONDS, hrtime)
        }
      }

      return { now, diff }
    }

    const OPTIONS = {
      SECONDS: 's',
      MILLISECONDS: 'ms',
      MICROSECONDS: 'us',
      NANOSECONDS: 'ns'
    }

    // TODO: look at the performance API for this
    const _hrtime = (option /* 's' | 'ms' | 'us' | 'ns' */, timeSinceEpoch) => {
      const time = typeof timeSinceEpoch === 'number'
        ? timeSinceEpoch
        : Date.now()

      switch (option) {
        case 's':
          return time / 1000
        case 'ms':
          return time
        case 'us':
          return time * 1000
        case 'ns':
          return time * 1000000
        default:
          return time
      }
    }

    const now = {
      in: {
        seconds: () => _hrtime(OPTIONS.SECONDS),
        milliseconds: () => _hrtime(OPTIONS.MILLISECONDS),
        microseconds: () => _hrtime(OPTIONS.MICROSECONDS),
        nanoseconds: () => _hrtime(OPTIONS.NANOSECONDS)
      }
    }

    const diff = {
      in: {
        seconds: (hrtime) => _hrtime(OPTIONS.SECONDS, hrtime),
        milliseconds: (hrtime) => _hrtime(OPTIONS.MILLISECONDS, hrtime),
        microseconds: (hrtime) => _hrtime(OPTIONS.MICROSECONDS, hrtime),
        nanoseconds: (hrtime) => _hrtime(OPTIONS.NANOSECONDS, hrtime)
      }
    }

    return { now, diff }
  }
}
