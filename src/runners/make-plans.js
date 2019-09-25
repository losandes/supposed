module.exports = {
  name: 'makePlans',
  factory: (dependencies) => {
    'use strict'

    const { allSettled } = dependencies

    const hasThen = (obj) => {
      return obj && typeof obj.then === 'function'
    }

    const toPromise = (config, suite) => (input) => {
      let err, test, path

      try {
        if (typeof input === 'function') {
          test = input
        } else if (input) {
          err = input.err
          test = input.test
          path = input.path
        } else {
          throw new Error(`Invalid makePlans entry: expected input ${typeof input} to be a {function}, or { err?: Error; test: Function|Promise; path?: string; }`)
        }

        if (err) {
          err.filePath = path
          return Promise.reject(err)
        }

        if (hasThen(test)) {
          // module.exports = test('something', (t) => {...})
          return test
        } else if (suite && config.injectSuite !== false && typeof test === 'function') {
          // module.exports = function (test) {}
          // export = function (test) {}
          const maybePromise = test(suite, suite.dependencies)
          return hasThen(maybePromise) ? maybePromise : Promise.resolve(maybePromise)
        } else if (
          suite &&
          config.injectSuite !== false &&
          typeof test === 'object' &&
          typeof test.default === 'function'
        ) {
          // export default function (test) {}
          const maybePromise = test.default(suite, suite.dependencies)
          return hasThen(maybePromise) ? maybePromise : Promise.resolve(maybePromise)
        }

        return Promise.resolve()
      } catch (e) {
        e.filePath = path
        return Promise.reject(e)
      }
    }

    const mapToResults = (runConfig, paths = []) => (results) => {
      return {
        files: paths,
        runConfig,
        broken: results
          .filter((result) => result.status !== 'fullfilled')
          .map((result) => result.reason)
      }
    }

    const makePlans = (suite) => (context) => {
      const { runConfig, tests, paths } = context

      if (!tests) {
        throw new Error('run-tests expects tests to be provided')
      }

      return Promise.resolve(tests.map(toPromise(runConfig || context, suite)))
        .then(allSettled)
        .then(mapToResults(runConfig, paths))
    }

    return { makePlans }
  } // /factory
} // /module
