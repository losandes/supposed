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

  const suites = {}
  let supposed = null

  // resolve the dependency graph
  function Supposed (options) {
    const { allSettled } = module.factories.allSettledFactory({})
    const { runTests } = module.factories.runTestsFactory({ allSettled })
    const { TestEvent } = module.factories.TestEventFactory({})
    const { Pubsub } = module.factories.pubsubFactory({
      allSettled,
      isPromise,
      TestEvent
    })
    const { publish, subscribe, subscriptionExists, allSubscriptions } = new Pubsub()

    const envvars = {
      assertionLibrary: {},
      reporters: ['DEFAULT'],
      useColors: true
    }

    const consoleStyles = module.factories.consoleStylesFactory({ envvars }).consoleStyles

    const { TallyFactory } = module.factories.TallyFactory({ publish, TestEvent })
    const { Tally } = TallyFactory()
    const { ReporterFactory } = module.factories.reporterFactoryFactory({})
    const reporterFactory = new ReporterFactory()
    const ArrayReporter = module.factories.ArrayReporterFactory({}).ArrayReporter
    reporterFactory.add(ArrayReporter)
    reporterFactory.add(function QuietReporter () { // legacy
      return { write: new ArrayReporter().write }
    })
    reporterFactory.add(module.factories.NoopReporterFactory({}).NoopReporter)
    reporterFactory.add(Tally)
    subscribe(reporterFactory.get(Tally.name))

    function DefaultFormatter (options) {
      return module.factories.DefaultFormatterFactory({
        consoleStyles,
        TestEvent,
        SYMBOLS: options.SYMBOLS
      }).DefaultFormatter()
    }

    function ConsoleReporter (options) {
      return module.factories.DomReporterFactory({
        TestEvent,
        formatter: options.formatter
      }).DomReporter()
    }

    const symbolFormatter = module.factories.SymbolFormatterFactory({ consoleStyles, DefaultFormatter }).SymbolFormatter()

    reporterFactory.add(function DefaultReporter () {
      return {
        write: ConsoleReporter({ formatter: symbolFormatter }).write
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
    }).add(function JsonReporter () {
      return {
        write: ConsoleReporter({
          formatter: module.factories.JsonFormatterFactory({ TestEvent }).JsonFormatter()
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

    const { AsyncTest } = module.factories.AsyncTestFactory({ isPromise, publish, TestEvent })
    const { BatchComposer } = module.factories.makeBatchFactory({})

    const { makeSuiteConfig } = module.factories.makeSuiteConfigFactory({
      defaults: envvars,
      subscriptionExists,
      subscribe,
      allSubscriptions,
      reporterFactory
    })
    const { Suite } = module.factories.SuiteFactory({
      allSettled,
      AsyncTest,
      BatchComposer,
      makeSuiteConfig,
      publish,
      subscribe,
      reporterFactory,
      runTests,
      Tally,
      TestEvent
    })

    const suite = new Suite(options)
    suite.Suite = Supposed

    if (!suites[suite.config.name]) {
      suites[suite.config.name] = suite
    }
    return suite
  }

  supposed = Supposed({ name: 'supposed' })
  suites.supposed = supposed
  supposed.suites = suites

  window.supposed = supposed
}(window))
