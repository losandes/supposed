module.exports = {
  name: 'runTests',
  factory: (dependencies) => {
    'use strict'

    const { allSettled, makeDebugger } = dependencies
    const debug = makeDebugger().withSource('run-tests')

    const hasThen = (obj) => {
      return obj && typeof obj.then === 'function'
    }

    const toPromise = (config, suite) => (file) => {
      try {
        const test = require(file)

        if (suite && config.injectSuite !== false && typeof test === 'function') {
          const maybePromise = test(suite, suite.dependencies)
          return hasThen(maybePromise) ? maybePromise : Promise.resolve(maybePromise)
        }

        return Promise.resolve()
      } catch (e) {
        e.filePath = file
        return Promise.reject(e)
      }
    }

    const mapToResults = (config, paths) => (results) => {
      return Object.freeze({
        results: results
          .filter((result) => result.status === 'fullfilled')
          .map((result) => result.value),
        broken: results
          .filter((result) => result.status !== 'fullfilled')
          .map((result) => result.reason),
        files: paths,
        config
      })
    }

    const runTests = (suite) => (context) => {
      const { config, paths } = context

      if (!paths) {
        throw new Error('run-tests expects paths to the tests to be provided')
      }

      return Promise.resolve(paths.map(toPromise(config, suite)))
        .then(allSettled)
        .then(debug)
        .then(mapToResults(config, paths))
    }

    return { runTests }
  } // /factory
} // /module
