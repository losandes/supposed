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

// runners
const findFilesFactory = require('./src/runners/find-files.js').factory
const resolveTestsFactory = require('./src/runners/resolve-tests.js').factory
const runServerFactory = require('./src/runners/run-server.js').factory
const runTestsFactory = require('./src/runners/run-tests.js').factory

// formatters
const BlockFormatterFactory = require('./src/formatters/BlockFormatter.js').factory
const BriefFormatterFactory = require('./src/formatters/BriefFormatter.js').factory
const consoleStylesFactory = require('./src/formatters/console-styles.js').factory
const consoleUtilsFactory = require('./src/formatters/console-utils.js').factory
const DefaultFormatterFactory = require('./src/formatters/DefaultFormatter.js').factory
const JsonFormatterFactory = require('./src/formatters/JsonFormatter.js').factory
const SummaryFormatterFactory = require('./src/formatters/SummaryFormatter.js').factory
const SymbolFormatterFactory = require('./src/formatters/SymbolFormatter.js').factory
const TapFormatterFactory = require('./src/formatters/TapFormatter.js').factory

// reporters
const ArrayReporterFactory = require('./src/reporters/ArrayReporter.js').factory
const ConsoleReporterFactory = require('./src/reporters/ConsoleReporter.js').factory
const NoopReporterFactory = require('./src/reporters/NoopReporter.js').factory
const NyanReporterFactory = require('./src/reporters/NyanReporter.js').factory
const ReporterFactoryFactory = require('./src/reporters/reporter-factory.js').factory
const TallyFactoryFactory = require('./src/reporters/Tally.js').factory

function isPromise (input) {
  return input && typeof input.then === 'function'
}

const suites = {}
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

  function ConsoleReporter (options) {
    return ConsoleReporterFactory({
      TestEvent,
      formatter: options.formatter
    }).ConsoleReporter()
  }

  const symbolFormatter = SymbolFormatterFactory({ consoleStyles, DefaultFormatter }).SymbolFormatter()

  reporterFactory.add(function DefaultReporter () {
    return {
      write: ConsoleReporter({ formatter: symbolFormatter }).write
    }
  }).add(function BlockReporter () {
    return {
      write: ConsoleReporter({
        formatter: BlockFormatterFactory({ consoleStyles, DefaultFormatter }).BlockFormatter()
      }).write
    }
  }).add(function BriefReporter () {
    return {
      write: ConsoleReporter({
        formatter: BriefFormatterFactory({ consoleStyles, DefaultFormatter, TestEvent }).BriefFormatter()
      }).write
    }
  }).add(function JsonReporter () {
    return {
      write: ConsoleReporter({
        formatter: JsonFormatterFactory({ TestEvent }).JsonFormatter()
      }).write
    }
  }).add(function JustTheDescriptionsReporter () {
    return {
      write: ConsoleReporter({
        formatter: {
          format: (event) => {
            if (event.type === TestEvent.types.TEST) {
              return symbolFormatter.format(event).split('\n')[0]
            } else {
              return symbolFormatter.format(event)
            }
          }
        }
      }).write
    }
  }).add(function SummaryReporter () {
    return {
      write: ConsoleReporter({
        formatter: SummaryFormatterFactory({ consoleStyles, DefaultFormatter, TestEvent }).SummaryFormatter()
      }).write
    }
  }).add(function TapReporter () {
    return {
      write: ConsoleReporter({
        formatter: TapFormatterFactory({ consoleStyles, TestEvent }).TapFormatter()
      }).write
    }
  }).add(NyanReporterFactory({
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

  const suite = new Suite(options, envvars)
  suite.Suite = Supposed

  if (!suites[suite.config.name]) {
    suites[suite.config.name] = suite
  }
  return suite
}

supposed = Supposed({ name: 'supposed' })
suites.supposed = supposed
supposed.suites = suites

module.exports = supposed
