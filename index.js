'use strict'

const assert = require('assert')
const TestBatch = require('./TestBatch.js')
const AsyncTest = require('./AsyncTest.js')
const Reporter = require('./reporters/DefaultReporter.js')
const configFactory = require('./configFactory.js')
var configDefaults = {
  assertionLibrary: assert,
  reporter: new Reporter()
}

process.argv.forEach((val, idx, vals) => {
  if (val === '--tap' || val === '-t') {
    const TapReporter = require('./reporters/TapReporter.js')
    configDefaults.reporter = new TapReporter()
  } else if (val === '--brief' || (val === '-r' && vals[idx + 1] === 'brief')) {
    const BrevityReporter = require('./reporters/BrevityReporter.js')
    configDefaults.reporter = new BrevityReporter()
  }
})

module.exports = Suite()

function Suite (suiteConfig) {
  const config = configFactory.makeSuiteConfig(configDefaults, suiteConfig)
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
    config.reporter.report({
      type: 'end'
    })
  })

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
    if (typeof behaviorOrBatch === 'object') {
      runBatch(behaviorOrBatch)
    } else if (typeof behaviorOrBatch === 'string') {
      var t = {}
      t[behaviorOrBatch] = typeof sut === 'function' ? { '': sut } : sut
      runBatch(t)
    } else {
      throw new Error('A test or batch of tests is required')
    }
  }

  /**
  // Make a newly configured suite
  */
  test.Suite = Suite

  function runBatch (batch) {
    config.reporter.report({
      type: 'start'
    })
    run(new TestBatch(batch).map(theory => {
      return new AsyncTest(theory, config.makeTheoryConfig(theory))
    }))
  }

  function run (batch) {
    batch.forEach(test => {
      test.then(() => {

      }).catch(err => {
        while (uncaught.length) {
          config.reporter.report({
            type: 'error',
            behavior: err.behavior,
            error: uncaught.shift()
          })
        }
      })
    })
  }

  return test
}
