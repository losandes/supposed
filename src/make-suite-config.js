module.exports = {
  name: 'makeSuiteConfig',
  factory: (dependencies) => {
    'use strict'

    const { envvars, reporterFactory, REPORT_ORDERS } = dependencies
    const makeSuiteId = () => `S${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`

    const maybeOverrideValueFactory = (suiteConfig, options) => (name, factory) => {
      const value = factory(options)

      if (typeof value !== 'undefined') {
        suiteConfig[name] = value
      }
    }

    const getType = (obj) => Object.prototype.toString.call(obj)
      .replace(/(^\[object )|(\]$)/g, '')
      .toLowerCase()
    const isDefined = (obj) => typeof obj !== 'undefined' && obj !== null
    const parseSynonyms = (propName, input) => {
      const synonyms = input
        .filter((synonym) => typeof synonym === 'string' && synonym.trim().length)
        .map((synonym) => synonym.trim())

      const errors = input
        .filter((synonym) => typeof synonym !== 'string' || !synonym.trim().length)
        .map((synonym) => `Invalid ${propName}: expected {${typeof synonym}} to be a non-empty {string}`)

      return { synonyms, errors }
    }

    const addValues = (suiteConfig, options) => {
      const maybeOverrideValue = maybeOverrideValueFactory(suiteConfig, { ...options })
      const validationErrors = []

      maybeOverrideValue('assertionLibrary', (options) => options.assertionLibrary)
      maybeOverrideValue('inject', (options) => options.inject)
      maybeOverrideValue('name', (options) => {
        if (typeof options.name === 'string' && options.name.trim().length) {
          return options.name.trim()
        } else if (isDefined(options.name)) {
          validationErrors.push(`Invalid name: expected {${typeof options.name}} to be a {string}`)
        }
      })
      maybeOverrideValue('timeout', (options) => {
        if (typeof options.timeout === 'number' && options.timeout > 0) {
          return options.timeout
        } else if (isDefined(options.timeout)) {
          validationErrors.push(`Invalid timeout: expected {${typeof options.timeout}} to be a {number} greater than 0`)
        }
      })
      maybeOverrideValue('planBuffer', (options) => {
        if (typeof options.planBuffer === 'number' && options.planBuffer > 0) {
          return options.planBuffer
        } else if (isDefined(options.planBuffer)) {
          validationErrors.push(`Invalid planBuffer: expected {${typeof options.planBuffer}} to be a {number} greater than 0`)
        }
      })
      maybeOverrideValue('useColors', (options) => {
        if (typeof options.useColors === 'boolean') {
          return options.useColors
        } else if (options.useColors === 0) {
          return false
        } else if (options.useColors === 1) {
          return true
        } else if (isDefined(options.useColors)) {
          validationErrors.push(`Invalid useColors: expected {${typeof options.useColors}} to be {boolean}`)
        }
      })
      maybeOverrideValue('suppressLogs', (options) => {
        if (typeof options.suppressLogs === 'boolean') {
          return options.suppressLogs
        } else if (options.suppressLogs === 0) {
          return false
        } else if (options.suppressLogs === 1) {
          return true
        } else if (isDefined(options.suppressLogs)) {
          validationErrors.push(`Invalid suppressLogs: expected {${typeof options.suppressLogs}} to be {boolean}`)
        }
      })
      maybeOverrideValue('timeUnits', (options) => {
        if (typeof options.timeUnits === 'string') {
          if (['s', 'ms', 'us', 'ns'].indexOf(options.timeUnits.trim().toLowerCase()) > -1) {
            return options.timeUnits.trim().toLowerCase()
          } else {
            validationErrors.push(`Invalid timeUnits: expected {${options.timeUnits}} to be {'s'|'ms'|'us'|'ns'}`)
          }
        } else if (isDefined(options.timeUnits)) {
          validationErrors.push(`Invalid timeUnits: expected {${typeof options.timeUnits}} to be {'s'|'ms'|'us'|'ns'}`)
        }
      })
      maybeOverrideValue('reportOrder', (options) => {
        if (typeof options.reportOrder === 'string') {
          if (
            [REPORT_ORDERS.DETERMINISTIC, REPORT_ORDERS.NON_DETERMINISTIC]
              .indexOf(options.reportOrder.trim().toLowerCase()) > -1
          ) {
            return options.reportOrder.trim().toLowerCase()
          } else {
            validationErrors.push(`Invalid reportOrder: expected {${options.reportOrder}} to be {'${REPORT_ORDERS.DETERMINISTIC}'|'${REPORT_ORDERS.NON_DETERMINISTIC}'}`)
          }
        } else if (isDefined(options.reportOrder)) {
          validationErrors.push(`Invalid reportOrder: expected {${typeof options.reportOrder}} to be {'${REPORT_ORDERS.DETERMINISTIC}'|'${REPORT_ORDERS.NON_DETERMINISTIC}'}`)
        }
      })
      maybeOverrideValue('match', (options) => {
        if (typeof options.match === 'string') {
          return new RegExp(options.match)
        } else if (options.match && typeof options.match.test === 'function') {
          return options.match
        } else if (options.match === null) {
          // let hard coded options override (I use this in the tests)
          return options.match
        } else if (isDefined(options.match)) {
          validationErrors.push(`Invalid match: expected {${typeof options.match}} to be {string|{ test (behavior: string): boolean}}`)
        }
      })
      maybeOverrideValue('file', (options) => {
        if (typeof options.file === 'string') {
          return new RegExp(options.file)
        } else if (options.file && typeof options.file.test === 'function') {
          return options.file
        } else if (options.file === null) {
          // let hard coded options override (I use this in the tests)
          return options.file
        } else if (isDefined(options.file)) {
          validationErrors.push(`Invalid file: expected {${typeof options.file}} to be {string|{ test (fileName: string): boolean}}`)
        }
      })
      maybeOverrideValue('givenSynonyms', (options) => {
        if (Array.isArray(options.givenSynonyms)) {
          const { synonyms, errors } = parseSynonyms('givenSynonym', options.givenSynonyms)

          if (errors.length) {
            errors.forEach((message) => validationErrors.push(message))
          }

          if (synonyms.length) {
            return synonyms
          }
        } else if (isDefined(options.givenSynonyms)) {
          validationErrors.push(`Invalid givenSynonyms: expected {${options.givenSynonyms.join(',')}} to be a {string[]}`)
        }
      })
      maybeOverrideValue('whenSynonyms', (options) => {
        if (Array.isArray(options.whenSynonyms)) {
          const { synonyms, errors } = parseSynonyms('whenSynonym', options.whenSynonyms)

          if (errors.length) {
            errors.forEach((message) => validationErrors.push(message))
          }

          if (synonyms.length) {
            return synonyms
          }
        } else if (isDefined(options.whenSynonyms)) {
          validationErrors.push(`Invalid whenSynonyms: expected {${options.whenSynonyms.join(',')}} to be a {string[]}`)
        }
      })
      maybeOverrideValue('verbosity', (options) => {
        if (typeof options.verbosity === 'string') {
          const verbosity = options.verbosity.trim().toLowerCase()

          if (['debug', 'info'].indexOf(verbosity) > -1) {
            return verbosity
          } else {
            throw new Error(`Invalid verbosity: expected {${verbosity}} to be {'debug'|'info'}`)
          }
        } else if (isDefined(options.verbosity)) {
          validationErrors.push(`Invalid verbosity: expected {${typeof options.verbosity}} to be {'debug'|'info'}`)
        }
      })
      maybeOverrideValue('exit', (options) => {
        if (['function', 'promise', 'asyncfunction'].indexOf(getType(options.exit)) > -1) {
          return options.exit
        } else if (isDefined(options.exit)) {
          validationErrors.push(`Invalid exit: expected {${getType(options.exit)}} to be {'function'|'promise'|'asyncfunction'}`)
        }
      })

      if (validationErrors.length) {
        throw new Error(validationErrors.join(', '))
      }
    } // /addValues

    const addReporters = (suiteConfig, options) => {
      const maybeOverrideValue = maybeOverrideValueFactory(suiteConfig, { ...options })

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
        planBuffer: 5,
        reporters: [],
        givenSynonyms: ['given', 'arrange'],
        whenSynonyms: ['when', 'act', 'topic'],
        verbosity: 'info'
      }

      // TODO: support flipping the priority, and make envvars the top of the hierarchy
      // this will require that we set the priority in all of the tests for this library
      addValues(suiteConfig, envvars)
      addValues(suiteConfig, options)

      suiteConfig.registerReporters = () => {
        addReporters(suiteConfig, { reporter: 'LIST' })
        addReporters(suiteConfig, envvars)
        addReporters(suiteConfig, options)
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
