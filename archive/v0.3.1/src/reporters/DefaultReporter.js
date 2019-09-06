'use strict'

module.exports = {
  name: 'DefaultReporter',
  factory: DefaultReporterFactory
}

function DefaultReporterFactory (Reporter) {
  return function (printerFactory, TestEvent) {
    const totals = {
      total: 0,
      passed: 0,
      skipped: 0,
      failed: 0,
      broken: 0,
      startTime: null,
      endTime: null
    }
    const results = []
    let __printer
    const printer = () => {
      if (__printer) {
        return __printer
      }

      __printer = printerFactory()
      return __printer
    }

    function report (result) {
      if (Array.isArray(result)) {
        return result.forEach(reportOne)
      }

      return reportOne(result)
    }

    function reportOne (result) {
      switch (result.type) {
        case TestEvent.types.START:
          printer().print.start('Running tests...' + printer().newLine)
          // set the start time, if it isn't already set
          totals.startTime = totals.startTime || new Date()
          break
        case TestEvent.types.START_TEST:
          printer().print.startTest(result.plan)
          break
        case TestEvent.types.PASSED:
          totals.passed += 1
          printer().print.success(result.behavior)
          results.push(result)
          break
        case TestEvent.types.SKIPPED:
          totals.skipped += 1
          printer().print.skipped(result.behavior)
          results.push(result)
          break
        case TestEvent.types.FAILED:
          totals.failed += 1
          printer().print.failed(result.behavior, result.error)
          results.push(result)
          break
        case TestEvent.types.BROKEN:
          totals.broken += 1
          printer().print.broken(result.behavior, result.error)
          results.push(result)
          break
        case TestEvent.types.END:
          totals.endTime = new Date()
          totals.total = totals.passed + totals.skipped + totals.failed + totals.broken
          printer().print.totals(totals)
          break
      }
    }

    return new Reporter({
      report: report,
      getTotals: () => {
        const output = Object.assign({}, totals)
        output.total = output.passed + output.skipped + output.failed + output.broken
        return output
      },
      getResults: () => { return results },
      getPrinterOutput: () => {
        return typeof printer().getOutput === 'function' ? printer().getOutput() : ''
      }
    })
  }
}
