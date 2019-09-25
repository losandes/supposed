const { execFile } = require('child_process')
const path = require('path')

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
      resolve({ suite, events: JSON.parse(stdout).map((row) => row.event) })
    } catch (e) {
      e.stdout = stdout
      throw e
    }
  })
}))

Promise.all(promises)
  .then((results) => {
    const errors = []
    const rows = results
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
          skipped: endEvent.totals.skipped
        }
      })

    console.table(rows)

    if (errors.length) {
      console.log(errors)
      process.exit(1)
    }
  }).catch((err) => {
    console.log(err)
    process.exit(1)
  })
