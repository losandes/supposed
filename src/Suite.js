module.exports = function (
  DefaultRunner,
  TestBatch,
  AsyncTest,
  TestEvent,
  configFactory,
  configDefaults,
  reporters
) {
  'use strict'

  return Suite

  /**
   * The test library
   * @param {Object} suiteConfig : optional configuration
  */
  function Suite (suiteConfig) {
    const config = configFactory.makeSuiteConfig(configDefaults, suiteConfig, reporters)
    const runner = new DefaultRunner(config)

    function normalizeBatch (behaviorOrBatch, sut) {
      if (typeof behaviorOrBatch === 'object') {
        return Promise.resolve(behaviorOrBatch)
      } else if (typeof behaviorOrBatch === 'string') {
        var t = {}
        t[behaviorOrBatch] = typeof sut === 'function' ? { '': sut } : sut
        return Promise.resolve(t)
      } else {
        return Promise.reject(new Error('An invalid test was found: a test or batch of tests is required'))
      }
    } // /normalizebatch

    function mapToTests (batch) {
      const processed = new TestBatch(batch)
      return {
        batch: processed,
        tests: processed.map(theory => {
          return new AsyncTest(theory, config.makeTheoryConfig(theory))
        })
      }
    } // /mapToTests

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
        .then(runner.makePlan)
        .then(runner.run)
        .then(runner.report)
        .then(runner.prepareOutput)
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
    test.printSummary = () => {
      config.reporter.report(TestEvent.end)
    }
    // test.getPrinterOutput = () => {
    //   return config.reporter.getPrinterOutput()
    // }

    // process.on('exit', () => {
    //   test.printSummary()
    // })

    return test
  }
}
