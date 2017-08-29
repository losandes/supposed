'use strict'

// dependencies
const assert = require('assert')
// src
const ArgumentProcessor = require('./src/ArgumentProcessor.js')
const AsyncTest = require('./src/AsyncTest.js')
const configFactory = require('./src/configFactory.js')
const promises = require('./src/promiseUtils.js')
const TestBatch = require('./src/TestBatch.js')
const TestEvent = require('./src/TestEvent.js')
// reporters
const ReporterFactory = require('./src/reporters/ReporterFactory.js')
const DefaultPrinter = require('./src/reporters/DefaultPrinter.js')
const StreamPrinter = require('./src/reporters/StreamPrinter')
const TapPrinter = require('./src/reporters/TapPrinter.js')
const BriefPrinter = require('./src/reporters/BrevityPrinter.js')
const QuietPrinter = require('./src/reporters/QuietPrinter.js')
const Reporter = require('./src/reporters/Reporter.js')
const consoleStyles = require('./src/reporters/console-styles.js')
// resolve the dependency graph
const reporters = new ReporterFactory(
  TestEvent,
  DefaultPrinter,
  TapPrinter,
  BriefPrinter,
  QuietPrinter,
  StreamPrinter,
  Reporter,
  consoleStyles
)
const argumentProcessor = new ArgumentProcessor(reporters)
const args = argumentProcessor.get()
const configDefaults = {
  assertionLibrary: assert,
  reporter: args.reporter
}

// export a default Suite, so consumers don't have to construct anything
// to use this library. Suite has a `Suite` property on it, so consumers
// can customize it if they choose to
module.exports = Suite()

/**
 * The test library
 * @param {Object} suiteConfig : optional configuration
*/
function Suite (suiteConfig) {
  const config = configFactory.makeSuiteConfig(configDefaults, suiteConfig, reporters)
  const uncaught = []

  process.on('uncaughtException', err => {
    // TODO: Maybe we can avoid this by running each test in a separate process?
    uncaught.push({
      behavior: 'a timeout was caused by the following error',
      error: err
    })
    /* ignore (this is an anti-pattern - don't follow it outside of tests) */
  })

  process.on('exit', () => {
    config.reporter.report(TestEvent.end)
  })

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
    return Promise.resolve({
      batch: processed,
      tests: processed.map(theory => {
        return new AsyncTest(theory, config.makeTheoryConfig(theory))
      })
    })
  }

  const makePlan = (context) => {
    var count = 0

    context.batch.forEach(item => {
      count += item.assertions.length
    })

    context.plan = {
      count: count
    }
    return Promise.resolve(context)
  }

  const run = (context) => {
    config.reporter.report(TestEvent.start)

    return promises.allSettled(context.tests, err => {
      while (uncaught.length) {
        config.reporter.report({
          type: TestEvent.types.BROKEN,
          behavior: err.behavior,
          error: uncaught.shift()
        })
      }
    }).then(results => {
      context.results = results
      return Promise.resolve(context)
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
    var totals = {
      total: results.length,
      passed: 0,
      skipped: 0,
      failed: 0,
      broken: 0
      // startTime: null,
      // endTime: null
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
