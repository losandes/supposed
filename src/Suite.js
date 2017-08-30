module.exports = function (
  TestEvent,
  TestBatch,
  AsyncTest,
  configFactory,
  configDefaults,
  reporters,
  promises
) {
  'use strict'

  return Suite

  /**
   * The test library
   * @param {Object} suiteConfig : optional configuration
  */
  function Suite (suiteConfig) {
    const config = configFactory.makeSuiteConfig(configDefaults, suiteConfig, reporters)

    const normalizeBatch = (behaviorOrBatch, sut) => {
      if (typeof behaviorOrBatch === 'object') {
        return Promise.resolve(behaviorOrBatch)
      } else if (typeof behaviorOrBatch === 'string') {
        var t = {}
        t[behaviorOrBatch] = typeof sut === 'function' ? { '': sut } : sut
        return Promise.resolve(t)
      } else {
        return Promise.reject(new Error('An invalid test was found: a test or batch of tests is required'))
      }
    }

    const mapToTests = (batch) => {
      const processed = new TestBatch(batch)
      return {
        batch: processed,
        tests: processed.map(theory => {
          return new AsyncTest(theory, config.makeTheoryConfig(theory))
        })
      }
    }

    const makePlan = (context) => {
      var count = 0

      context.batch.forEach(item => {
        count += item.assertions.length
      })

      context.plan = {
        count: count
      }
      return context
    }

    const run = (context) => {
      config.reporter.report(TestEvent.start)

      return promises.allSettled(context.tests)
        .then(results => {
          context.results = results
          return context
        })
    }

    const report = (context) => {
      // TODO: reporting all at once was necessary to format the TAP output.
      // For other reporters, we may want to report earlier - so there's a better feed
      // It could be similar to the onError function that gets passed to allSettled
      config.reporter.report(new TestEvent({
        type: TestEvent.types.START_TEST,
        plan: context.plan
      }))
      config.reporter.report(context.results)
      return Promise.resolve(context.results)
    }

    const prepareOutput = (results) => {
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
    }

    // examples:
    // test('when dividing a number by zero', {
    //   when: resolve => { resolve(42 / 0) },
    //   'we get Infinity': (t, outcome) => {
    //     t.equal(outcome, Infinity)
    //   }
    // })
    //
    // OR
    //
    // test({
    //   'when dividing a number by zero': {
    //     when: resolve => { resolve(42 / 0) },
    //     'we get Infinity': (t, outcome) => {
    //       t.equal(outcome, Infinity)
    //     }
    //   }
    // })
    function test (behaviorOrBatch, sut) {
      return normalizeBatch(behaviorOrBatch, sut)
        .then(mapToTests)
        .then(makePlan)
        .then(run)
        .then(report)
        .then(prepareOutput)
        .catch(err => {
          console.log()
          console.log(err)
          console.log()
          return Promise.reject(err)
        })
    }

    /**
    // Make a newly configured suite
    */
    test.Suite = Suite

    return test
  }
}
