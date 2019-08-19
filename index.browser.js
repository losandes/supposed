// Node, or global
;(function (root) { // eslint-disable-line no-extra-semi
  'use strict'

  const module = { factories: {} }

  Object.defineProperty(module, 'exports', {
    get: function () {
      return null
    },
    set: function (val) {
      module.factories[val.name] = val.factory
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  })

  // MODULES_HERE

  // resolve the dependency graph
  ;(() => {
    const AsyncTest = module.factories.AsyncTest(module.factories.TestEvent)
    const DefaultRunner = module.factories.DefaultRunner(module.factories.TestEvent, module.factories.promiseUtils)
    const DefaultReporter = module.factories.DefaultReporter(module.factories.Reporter)
    const consoleStyles = module.factories.consoleStyles({
      noColor: true
    })
    const reporterFactory = module.factories.ReporterFactory({
      TestEvent: module.factories.TestEvent,
      DefaultPrinter: module.factories.DomPrinter,
      DomPrinter: module.factories.DomPrinter,
      ConsolePrinter: module.factories.BrowserConsolePrinter,
      TapPrinter: module.factories.TapPrinter,
      QuietPrinter: module.factories.QuietPrinter,
      DefaultReporter,
      Reporter: module.factories.Reporter,
      consoleStyles,
      StreamPrinter: () => {
        return {
          print: console.log,
          newLine: '\n',
          getWindowSize: () => document.body.clientWidth
        }
      },
      // not implemented
      BriefPrinter: () => { throw new Error('Not Implemented') },
      NyanPrinter: () => { throw new Error('Not Implemented') }
    })
    const reporters = {
      console: reporterFactory.get('CONSOLE'),
      default: reporterFactory.get('DEFAULT'),
      dom: reporterFactory.get('DOM'),
      quiet: reporterFactory.get('QUIET'),
      quietTap: reporterFactory.get('QUIET_TAP'),
      tap: reporterFactory.get('TAP')
    }
    const configDefaults = {
      assertionLibrary: {},
      reporter: 'DefaultBrowserPrinter',
      match: null
    }
    const Suite = new module.factories.Suite(
      DefaultRunner,
      null, // DefaultDiscoverer,
      module.factories.TestBatch,
      AsyncTest,
      module.factories.TestEvent,
      module.factories.configFactory,
      configDefaults,
      reporterFactory,
      reporters
    )

    /**
     * export a default Suite, so consumers don't have to construct anything
     * to use this library. Suite has a `Suite` property on it, so consumers
     * can customize it if they choose to
     */
    root.supposed = Suite()
    root.supposedFactories = module.factories
  })()

  // we don't need these anymore
  delete module.factories
}(window))
