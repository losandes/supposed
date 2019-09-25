const { execFile } = require('child_process')
const path = require('path')

const suites = [
  // './browser-tests/index.js',
  // './runners/skipping-file-discovery-browser/index.js',
  // './runners/using-browser-test-server/index.js',
  // './runners/using-browser-test-server-custom-template/index.js',
  './coalescing-to-md/index.js',
  './custom-reporters/index.js',
  './custom-reporters/reporter-factory.js',
  './reporter-order/index.js',
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
  execFile('node', [path.join(__dirname, suite)], (error, stdout, stderr) => {
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

Promise.all(promises)
  .then((results) => {
    const rows = results
      .filter((result) => result.match)
      .map((result) => result.match)

    // const noMatchRows = results.filter((result) => !result.match)
    // console.log(noMatchRows.map((result) => result.stdout))
    console.table(rows)
  }).catch((err) => {
    throw err
  })
