'use strict'

// dependencies
const assert = require('assert')
const fs = require('fs')
const path = require('path')

// src
const allSettledFactory = require('./src/all-settled.js').factory
const AsyncTestFactory = require('./src/AsyncTest.js').factory
const makeBatchFactory = require('./src/make-batch.js').factory
const makeSuiteConfigFactory = require('./src/make-suite-config.js').factory
const pubsubFactory = require('./src/pubsub.js').factory
const readEnvvarsFactory = require('./src/read-envvars.js').factory
const SuiteFactory = require('./src/Suite.js').factory
const TestEventFactory = require('./src/TestEvent.js').factory

// discovery
const findFilesFactory = require('./src/discovery/find-files.js').factory
const resolveTestsFactory = require('./src/discovery/resolve-tests.js').factory
const runServerFactory = require('./src/discovery/run-server.js').factory
const runTestsFactory = require('./src/discovery/run-tests.js').factory

// formatters
const BlockFormatterFactory = require('./src/formatters/BlockFormatter.js').factory
const consoleStylesFactory = require('./src/formatters/console-styles.js').factory
const consoleUtilsFactory = require('./src/formatters/console-utils.js').factory
const DefaultFormatterFactory = require('./src/formatters/DefaultFormatter.js').factory
const SymbolFormatterFactory = require('./src/formatters/SymbolFormatter.js').factory
const TapFormatterFactory = require('./src/formatters/TapFormatter.js').factory

// reporters
const ArrayReporterFactory = require('./src/reporters/ArrayReporter.js').factory
const BriefReporterFactory = require('./src/reporters/BriefReporter.js').factory
const ConsoleReporterFactory = require('./src/reporters/ConsoleReporter.js').factory
const JsonReporterFactory = require('./src/reporters/JsonReporter.js').factory
const NoopReporterFactory = require('./src/reporters/NoopReporter.js').factory
const NyanReporterFactory = require('./src/reporters/NyanReporter.js').factory
const ReporterFactoryFactory = require('./src/reporters/reporter-factory.js').factory
const TallyFactoryFactory = require('./src/reporters/Tally.js').factory

function isPromise (input) {
  return input && typeof input.then === 'function'
}

let supposed = null

// resolve the dependency graph
function Supposed (options) {
  const { allSettled } = allSettledFactory({})
  const { readEnvvars } = readEnvvarsFactory({})
  const { TestEvent } = TestEventFactory({})
  const { Pubsub } = pubsubFactory({
    allSettled,
    isPromise,
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

  const { findFiles } = findFilesFactory({ fs, path })
  const { resolveTests } = resolveTestsFactory({})
  const { runServer } = runServerFactory({})
  const { runTests } = runTestsFactory({ allSettled })

  const consoleStyles = consoleStylesFactory({ envvars }).consoleStyles
  const consoleUtils = consoleUtilsFactory({}).consoleUtils

  const { TallyFactory } = TallyFactoryFactory({ publish, TestEvent })
  const { Tally } = TallyFactory()
  const { ReporterFactory } = ReporterFactoryFactory({})
  const reporterFactory = new ReporterFactory()
  const ArrayReporter = ArrayReporterFactory({}).ArrayReporter
  reporterFactory.add(ArrayReporter)
  reporterFactory.add(function QuietReporter () { // legacy
    return { write: new ArrayReporter().write }
  })
  reporterFactory.add(JsonReporterFactory({ TestEvent }).JsonReporter)
  reporterFactory.add(NoopReporterFactory({}).NoopReporter)
  reporterFactory.add(Tally)
  subscribe(reporterFactory.get(Tally.name))

  function DefaultFormatter (options) {
    return DefaultFormatterFactory({
      consoleStyles,
      TestEvent,
      SYMBOLS: options.SYMBOLS
    }).DefaultFormatter()
  }

  const blockFormatter = BlockFormatterFactory({ consoleStyles, DefaultFormatter }).BlockFormatter()
  const symbolFormatter = SymbolFormatterFactory({ consoleStyles, DefaultFormatter }).SymbolFormatter()
  const tapFormatter = TapFormatterFactory({ consoleStyles, TestEvent }).TapFormatter()

  function ConsoleReporter (options) {
    return ConsoleReporterFactory({
      TestEvent,
      formatter: options.formatter
    }).ConsoleReporter()
  }

  reporterFactory.add(function DefaultReporter () {
    return {
      write: ConsoleReporter({ formatter: symbolFormatter }).write
    }
  }).add(function BlockReporter () {
    return {
      write: ConsoleReporter({ formatter: blockFormatter }).write
    }
  }).add(function JustTheDescriptionsReporter () {
    return {
      write: ConsoleReporter({
        formatter: {
          format: (event) => symbolFormatter.format(event).split('\n')[0]
        }
      }).write
    }
  }).add(function TapReporter () {
    return {
      write: ConsoleReporter({ formatter: tapFormatter }).write
    }
  }).add(BriefReporterFactory({
    consoleStyles,
    ConsoleReporter,
    DefaultFormatter,
    TestEvent
  }).BriefReporter).add(NyanReporterFactory({
    consoleStyles,
    consoleUtils,
    DefaultFormatter,
    TestEvent
  }).NyanReporter)

  const { AsyncTest } = AsyncTestFactory({ isPromise, publish, TestEvent })
  const { makeBatch } = makeBatchFactory({})

  const { makeSuiteConfig } = makeSuiteConfigFactory({
    defaults: envvars,
    subscriptionExists,
    subscribe,
    allSubscriptions,
    reporterFactory
  })
  const { Suite } = SuiteFactory({
    allSettled,
    AsyncTest,
    findFiles,
    makeBatch,
    makeSuiteConfig,
    publish,
    subscribe,
    reporterFactory,
    resolveTests,
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
