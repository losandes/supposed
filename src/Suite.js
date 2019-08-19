module.exports = {
  name: 'Suite',
  factory: Suite
}

function Suite (
  DefaultRunner,
  DefaultDiscoverer,
  TestBatch,
  AsyncTest,
  TestEvent,
  configFactory,
  configDefaults,
  reporterFactory,
  reporters
) {
  'use strict'

  /**
   * The test library
   * @param {Object} suiteConfig : optional configuration
  */
  function Suite (suiteConfig) {
    const config = configFactory.makeSuiteConfig(configDefaults, suiteConfig, reporterFactory)
    const runner = new DefaultRunner(config)

    function normalizeBatch (behaviorOrBatch, sut) {
      if (typeof behaviorOrBatch === 'object') {
        return Promise.resolve(behaviorOrBatch)
      } else if (typeof behaviorOrBatch === 'string') {
        const t = {}
        t[behaviorOrBatch] = typeof sut === 'function' ? { '': sut } : sut
        return Promise.resolve(t)
      } else if (typeof behaviorOrBatch === 'function') {
        const t = { '': behaviorOrBatch }
        return Promise.resolve(t)
      } else {
        return Promise.reject(new Error('An invalid test was found: a test or batch of tests is required'))
      }
    } // /normalizebatch

    function mapToTests (batch) {
      var processed = new TestBatch(batch)
        .filter(byMatcher)

      return {
        batch: processed,
        tests: processed.map(theory => {
          return new AsyncTest(theory, config.makeTheoryConfig(theory))
        })
      }
    } // /mapToTests

    function byMatcher (theory) {
      if (!config.match) {
        return true
      }

      for (let i = 0; i < theory.assertions.length; i += 1) {
        if (config.match.test(theory.assertions[i].behavior)) {
          return true
        }
      }
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
    test.getTotals = () => {
      return config.reporter.getTotals()
    }
    test.suiteName = config.name
    test.runner = (options) => {
      return new DefaultDiscoverer(Object.assign({ suite: test }, options))
    }
    test.reporters = reporters
    test.config = config

    Suite.suites.push(test)

    return test
  }

  Suite.suites = []
  return Suite
}
