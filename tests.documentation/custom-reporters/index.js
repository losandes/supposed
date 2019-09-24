const supposed = require('supposed')

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

const eventHandler = (event) => {
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

module.exports = supposed.Suite({
  reporter: eventHandler
}) // .subscribe(eventHandler)
  .runner({ cwd: __dirname })
  .run()
