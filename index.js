'use strict'

// dependencies
const assert = require('assert')
const fs = require('fs')
const path = require('path')

// src
const allSettledFactory = require('./src/all-settled.js').factory
const AsyncTestFactory = require('./src/AsyncTest.js').factory
const HashFactory = require('./src/hash.js').factory
const makeBatchFactory = require('./src/make-batch.js').factory
const makeSuiteConfigFactory = require('./src/make-suite-config.js').factory
const pubsubFactory = require('./src/pubsub.js').factory
const readEnvvarsFactory = require('./src/read-envvars.js').factory
const SuiteFactory = require('./src/Suite.js').factory
const TestEventFactory = require('./src/TestEvent.js').factory
const TimeFactory = require('./src/time.js').factory

// runners
const findFilesFactory = require('./src/runners/find-files.js').factory
const resolveTestsFactory = require('./src/runners/resolve-tests.js').factory
const runServerFactory = require('./src/runners/run-server.js').factory
const makePlansFactory = require('./src/runners/make-plans.js').factory

// formatters
const BlockFormatterFactory = require('./src/formatters/BlockFormatter.js').factory
const BriefFormatterFactory = require('./src/formatters/BriefFormatter.js').factory
const consoleStylesFactory = require('./src/formatters/console-styles.js').factory
const consoleUtilsFactory = require('./src/formatters/console-utils.js').factory
const DefaultFormatterFactory = require('./src/formatters/DefaultFormatter.js').factory
const JsonFormatterFactory = require('./src/formatters/JsonFormatter.js').factory
const MarkdownFormatterFactory = require('./src/formatters/MarkdownFormatter.js').factory
const PerformanceFormatterFactory = require('./src/formatters/PerformanceFormatter.js').factory
const SpecFormatterFactory = require('./src/formatters/SpecFormatter.js').factory
const SummaryFormatterFactory = require('./src/formatters/SummaryFormatter.js').factory
const ListFormatterFactory = require('./src/formatters/ListFormatter.js').factory
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

const REPORT_ORDERS = {
  NON_DETERMINISTIC: 'non-deterministic',
  DETERMINISTIC: 'deterministic'
}
const time = TimeFactory()
const suites = {}
let supposed = null

