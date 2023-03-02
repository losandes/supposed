module.exports = function (describe, dependencies) {
  const { defaultConfig } = dependencies

  return describe('async tests', {
    'when given returns a promise': {
      given: () => Promise.resolve(42),
      // when: (given) => given,
      'it should resolve the promise': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 42)
      },
    },
    'when given returns a value (not a promise)': {
      given: () => 42,
      // when: (given) => given,
      'it should resolve the value': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 42)
      },
    },
    'when when returns a promise': {
      when: () => Promise.resolve(42),
      'it should resolve the promise': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 42)
      },
    },
    'when when returns a value (not a promise)': {
      when: () => 42,
      'it should resolve the value': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 42)
      },
    },
    'when an assertion returns a promise': {
      when: () => {
        let promiseFinished = false

        return describe.Suite({ ...defaultConfig, ...{ name: 'assertion-promise' } })({
          t1: (t) => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve(42)
              }, 0)
            }).then(actual => {
              t.strictEqual(actual, 42)
              promiseFinished = true
            })
          },
        }).then(results => {
          return {
            results,
            promiseFinished,
          }
        })
      },
      'it should run the asserion asynchronously': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.promiseFinished, true)
        t.strictEqual(actual.results.totals.passed, 1)
      },
    },
    'when an assertion uses async await': {
      when: () => {
        let promiseFinished = false

        return describe.Suite({ ...defaultConfig, ...{ name: 'assertion-async-await' } })({
          t1: async t => {
            const actual = await new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve(42)
              }, 0)
            })

            t.strictEqual(actual, 42)
            promiseFinished = true
          },
        }).then(results => {
          return {
            results,
            promiseFinished,
          }
        })
      },
      'it should run the asserion asynchronously': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results.totals.passed, 1)
        t.strictEqual(actual.promiseFinished, true)
      },
    },
  })
}
