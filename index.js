'use strict'

const assert = require('assert')
const TestBatch = require('./TestBatch.js')
const AsyncTest = require('./AsyncTest.js')
const reporters = require('./reporters/reporterFactory.js')
const configFactory = require('./configFactory.js')
const promises = require('./promiseUtils.js')
const TestEvent = require('./TestEvent.js')
var configDefaults = {
  assertionLibrary: assert,
  reporter: reporters.types.DEFAULT
}

process.argv.forEach((val, idx, vals) => {
  if (val === '--tap' || val === '-t') {
    configDefaults.reporter = reporters.types.TAP
  } else if (val === '--brief' || (val === '-r' && vals[idx + 1] === 'brief')) {
    configDefaults.reporter = reporters.types.BRIEF
  } else if (val === '--quiet' || (val === '-r' && vals[idx + 1] === 'quiet')) {
    configDefaults.reporter = reporters.types.QUIET
  }
})

module.exports = Suite()

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
    return Promise.resolve(new TestBatch(batch).map(theory => {
      return new AsyncTest(theory, config.makeTheoryConfig(theory))
    }))
  }

  const run = (batch) => {
    config.reporter.report(TestEvent.start)

    return promises.allSettled(batch, err => {
      while (uncaught.length) {
        config.reporter.report({
          type: TestEvent.types.BROKEN,
          behavior: err.behavior,
          error: uncaught.shift()
        })
      }
    })
  }

  const report = (results) => {
    // TODO: reporting all at once was necessary to format the TAP output.
    // For other reporters, we may want to report earlier - so there's a better feed
    // It could be similar to the onError function that gets passed to allSettled
    config.reporter.report(TestEvent.startTest)
    config.reporter.report(results)
    return Promise.resolve(results)
  }

  const prepareOutput = (results) => {
    var totals = {
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
