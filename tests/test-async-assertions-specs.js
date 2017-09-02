const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('async tests', {
  'when an assertion returns a promise': {
    when: () => {
      var promiseFinished = false

      return sut({
        't1': t => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(42)
            }, 0)
          }).then(actual => {
            t.equal(actual, 42)
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
      t.equal(actual.results.totals.passed, 1)
      t.equal(actual.promiseFinished, true)
    }
  },
  'when an assertion uses async await': {
    when: () => {
      var promiseFinished = false

      return sut({
        't1': async t => {
          const actual = await new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(42)
            }, 0)
          })

          t.equal(actual, 42)
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
      t.equal(actual.results.totals.passed, 1)
      t.equal(actual.promiseFinished, true)
    }
  }
})
