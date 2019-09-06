module.exports = {
  name: 'makeSuiteConfig',
  factory: (dependencies) => {
    'use strict'

    const { defaults, subscribe, subscriptionExists, allSubscriptions, reporterFactory } = dependencies
    const makeSuiteId = () => `S${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`

    const makeSuiteConfig = (options) => {
      const suiteConfig = {
        assertionLibrary: defaults.assertionLibrary,
        match: defaults.match,
        name: makeSuiteId(),
        timeout: 2000,
        reporters: []
      }
      options = { ...options }

      ;[
        'assertionLibrary',
        'match',
        'name',
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
          suiteConfig.reporters.push(reporter)
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
        addReporter(function CustomReporter () {
          return { write: options.reporter }
        })
      } else if (options.reporter && typeof options.reporter.report === 'function') {
        addReporter(function CustomReporter () {
          return { write: options.reporter.report }
        })
      } else if (options.reporter && typeof options.reporter.write === 'function') {
        addReporter(function CustomReporter () {
          return { write: options.reporter.write }
        })
      }

      if (!suiteConfig.reporters.length) {
        defaults.reporters.forEach(addReporter)
      }

      suiteConfig.subscriptions = allSubscriptions()

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
