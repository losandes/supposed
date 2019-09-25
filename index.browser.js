// Node, or global
;(function (root) { // eslint-disable-line no-extra-semi
  'use strict'

  const module = { factories: {} }

  Object.defineProperty(module, 'exports', {
    get: function () {
      return null
    },
    set: function (val) {
      module.factories[`${val.name}Factory`] = val.factory
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  })

  // MODULES_HERE

  // resolve the dependency graph
  function isPromise (input) {
    return input && typeof input.then === 'function'
  }

  const REPORT_ORDERS = {
    NON_DETERMINISTIC: 'non-deterministic',
    DETERMINISTIC: 'deterministic'
  }
  const time = module.factories.timeFactory()
  const suites = {}
  let supposed = null

  // resolve the dependency graph
  function Supposed (options) {
    const { allSettled } = module.factories.allSettledFactory({})
    const { makePlans } = module.factories.makePlansFactory({ allSettled })

    const envvars = {
      assertionLibrary: {},
      reporters: ['LIST'],
      useColors: true,
      timeUnits: 'us',
      reportOrder: REPORT_ORDERS.NON_DETERMINISTIC,
      exit: (results) => results
    }

    const { ReporterFactory } = module.factories.reporterFactoryFactory({})
    const reporterFactory = new ReporterFactory()
    const { makeSuiteConfig } = module.factories.makeSuiteConfigFactory({
      envvars,
      reporterFactory,
      REPORT_ORDERS
    })
    const config = makeSuiteConfig(options)
    const clock = (timeUnits) => time.clock(timeUnits || config.timeUnits)
    const duration = (start, end) => time.duration(start, end, config.timeUnits)
    const { TestEvent } = module.factories.TestEventFactory({ clock, envvars: config })
    const { Pubsub } = module.factories.pubsubFactory({
      allSettled,
      isPromise,
      TestEvent
    })
    const pubsub = new Pubsub()

    const consoleStyles = module.factories.consoleStylesFactory({ envvars: config }).consoleStyles

    const { TallyFactory } = module.factories.TallyFactory({ pubsub, TestEvent, clock, duration })
    const { Tally } = TallyFactory({})
    reporterFactory.add(Tally)
    const ArrayReporter = module.factories.ArrayReporterFactory({}).ArrayReporter
    reporterFactory.add(ArrayReporter)
    // @deprecated - legacy support
    reporterFactory.add(function QuietReporter () { // legacy
      return { write: new ArrayReporter().write }
    })
    reporterFactory.add(module.factories.NoopReporterFactory({}).NoopReporter)

    function DefaultFormatter (options) {
      return module.factories.DefaultFormatterFactory({
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
      return module.factories.DomReporterFactory({
        TestEvent,
        formatter: options.formatter,
        envvars: config,
        REPORT_ORDERS
      }).DomReporter(options)
    }

    const listFormatter = module.factories.ListFormatterFactory({ consoleStyles, DefaultFormatter }).ListFormatter()
    const SpecFormatter = module.factories.SpecFormatterFactory({ consoleStyles, DefaultFormatter, TestEvent }).SpecFormatter

    reporterFactory.add(function ListReporter () {
      return {
        write: ConsoleReporter({ formatter: listFormatter }).write
      }
    }).add(function BlockReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.BlockFormatterFactory({ consoleStyles, DefaultFormatter }).BlockFormatter()
        }).write
      }
    }).add(function BriefReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.BriefFormatterFactory({ consoleStyles, DefaultFormatter, TestEvent }).BriefFormatter()
        }).write
      }
    }).add(function CsvReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.CsvFormatterFactory({ TestEvent }).CsvFormatter()
        }).write
      }
    }).add(function EventReporter () {
      return {
        write: ConsoleReporter({
          formatter: { format: (event) => JSON.stringify(event, null, 2) }
        }).write
      }
    }).add(function JsonReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.JsonFormatterFactory({ TestEvent }).JsonFormatter()
        }).write
      }
    }).add(function MarkdownReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.MarkdownFormatterFactory({ consoleStyles, TestEvent, SpecFormatter, DefaultFormatter }).MarkdownFormatter(),
          reportOrder: REPORT_ORDERS.DETERMINISTIC // non-deterministic not supported
        }).write
      }
    }).add(function MdReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.MarkdownFormatterFactory({ consoleStyles, TestEvent, SpecFormatter, DefaultFormatter }).MarkdownFormatter(),
          reportOrder: REPORT_ORDERS.DETERMINISTIC // non-deterministic not supported
        }).write
      }
    }).add(function PerformanceReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.PerformanceFormatterFactory({ consoleStyles, TestEvent }).PerformanceFormatter()
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
          formatter: SpecFormatter(),
          reportOrder: REPORT_ORDERS.DETERMINISTIC // non-deterministic not supported
        }).write
      }
    }).add(function SummaryReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.SummaryFormatterFactory({
            consoleStyles,
            DefaultFormatter,
            TestEvent
          }).SummaryFormatter()
        }).write
      }
    }).add(function TapReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.TapFormatterFactory({ consoleStyles, TestEvent }).TapFormatter()
        }).write
      }
    })

    const { AsyncTest } = module.factories.AsyncTestFactory({
      isPromise,
      pubsub,
      TestEvent,
      clock,
      duration,
      addDurations: time.addDurations
    })
    const { hash } = module.factories.hashFactory()
    const { BatchComposer } = module.factories.makeBatchFactory({ hash })
    const { Suite } = module.factories.SuiteFactory({
      allSettled,
      AsyncTest,
      BatchComposer,
      makeSuiteConfig,
      pubsub,
      reporterFactory,
      makePlans,
      Tally,
      TestEvent,
      clock,
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

  window.supposed = supposed
}(window))
