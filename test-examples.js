const { execFile } = require('child_process')
const path = require('path')
const suite = require('supposed').Suite({ name: 'tests.examples' })
const isVerbose = suite.config.verbosity === 'debug'
suite.registerReporters()

const suites = [
  // './browser-tests/index.js',
  // './runners/skipping-file-discovery-browser/index.js',
  // './runners/using-browser-test-server/index.js',
  // './runners/using-browser-test-server-custom-template/index.js',
  // './coalescing-to-md/index.js',
  './custom-reporters/index.js',
  './custom-reporters/reporter-factory.js',
  './manual-test-requires/index.js',
  './reporter-order/index.js',
  './runners/manipulate-plan',
  './runners/multiple-suites/index.js',
  './runners/named-suites/index.js',
  './runners/setup-teardown/index.js',
  './runners/skipping-file-discovery/index.js',
  './runners/skipping-file-discovery-plan/index.js',
  './runners/using-nodejs-runner/index.js',
  './runners/using-nodejs-runner-with-injection/index.js',
  './Suites-setup-teardown/index.js',
  './writing-a-reporter/index.js',
  './custom-dsl.js',
  './event-context.js',
  './event-log.js',
  './no-suite.js',
  './Suites.js',
  './using-async-await.js',
  './using-promises.js'
]

const promises = suites.map((suite) => new Promise((resolve, reject) => {
  execFile('node', [path.join(__dirname, 'tests.examples', suite)], (error, stdout, stderr) => {
    if (error) {
      return reject(error)
    }

    const isTotals = /#\s+total:\s+\d+/.test(stdout)

    if (isTotals) {
      const match = stdout.match(/(total|passed|failed|skipped|duration):\s+\d+/g)
        .reduce((row, pair) => {
          if (pair.trim().length && pair.includes(':')) {
            const parts = pair.trim().split(':')
            row[parts[0].trim()] = parseInt(parts[1].trim())
          }

          return row
        }, { suite })
      resolve({ suite, match, stdout })
    } else {
      resolve({ suite, stdout })
    }
  })
}))

module.exports = suite.publish({
  type: 'START',
  suiteId: suite.config.name,
  plan: {
    count: promises.length,
    completed: 0
  }
}).then(() => Promise.all(promises)
  .then((results) => {
    const rows = results
      .filter((result) => result.match)
      .map((result) => result.match)

    const totals = rows.reduce((totals, row) => {
      [
        'total',
        'passed',
        'failed',
        'broken',
        'skipped'
      ].forEach((key) => {
        if (row[key] && !isNaN(row[key])) {
          totals[key] += row[key]
        }
      })

      if (row.duration && !isNaN(row.duration)) {
        totals.duration.milliseconds += row.duration
      }

      return totals
    }, {
      total: 0,
      passed: 0,
      failed: 0,
      broken: 0,
      skipped: 0,
      duration: {
        seconds: -1,
        milliseconds: 0,
        microseconds: -1,
        nanoseconds: -1
      }
    })

    const errors = results
      .filter((result) => result.match && result.match.failed > 0)

    return { rows, totals, errors }
  }).then((processed) => {
    const { rows, totals, errors } = processed

    if (isVerbose) {
      // const noMatchRows = results.filter((result) => !result.match)
      // console.log(noMatchRows.map((result) => result.stdout))
      console.table(rows)
    }

    if (errors.length) {
      errors.forEach((result) => {
        suite.publish({
          type: 'TEST',
          status: 'FAILED',
          behavior: `Suite failed: ${result.suite}`,
          error: new Error(result.stdout)
        })
      })
    }

    suite.publish({ type: 'END', totals })

    return processed
  }).then((processed) => {
    if (processed.errors.length) {
      process.exit(1)
    }

    return processed
  }).catch((err) => {
    console.log(err)
    process.exit(1)
  }))
