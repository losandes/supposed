'use strict'

// dependencies
const assert = require('assert')
const fs = require('fs')
const path = require('path')

// src
const ArgumentProcessor = require('./src/ArgumentProcessor.js').factory
const AsyncTestFactory = require('./src/AsyncTest.js').factory
const configFactory = require('./src/configFactory.js').factory
const promiseUtils = require('./src/promiseUtils.js').factory
const TestBatch = require('./src/TestBatch.js').factory
const TestEvent = require('./src/TestEvent.js').factory
const SuiteFactory = require('./src/Suite.js').factory

// assertions
const SupposeFactory = require('./src/assertions/Suppose.js').factory

// reporters
const ReporterFactory = require('./src/reporters/ReporterFactory.js').factory
const ConsolePrinter = require('./src/reporters/ConsolePrinter.js').factory
const StreamPrinter = require('./src/reporters/StreamPrinter').factory
const TapPrinter = require('./src/reporters/TapPrinter.js').factory
const BriefPrinter = require('./src/reporters/BrevityPrinter.js').factory
const QuietPrinter = require('./src/reporters/QuietPrinter.js').factory
const NyanPrinter = require('./src/reporters/NyanPrinter.js').factory
const Reporter = require('./src/reporters/Reporter.js').factory
const DefaultReporter = require('./src/reporters/DefaultReporter.js').factory(
  Reporter
)
const consoleStyles = require('./src/reporters/console-styles.js').factory()

// runners
const DefaultRunnerFactory = require('./src/runners/DefaultRunner.js').factory
const DefaultDiscovererFactory = require('./src/runners/DefaultDiscoverer.js').factory

// resolve the dependency graph
const AsyncTest = new AsyncTestFactory(TestEvent)
const DefaultRunner = new DefaultRunnerFactory(TestEvent, promiseUtils)
const DefaultDiscoverer = new DefaultDiscovererFactory(fs, path)
const reporterFactory = new ReporterFactory({
  TestEvent,
  DefaultPrinter: ConsolePrinter,
  ConsolePrinter,
  TapPrinter,
  BriefPrinter,
  QuietPrinter,
  StreamPrinter,
  NyanPrinter,
  DefaultReporter,
  Reporter,
  consoleStyles
})
const reporters = {
  block: reporterFactory.get('BLOCK'),
  brief: reporterFactory.get('BRIEF'),
  console: reporterFactory.get('CONSOLE'),
  default: reporterFactory.get('DEFAULT'),
  nyan: reporterFactory.get('NYAN'),
  quiet: reporterFactory.get('QUIET'),
  quietTap: reporterFactory.get('QUIET_TAP'),
  tap: reporterFactory.get('TAP')
}
const argumentProcessor = new ArgumentProcessor(reporterFactory)
const args = argumentProcessor.get()
const configDefaults = {
  assertionLibrary: SupposeFactory(assert),
  reporter: args.reporter || reporterFactory.types.DEFAULT,
  match: args.match
}
const Suite = new SuiteFactory(
  DefaultRunner,
  DefaultDiscoverer,
  TestBatch,
  AsyncTest,
  TestEvent,
  configFactory,
  configDefaults,
  reporterFactory,
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
