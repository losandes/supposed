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
  let supposed = null

  // resolve the dependency graph
  function Supposed (options) {
    const { makeDebugger } = module.factories.makeDebuggerFactory()
    const { allSettled } = module.factories.allSettledFactory({ makeDebugger })
    const { TestEvent } = module.factories.TestEventFactory({ makeDebugger })
    const { Pubsub } = module.factories.pubsubFactory({
      allSettled,
      makeDebugger,
      TestEvent
    })
    const { publish, subscribe, subscriptionExists, allSubscriptions } = new Pubsub()

    const envvars = {
      assertionLibrary: {},
      reporters: ['DEFAULT'],
      useColors: true
    }

    const consoleStyles = module.factories.consoleStylesFactory({ envvars, makeDebugger }).consoleStyles

    const { TallyFactory } = module.factories.TallyFactory({ publish, TestEvent, makeDebugger })
    const { Tally } = TallyFactory()
    const { ReporterFactory } = module.factories.reporterFactory({ makeDebugger })
    const reporterFactory = new ReporterFactory()
    const ArrayReporter = module.factories.ArrayReporterFactory({ makeDebugger }).ArrayReporter
    reporterFactory.add(ArrayReporter)
    reporterFactory.add(function QuietReporter () { // legacy
      return { write: new ArrayReporter().write }
    })
    reporterFactory.add(module.factories.JsonReporterFactory({ makeDebugger, TestEvent }).JsonReporter)
    reporterFactory.add(module.factories.NoopReporterFactory({ makeDebugger }).NoopReporter)
    reporterFactory.add(Tally)
    subscribe(reporterFactory.get(Tally.name))

    function DefaultFormatter (options) {
      return module.factories.DefaultFormatterFactory({
        consoleStyles,
        makeDebugger,
        TestEvent,
        SYMBOLS: options.SYMBOLS
      }).DefaultFormatter()
    }

    function ConsoleReporter (options) {
      return module.factories.ConsoleReporterFactory({
        makeDebugger,
        TestEvent,
        formatter: options.formatter
      }).ConsoleReporter()
    }

    reporterFactory.add(module.factories.DefaultReporterFactory({
      consoleStyles,
      ConsoleReporter,
      DefaultFormatter
    }).DefaultReporter).add(module.factories.BlockReporterFactory({
      consoleStyles,
      ConsoleReporter,
      DefaultFormatter
    }).BlockReporter).add(module.factories.BriefReporterFactory({
      consoleStyles,
      ConsoleReporter,
      DefaultFormatter,
      TestEvent
    }).BriefReporter).add(function TapReporter () {
      const write = ConsoleReporter({
        formatter: module.factories.TapFormatterFactory({ consoleStyles, makeDebugger, TestEvent }).TapFormatter()
      }).write

      return { write }
    })

    const { AsyncTest } = module.factories.AsyncTestFactory({ TestEvent, publish, makeDebugger })
    const { makeBatch } = module.factories.makeBatchFactory({ makeDebugger })

    const { makeSuiteConfig } = module.factories.makeSuiteConfigFactory({
      defaults: envvars,
      subscriptionExists,
      subscribe,
      allSubscriptions,
      reporterFactory,
      makeDebugger
    })
    const { Suite } = module.factories.SuiteFactory({
      allSettled,
      AsyncTest,
      makeBatch,
      makeDebugger,
      makeSuiteConfig,
      publish,
      subscribe,
      reporterFactory,
      Tally,
      TestEvent
    })

    const suite = new Suite(options)
    suite.Suite = Supposed

    // suite.runner is for the terminal only
    delete suite.runner

    if (supposed && supposed.suites) {
      supposed.suites.push(suite)
    }
    return suite
  }

  supposed = Supposed()
  supposed.suites = [supposed]

  window.supposed = supposed

  // we don't need these anymore
  delete module.factories
}(window))
