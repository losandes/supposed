module.exports = {
  name: 'DefaultRunner',
  factory: DefaultRunner
}

function DefaultRunner (TestEvent, promiseUtils) {
  return function (config) {
    return {
      makePlan: makePlan,
      run: run,
      report: report,
      prepareOutput: prepareOutput
    }

    function makePlan (context) {
      var count = 0

      context.batch.forEach(item => {
        count += item.assertions.length
      })

      context.plan = {
        count: count
      }
      return context
    } // /makePlan

    function run (context) {
      config.reporter.report(TestEvent.start)

      return promiseUtils.allSettled(context.tests)
        .then(results => {
          context.results = results
          return context
        })
    } // /run

    function report (context) {
      // TODO: reporting all at once was necessary to format the TAP output.
      // For other reporters, we may want to report earlier - so there's a better feed
      // It could be similar to the onError function that gets passed to allSettled
      config.reporter.report(new TestEvent({
        type: TestEvent.types.START_TEST,
        plan: context.plan
      }))
      config.reporter.report(context.results)
      return Promise.resolve(context.results)
    } // /report

    function prepareOutput (results) {
      var reporterTotals = Object.assign({}, config.reporter.getTotals())
      var totals = {
        total: results.length,
        passed: 0,
        skipped: 0,
        failed: 0,
        broken: 0,
        startTime: reporterTotals.startTime,
        endTime: reporterTotals.endTime
      }

      results.forEach(result => {
        switch (result.type) {
          case TestEvent.types.PASSED:
            totals.passed += 1
            break
          case TestEvent.types.SKIPPED:
            totals.skipped += 1
            break
          case TestEvent.types.FAILED:
            totals.failed += 1
            break
          case TestEvent.types.BROKEN:
            totals.broken += 1
            break
        }
      })

      return Promise.resolve({
        results: results,
        totals: totals
      })
    } // /prepareOutput
  } // /DefaultRunner
} // /module.exports
