module.exports = {
  name: 'run-tests',
  factory: (dependencies) => {
    'use strict'

    const { allSettled, makeDebugger } = dependencies
    const debug = makeDebugger().withSource('run-tests')

    const hasThen = (obj) => {
      return obj && typeof obj.then === 'function'
    }

    const toPromise = (options) => (file) => {
      try {
        const test = require(file)

        if (options.suite && options.injectSuite !== false && typeof test === 'function') {
          const maybePromise = test(options.suite, options.suite.dependencies)
          return hasThen(maybePromise) ? maybePromise : Promise.resolve(maybePromise)
        }

        return Promise.resolve()
      } catch (e) {
        e.filePath = file
        return Promise.reject(e)
      }
    }

    const mapToResults = (options, paths) => (results) => {
      return Object.freeze({
        results: results.filter((result) => result.status === 'fullfilled'),
        broken: results.filter((result) => result.status !== 'fullfilled'),
        files: paths,
        suite: options.suite
      })
    }

    const runTests = (options) => (paths) => {
      if (!paths) {
        throw new Error('run-tests expects paths to the tests to be provided')
      }

      return Promise.resolve(paths.map(toPromise(options)))
        .then(allSettled)
        .then(debug)
        .then(mapToResults(options, paths))
    }

    return { runTests }
  } // /factory
} // /module
