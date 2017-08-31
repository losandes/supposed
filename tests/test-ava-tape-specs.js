const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('ava and tape compatibility', {
  'when a test is described, using the ava and tape syntax': {
    when: (resolve) => {
      sut('ava and tape compatibility', t => {
        t.equal(1, 1)
      }).then(resolve)
    },
    'it should run the tests': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  },
  'when multiple ava styles tests are added to an object': {
    when: (resolve) => {
      sut({
        't1': t => { t.equal(1, 1) },
        't2': t => { t.equal(1, 1) },
        't3': t => { t.equal(1, 1) }
      }).then(resolve)
    },
    'it should provide a way to group tests in a suite, with a single execution': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 3)
    }
  },
  'when an assertion returns a promise': {
    when: (resolve) => {
      var promiseFinished = false

      sut({
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
        resolve({
          results: results,
          promiseFinished: promiseFinished
        })
      })
    },
    'it should run the asserion asynchronously': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.results.totals.passed, 1)
      t.equal(actual.promiseFinished, true)
    }
  }
})
