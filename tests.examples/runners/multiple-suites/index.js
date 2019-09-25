const supposed = require('supposed')
const s1 = require('./first-module/first-suite.js')
const s2 = require('./second-module/second-suite.js')
const suite = supposed.Suite({
  name: 'supposed-tests.docs.multiple-suites'
})

const reporter = suite.reporterFactory.get('list')
const subscription = (event) => {
  if (event.type === 'TEST') {
    reporter.write(event)
  }
}
s1.suite.subscribe(subscription)
s2.suite.subscribe(subscription)

const startTime = Date.now()
reporter.write({ type: 'START', time: startTime, suiteId: suite.config.name })

Promise.all([s1.runner.run(), s2.runner.run()])
  .then((results) => {
    reporter.write({
      type: 'END',
      time: Date.now(),
      suiteId: suite.config.name,
      totals: results.reduce((tally, current) => {
        tally.total += current.totals.total
        tally.passed += current.totals.passed
        tally.skipped += current.totals.skipped
        tally.failed += current.totals.failed
        tally.broken += current.totals.broken

        return tally
      }, {
        total: 0,
        passed: 0,
        skipped: 0,
        failed: 0,
        broken: 0,
        startTime: startTime,
        endTime: Date.now()
      })
    })
  })
