const { execFile } = require('child_process')
const path = require('path')

const suites = []
// suites.push('./browser-tests/index.js')
suites.push('./coalescing-to-md/index.js')
suites.push('./custom-reporters/index.js')
suites.push('./custom-reporters/reporter-factory.js')
suites.push('./reporter-order/index.js')
suites.push('./runners/multiple-suites/index.js')
suites.push('./runners/named-suites/index.js')
suites.push('./runners/setup-teardown/index.js')
suites.push('./runners/skipping-file-discovery/index.js')
// suites.push('./runners/skipping-file-discovery-browser/index.js')
suites.push('./runners/skipping-file-discovery-plan/index.js')
// suites.push('./runners/using-browser-test-server/index.js')
suites.push('./runners/using-nodejs-runner/index.js')
suites.push('./runners/using-nodejs-runner-with-injection/index.js')
suites.push('./Suites-setup-teardown/index.js')
suites.push('./writing-a-reporter/index.js')

suites.push('./custom-dsl.js')
suites.push('./event-context.js')
suites.push('./event-log.js')
suites.push('./no-suite.js')
suites.push('./Suites.js')
suites.push('./using-async-await.js')
suites.push('./using-promises.js')

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
