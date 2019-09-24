module.exports = {
  name: 'makeSuiteConfig',
  factory: (dependencies) => {
    'use strict'

    const { envvars, pubsub, reporterFactory } = dependencies
    const makeSuiteId = () => `S${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`

    const maybeOverrideValueFactory = (suiteConfig, options) => (name, factory) => {
      const value = factory(options)

      if (typeof value !== 'undefined') {
        suiteConfig[name] = value
      }
    }

    const addValues = (suiteConfig, options) => {
      const maybeOverrideValue = maybeOverrideValueFactory(suiteConfig, { ...options })

      maybeOverrideValue('assertionLibrary', (options) => options.assertionLibrary)
      maybeOverrideValue('name', (options) => typeof options.name === 'string' && options.name.trim().length
        ? options.name.trim()
        : undefined
      )
      maybeOverrideValue('timeout', (options) => typeof options.timeout === 'number' && options.timeout > 0
        ? options.timeout
        : undefined
      )
      maybeOverrideValue('useColors', (options) => typeof options.useColors === 'boolean'
        ? options.useColors
        : undefined
      )
      maybeOverrideValue('timeUnits', (options) => typeof options.timeUnits === 'string' && options.timeUnits.trim().length
        ? options.timeUnits.trim().toLowerCase()
        : undefined
      )
      maybeOverrideValue('reportOrder', (options) => typeof options.reportOrder === 'string' &&
        ['deterministic', 'non-deterministic'].indexOf(options.reportOrder.trim().toLowerCase())
        ? options.reportOrder.trim().toLowerCase()
        : undefined
      )
      maybeOverrideValue('match', (options) => {
        if (typeof options.match === 'string') {
          return new RegExp(options.match)
        } else if (options.match && typeof options.match.test === 'function') {
          return options.match
        } else if (options.match === null) {
          // let hard coded options override (I use this in the tests)
          return options.match
        }
      })
      maybeOverrideValue('givenSynonyms', (options) => {
        if (Array.isArray(options.givenSynonyms)) {
          const synonyms = options.givenSynonyms
            .filter((synonym) => typeof synonym === 'string' && synonym.trim().length)
            .map((synonym) => synonym.trim())

          if (synonyms.length) {
            return synonyms
          }
        }
      })
      maybeOverrideValue('whenSynonyms', (options) => {
        if (Array.isArray(options.whenSynonyms)) {
          const synonyms = options.whenSynonyms
            .filter((synonym) => typeof synonym === 'string' && synonym.trim().length)
            .map((synonym) => synonym.trim())

          if (synonyms.length) {
            return synonyms
          }
        }
      })
      maybeOverrideValue('reporters', (options) => {
        const reporters = []

        const makeReporterArray = (input) => {
          return input.split(',').map((reporter) => reporter.trim().toUpperCase())
        }

        const addReporter = (nameOrFunc) => {
          if (typeof nameOrFunc === 'string') {
            const reporter = reporterFactory.get(nameOrFunc)
            reporters.push(reporter)
          } else {
            reporterFactory.add(nameOrFunc)
            addReporter(nameOrFunc.name)
          }
        }

        // reporter: accept strings, functions, or objects
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

        if (reporters.length) {
          return reporters
        }
      })
    }

    const makeSuiteConfig = (options) => {
      const suiteConfig = {
        name: makeSuiteId(),
        timeout: 2000,
        reporters: [reporterFactory.get('LIST')],
        givenSynonyms: ['given', 'arrange'],
        whenSynonyms: ['when', 'act', 'topic']
      }

      // TODO: support flipping the priority, and make envvars the top of the hierarchy
      // this will require that we set the priority in all of the tests for this library
      addValues(suiteConfig, envvars)
      addValues(suiteConfig, options)

      suiteConfig.reporters.forEach(pubsub.subscribe)
      suiteConfig.subscriptions = pubsub.allSubscriptions()
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
