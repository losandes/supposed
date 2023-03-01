module.exports = {
  name: 'PerformanceFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, TestEvent } = dependencies

    function PerformanceFormatter () {
      const formatDuration = (duration) => {
        if (!duration) {
          return 0
        }

        if (typeof duration === 'number' && duration.seconds > 1) {
          return `${Math.round(duration.seconds)}s`
        } else if (duration.milliseconds > 1) {
          return `${Math.round(duration.milliseconds)}ms`
        } else if (duration.microseconds > 1) {
          return `${Math.round(duration.microseconds)}µs`
        } else if (duration.nanoseconds > 1) {
          return `${Math.round(duration.nanoseconds)}ns`
        } else {
          return 0
        }
      }

      const format = (event) => {
        if (event.type === TestEvent.types.TEST && event.duration) {
          const durations = [
            `given: ${formatDuration(event.duration.given)}`,
            `when: ${formatDuration(event.duration.when)}`,
            `then: ${formatDuration(event.duration.then)}`,
          ]

          return `${consoleStyles.cyan('# ')}  duration: ${formatDuration(event.duration.total)} (${durations.join(', ')})`
        }
      }

      return { format }
    }

    return { PerformanceFormatter }
  },
}
