const supposed = require('supposed')

function MyReporter () {
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

  const write = (event) => {
    if (event.type === 'TEST') {
      const durations = [
        `given: ${formatDuration(event.duration.given)}`,
        `when: ${formatDuration(event.duration.when)}`,
        `then: ${formatDuration(event.duration.then)}`
      ]

      // console.log(`  ${event.status}  ${event.behavior} (${durations.join(', ')})`)
      console.log(`${event.status} ${event.behavior} (duration: ${formatDuration(event.duration.total)} (${durations.join(', ')}))`)
    }
  }

  return { write }
}

const suite = supposed.Suite({ name: 'MySuite' })
suite.reporterFactory.add(MyReporter)
console.log('EXISTING', suite.reporterFactory.get('MYREPORTER'))
suite.runner({ cwd: __dirname })
  .run()