// resolve the dependency graph
function Supposed (options) {
  const { allSettled } = allSettledFactory({})
  const { readEnvvars } = readEnvvarsFactory({
    isValidUnit: time.isValidUnit,
    isValidReportOrder: (value) => {
      return value === REPORT_ORDERS.NON_DETERMINISTIC || value === REPORT_ORDERS.DETERMINISTIC
    }
  })

  const envvars = {
    ...{
      assertionLibrary: assert,
      useColors: process.stdout.isTTY, // use colors by default if running in a text terminal
      timeUnits: 'us',
      reportOrder: REPORT_ORDERS.NON_DETERMINISTIC
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

  const { ReporterFactory } = ReporterFactoryFactory({})
  const reporterFactory = new ReporterFactory()
  const { makeSuiteConfig } = makeSuiteConfigFactory({
    envvars,
    reporterFactory,
    REPORT_ORDERS
  })
  const config = makeSuiteConfig(options)
  const clock = () => time.clock(config.timeUnits)
  const duration = (start, end) => time.duration(start, end, config.timeUnits)
  const { TestEvent } = TestEventFactory({ clock, envvars: config })
  const { Pubsub } = pubsubFactory({
    allSettled,
    isPromise,
    TestEvent
  })
  // const { publish, subscribe, subscriptionExists, allSubscriptions, reset } = new Pubsub()
  const pubsub = new Pubsub()

  const { findFiles } = findFilesFactory({ fs, path })
  const { resolveTests } = resolveTestsFactory({})
  const { runServer } = runServerFactory({})
  const { makePlans } = makePlansFactory({ allSettled })

  const consoleStyles = consoleStylesFactory({ envvars: config }).consoleStyles
  const consoleUtils = consoleUtilsFactory({}).consoleUtils

  const { TallyFactory } = TallyFactoryFactory({ pubsub, TestEvent, clock, duration })
  const { Tally } = TallyFactory({})
  reporterFactory.add(Tally)
  const ArrayReporter = ArrayReporterFactory({}).ArrayReporter
  reporterFactory.add(ArrayReporter)
  // @deprecated - legacy support
  reporterFactory.add(function QuietReporter () {
    return { write: new ArrayReporter().write }
  })
  reporterFactory.add(NoopReporterFactory({}).NoopReporter)

  function DefaultFormatter (options) {
    return DefaultFormatterFactory({
      consoleStyles,
      TestEvent,
      SYMBOLS: (options && options.SYMBOLS) || {
        PASSED: ' PASS ',
        FAILED: ' FAIL ',
        BROKEN: ' !!!! ',
        SKIPPED: ' SKIP ',
        INFO: ' INFO '
      }
    }).DefaultFormatter()
  }

  function ConsoleReporter (options) {
    return ConsoleReporterFactory({
      TestEvent,
      formatter: options.formatter,
      envvars: config,
      REPORT_ORDERS
    }).ConsoleReporter(options)
  }

  const listFormatter = ListFormatterFactory({ consoleStyles, DefaultFormatter }).ListFormatter()
  const SpecFormatter = SpecFormatterFactory({ consoleStyles, DefaultFormatter, TestEvent }).SpecFormatter

  reporterFactory.add(function ListReporter () {
    return {
      write: ConsoleReporter({ formatter: listFormatter }).write
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
  }).add(function MarkdownReporter () {
    return {
      write: ConsoleReporter({
        formatter: MarkdownFormatterFactory({ consoleStyles, TestEvent, SpecFormatter, DefaultFormatter }).MarkdownFormatter(),
        reportOrder: REPORT_ORDERS.DETERMINISTIC // non-deterministic not supported
      }).write
    }
  }).add(function MdReporter () {
    return {
      write: ConsoleReporter({
        formatter: MarkdownFormatterFactory({ consoleStyles, TestEvent, SpecFormatter, DefaultFormatter }).MarkdownFormatter(),
        reportOrder: REPORT_ORDERS.DETERMINISTIC // non-deterministic not supported
      }).write
    }
  }).add(function PerformanceReporter () {
    return {
      write: ConsoleReporter({
        formatter: PerformanceFormatterFactory({ consoleStyles, TestEvent }).PerformanceFormatter()
      }).write
    }
  }).add(function JustTheDescriptionsReporter () {
    return {
      write: ConsoleReporter({
        formatter: {
          format: (event) => {
            if (event.type === TestEvent.types.TEST) {
              return listFormatter.format(event).split('\n')[0]
            } else {
              return listFormatter.format(event)
            }
          }
        }
      }).write
    }
  }).add(function SpecReporter () {
    return {
      write: ConsoleReporter({
        formatter: new SpecFormatter(),
        reportOrder: REPORT_ORDERS.DETERMINISTIC // non-deterministic not supported
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
  })

  if (process.stdout.isTTY) {
    reporterFactory.add(NyanReporterFactory({
      consoleStyles,
      consoleUtils,
      DefaultFormatter,
      TestEvent
    }).NyanReporter)
  } else {
    reporterFactory.add(function NyanReporter () {
      return {
        write: () => {
          throw new Error('Nyan Reporter Is Only Supported in TTY Terminals (it can\'t be piped)')
        }
      }
    })
  }

  const { AsyncTest } = AsyncTestFactory({
    isPromise,
    pubsub,
    TestEvent,
    clock,
    duration,
    addDurations: time.addDurations
  })
  const { hash } = HashFactory()
  const { BatchComposer } = makeBatchFactory({ hash })

  const { Suite } = SuiteFactory({
    allSettled,
    AsyncTest,
    findFiles,
    BatchComposer,
    makeSuiteConfig,
    pubsub,
    reporterFactory,
    resolveTests,
    runServer,
    makePlans,
    Tally,
    TestEvent,
    envvars: config
  })

  const suite = new Suite()
  suite.Suite = Supposed

  if (!suites[suite.config.name]) {
    suites[suite.config.name] = suite
  }
  return suite
}

supposed = Supposed({ name: 'supposed' })
suites.supposed = supposed
supposed.suites = suites
supposed.time = time

module.exports = supposed
