module.exports = {
  name: 'make-suite-config',
  factory: (dependencies) => {
    'use strict'

    const { defaults, makeDebugger, subscribe, subscriptionExists, reporterFactory } = dependencies
    const debug = makeDebugger().withSource('make-suite-config')

    const makeSuiteConfig = (options) => {
      const suiteConfig = {
        assertionLibrary: defaults.assertionLibrary,
        match: defaults.match,
        timeout: 2000,
        reporters: []
      }
      options = { ...options }
      debug({
        suiteConfig: {
          assertionLibrary: typeof suiteConfig.assertionLibrary,
          match: suiteConfig.match,
          timeout: suiteConfig.timeout,
          reporters: suiteConfig.reporters
        },
        options: {
          assertionLibrary: typeof options.assertionLibrary,
          match: options.match,
          timeout: options.timeout,
          reporter: typeof options.reporter,
          reporters: options.reporters
        }
      })

      ;[
        'assertionLibrary',
        'match',
        'timeout'
      ].forEach((item) => {
        if (typeof options[item] !== 'undefined') {
          suiteConfig[item] = options[item]
        }
      })

      const makeReporterArray = (input) => {
        return input.split(',').map((reporter) => reporter.trim().toUpperCase())
      }

      const addReporter = (nameOrFunc) => {
        if (typeof nameOrFunc === 'string') {
          const reporter = reporterFactory.get(nameOrFunc)

          if (!subscriptionExists(reporter.name)) {
            subscribe(reporter)
          }
        } else {
          reporterFactory.add(nameOrFunc)
          addReporter(nameOrFunc.name)
        }
      }

      // accept strings or functions in the reporter and reporters properties
      if (typeof options.reporter === 'string') {
        makeReporterArray(options.reporter).forEach(addReporter)
      } else if (typeof options.reporters === 'string') {
        makeReporterArray(options.reporters).forEach(addReporter)
      } else if (Array.isArray(options.reporters)) {
        options.reporters.forEach(addReporter)
      } else if (typeof options.reporter === 'function') {
        addReporter(options.reporter)
      }

      if (!suiteConfig.reporters.length) {
        defaults.reporters.forEach(addReporter)
      }

      suiteConfig.makeTheoryConfig = (theory) => {
        theory = { ...theory }

        return {
          timeout: theory.timeout || suiteConfig.timeout,
          assertionLibrary: theory.assertionLibrary || suiteConfig.assertionLibrary
        }
      }

      return suiteConfig
    } // /makeSuiteConfig

    return { makeSuiteConfig }
  } // /factory
} // /module
