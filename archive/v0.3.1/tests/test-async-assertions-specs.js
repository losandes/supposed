module.exports = function (suite) {
  const { describe } = suite.dependencies
  const sut = describe.Suite({ reporter: 'QUIET', match: null })

  return describe('async tests', {
    'when an assertion returns a promise': {
      when: () => {
        var promiseFinished = false

        return sut({
          t1: t => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve(42)
              }, 0)
            }).then(actual => {
              t.strictEqual(actual, 42)
              promiseFinished = true
            })
          }
        }).then(results => {
          return {
            results: results,
            promiseFinished: promiseFinished
          }
        })
      },
      'it should run the asserion asynchronously': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results.totals.passed, 1)
        t.strictEqual(actual.promiseFinished, true)
      }
    },
    'when an assertion uses async await': {
      when: () => {
        var promiseFinished = false

        return sut({
          t1: async t => {
            const actual = await new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve(42)
              }, 0)
            })

            t.strictEqual(actual, 42)
            promiseFinished = true
          }
        }).then(results => {
          return {
            results: results,
            promiseFinished: promiseFinished
          }
        })
      },
      'it should run the asserion asynchronously': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results.totals.passed, 1)
        t.strictEqual(actual.promiseFinished, true)
      }
    }
  })
}
