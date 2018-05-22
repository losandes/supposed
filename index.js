'use strict'

// dependencies
const assert = require('assert')

// src
const ArgumentProcessor = require('./src/ArgumentProcessor.js')
const AsyncTestFactory = require('./src/AsyncTest.js')
const configFactory = require('./src/configFactory.js')
const promiseUtils = require('./src/promiseUtils.js')
const TestBatch = require('./src/TestBatch.js')
const TestEvent = require('./src/TestEvent.js')
const SuiteFactory = require('./src/Suite.js')

// assertions
const SupposeFactory = require('./src/assertions/Suppose.js')

// reporters
const ReporterFactory = require('./src/reporters/ReporterFactory.js')
const DefaultPrinter = require('./src/reporters/DefaultPrinter.js')
const StreamPrinter = require('./src/reporters/StreamPrinter')
const TapPrinter = require('./src/reporters/TapPrinter.js')
const BriefPrinter = require('./src/reporters/BrevityPrinter.js')
const QuietPrinter = require('./src/reporters/QuietPrinter.js')
const Reporter = require('./src/reporters/Reporter.js')
const DefaultReporter = require('./src/reporters/DefaultReporter.js')(
  Reporter
)
const consoleStyles = require('./src/reporters/console-styles.js')

// runners
const DefaultRunnerFactory = require('./src/runners/DefaultRunner.js')

// resolve the dependency graph
const AsyncTest = new AsyncTestFactory(TestEvent)
const DefaultRunner = new DefaultRunnerFactory(TestEvent, promiseUtils)
const reporters = new ReporterFactory(
  TestEvent,
  DefaultPrinter,
  TapPrinter,
  BriefPrinter,
  QuietPrinter,
  StreamPrinter,
  DefaultReporter,
  Reporter,
  consoleStyles
)
const argumentProcessor = new ArgumentProcessor(reporters)
const args = argumentProcessor.get()
const configDefaults = {
  assertionLibrary: SupposeFactory(assert),
  reporter: args.reporter,
  match: args.match
}
const Suite = new SuiteFactory(
  DefaultRunner,
  TestBatch,
  AsyncTest,
  TestEvent,
  configFactory,
  configDefaults,
  reporters
)
const supposed = Suite()

process.on('exit', () => {
  Suite.suites.forEach((suite) => {
    if (suite.getTotals().total > 0) {
      suite.printSummary()
    }
  })
})

// export a default Suite, so consumers don't have to construct anything
// to use this library. Suite has a `Suite` property on it, so consumers
// can customize it if they choose to
module.exports = supposed
