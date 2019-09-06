'use strict'

// dependencies
const assert = require('assert')
const fs = require('fs')
const path = require('path')

// src
const allSettledFactory = require('./src/all-settled.js').factory
const AsyncTestFactory = require('./src/AsyncTest.js').factory
const makeBatchFactory = require('./src/make-batch.js').factory
const makeDebuggerFactory = require('./src/make-debugger.js').factory
const makeSuiteConfigFactory = require('./src/make-suite-config.js').factory
const pubsubFactory = require('./src/pubsub.js').factory
const readEnvvarsFactory = require('./src/read-envvars.js').factory
const SuiteFactory = require('./src/Suite.js').factory
const TestEventFactory = require('./src/TestEvent.js').factory

// discovery
const findFilesFactory = require('./src/discovery/find-files.js').factory
const runServerFactory = require('./src/discovery/run-server.js').factory
const runTestsFactory = require('./src/discovery/run-tests.js').factory

// formatters
const consoleStylesFactory = require('./src/formatters/console-styles.js').factory
const consoleUtilsFactory = require('./src/formatters/console-utils.js').factory
const DefaultFormatterFactory = require('./src/formatters/DefaultFormatter.js').factory
const TapFormatterFactory = require('./src/formatters/TapFormatter.js').factory

// reporters
const ArrayReporterFactory = require('./src/reporters/ArrayReporter.js').factory
const BlockReporterFactory = require('./src/reporters/BlockReporter.js').factory
const BriefReporterFactory = require('./src/reporters/BriefReporter.js').factory
const ConsoleReporterFactory = require('./src/reporters/ConsoleReporter.js').factory
const DefaultReporterFactory = require('./src/reporters/DefaultReporter.js').factory
const JsonReporterFactory = require('./src/reporters/JsonReporter.js').factory
const NoopReporterFactory = require('./src/reporters/NoopReporter.js').factory
const NyanReporterFactory = require('./src/reporters/NyanReporter.js').factory
const ReporterFactoryFactory = require('./src/reporters/reporter-factory.js').factory
const TallyFactoryFactory = require('./src/reporters/Tally.js').factory

let supposed = null

// resolve the dependency graph
function Supposed (options) {
  const { makeDebugger } = makeDebuggerFactory()
  const { allSettled } = allSettledFactory({ makeDebugger })
  const { readEnvvars } = readEnvvarsFactory({ makeDebugger })
  const { TestEvent } = TestEventFactory({ makeDebugger })
  const { Pubsub } = pubsubFactory({
    allSettled,
    makeDebugger,
    TestEvent
  })
  const { publish, subscribe, subscriptionExists, allSubscriptions } = new Pubsub()

  const envvars = {
    ...{
      assertionLibrary: assert,
      reporters: ['DEFAULT'],
      useColors: true
    },
    ...(() => {
      const output = {}
      const envvars = readEnvvars()

      Object.keys(envvars).forEach((key) => {
        if (typeof envvars[key] !== 'undefined') {
          output[key] = envvars[key]
        }
      })

      return output
    })()
  }

  const { findFiles } = findFilesFactory({ fs, path, makeDebugger })
  const { runServer } = runServerFactory({ makeDebugger })
  const { runTests } = runTestsFactory({ allSettled, makeDebugger })

  const consoleStyles = consoleStylesFactory({ envvars, makeDebugger }).consoleStyles
  const consoleUtils = consoleUtilsFactory({ makeDebugger }).consoleUtils

  const { TallyFactory } = TallyFactoryFactory({ publish, TestEvent, makeDebugger })
  const { Tally } = TallyFactory()
  const { ReporterFactory } = ReporterFactoryFactory({ makeDebugger })
  const reporterFactory = new ReporterFactory()
  const ArrayReporter = ArrayReporterFactory({ makeDebugger }).ArrayReporter
  reporterFactory.add(ArrayReporter)
  reporterFactory.add(function QuietReporter () { // legacy
    return { write: new ArrayReporter().write }
  })
  reporterFactory.add(JsonReporterFactory({ makeDebugger, TestEvent }).JsonReporter)
  reporterFactory.add(NoopReporterFactory({ makeDebugger }).NoopReporter)
  reporterFactory.add(Tally)
  subscribe(reporterFactory.get(Tally.name))

  function DefaultFormatter (options) {
    return DefaultFormatterFactory({
      consoleStyles,
      makeDebugger,
      TestEvent,
      SYMBOLS: options.SYMBOLS
    }).DefaultFormatter()
  }

  function ConsoleReporter (options) {
    return ConsoleReporterFactory({
      makeDebugger,
      TestEvent,
      formatter: options.formatter
    }).ConsoleReporter()
  }

  reporterFactory.add(DefaultReporterFactory({
    consoleStyles,
    ConsoleReporter,
    DefaultFormatter
  }).DefaultReporter).add(BlockReporterFactory({
    consoleStyles,
    ConsoleReporter,
    DefaultFormatter
  }).BlockReporter).add(BriefReporterFactory({
    consoleStyles,
    ConsoleReporter,
    DefaultFormatter,
    TestEvent
  }).BriefReporter).add(NyanReporterFactory({
    consoleStyles,
    consoleUtils,
    DefaultFormatter,
    TestEvent
  }).NyanReporter).add(function TapReporter () {
    const write = ConsoleReporter({
      formatter: TapFormatterFactory({ consoleStyles, makeDebugger, TestEvent }).TapFormatter()
    }).write

    return { write }
  })

  const { AsyncTest } = AsyncTestFactory({ TestEvent, publish, makeDebugger })
  const { makeBatch } = makeBatchFactory({ makeDebugger })

  const { makeSuiteConfig } = makeSuiteConfigFactory({
    defaults: envvars,
    subscriptionExists,
    subscribe,
    allSubscriptions,
    reporterFactory,
    makeDebugger
  })
  const { Suite } = SuiteFactory({
    allSettled,
    AsyncTest,
    findFiles,
    makeBatch,
    makeDebugger,
    makeSuiteConfig,
    publish,
    subscribe,
    reporterFactory,
    runServer,
    runTests,
    Tally,
    TestEvent
  })

  const suite = new Suite(options)
  suite.Suite = Supposed

  if (supposed && supposed.suites) {
    supposed.suites.push(suite)
  }
  return suite
}

supposed = Supposed()
supposed.suites = [supposed]

module.exports = supposed
