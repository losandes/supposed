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
        reporters: [],
        givenSynonyms: ['given', 'arrange'],
        whenSynonyms: ['when', 'act', 'topic']
      }
      options = { ...options }

      if (options.assertionLibrary) {
        suiteConfig.assertionLibrary = options.assertionLibrary
      }

      if (typeof options.match === 'string') {
        suiteConfig.match = new RegExp(options.match)
      } else if (options.match && typeof options.match.test === 'function') {
        suiteConfig.match = options.match
      }

      if (typeof options.name === 'string' && options.name.trim().length) {
        suiteConfig.name = options.name.trim()
      }

      if (typeof options.timeout === 'number' && options.timeout > 0) {
        suiteConfig.timeout = options.timeout
      }

      if (typeof options.useColors === 'boolean') {
        suiteConfig.useColors = options.useColors
      }

      if (Array.isArray(options.givenSynonyms)) {
        const synonyms = options.givenSynonyms
          .filter((synonym) => typeof synonym === 'string' && synonym.trim().length)
          .map((synonym) => synonym.trim())

        if (synonyms.length) {
          suiteConfig.givenSynonyms = synonyms
        }
      }

      if (Array.isArray(options.whenSynonyms)) {
        const synonyms = options.whenSynonyms
          .filter((synonym) => typeof synonym === 'string' && synonym.trim().length)
          .map((synonym) => synonym.trim())

        if (synonyms.length) {
          suiteConfig.whenSynonyms = synonyms
        }
      }

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

      // reporters: accept strings, functions, or objects
      if (typeof options.reporter === 'string') {
        makeReporterArray(options.reporter).forEach(addReporter)
      } else if (typeof options.reporter === 'function') {
        addReporter(function CustomReporter () {
          return { write: options.reporter }
        })
      } else if (options.reporter && typeof options.reporter.report === 'function') {
        // legacy
        addReporter(function CustomReporter () {
          return { write: options.reporter.report }
        })
      } else if (options.reporter && typeof options.reporter.write === 'function') {
        addReporter(function CustomReporter () {
          return { write: options.reporter.write }
        })
      }

      // reporters: accept strings, or arrays
      if (typeof options.reporters === 'string') {
        makeReporterArray(options.reporters).forEach(addReporter)
      } else if (Array.isArray(options.reporters)) {
        options.reporters.forEach(addReporter)
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
