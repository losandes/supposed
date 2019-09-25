const { execFile } = require('child_process')
const path = require('path')
const supposed = require('supposed')
const reporter = supposed.reporterFactory.get('list')
let started = false

const suites = [
  './first-module/first-suite.js',
  './second-module/second-suite.js'
]

const promises = suites.map((suite) => new Promise((resolve, reject) => {
  execFile('node', [path.join(__dirname, suite)], (error, stdout, stderr) => {
    if (error) {
      return reject(error)
    }

    try {
      const events = JSON.parse(stdout).map((row) => row.event)

      if (!started) {
        started = true
        reporter.write(events.find((event) => event.type === 'START'))
      }

      events.forEach((event) => {
        if (event.type === 'TEST') {
          reporter.write(event)
        }
      })

      resolve({ suite, events })
    } catch (e) {
      e.stdout = stdout
      throw e
    }
  })
}))

Promise.all(promises)
  .then((results) => {
    const errors = []
    const totals = results
      .map((result) => {
        const endEvent = result.events.find((event) => event.type === 'END')

        if (endEvent.totals.failed > 0) {
          errors.push(result)
        }

        return {
          suite: result.suite,
          total: endEvent.totals.total,
          passed: endEvent.totals.passed,
          failed: endEvent.totals.failed,
          broken: endEvent.totals.broken,
          skipped: endEvent.totals.skipped,
          duration: endEvent.totals.duration
        }
      })
      .reduce((totals, row) => {
        totals.total += row.total
        totals.passed += row.passed
        totals.failed += row.failed
        totals.broken += row.broken
        totals.skipped += row.skipped
        totals.duration.seconds += row.duration.seconds
        totals.duration.milliseconds += row.duration.milliseconds
        totals.duration.microseconds += row.duration.microseconds
        totals.duration.nanoseconds += row.duration.nanoseconds

        return totals
      }, {
        total: 0,
        passed: 0,
        failed: 0,
        broken: 0,
        skipped: 0,
        duration: {
          seconds: 0,
          milliseconds: 0,
          microseconds: 0,
          nanoseconds: 0
        }
      })

    reporter.write({ type: 'END', totals })

    if (errors.length) {
      console.log(errors)
      process.exit(1)
    }
  }).catch((err) => {
    console.log(err)
    process.exit(1)
  })
