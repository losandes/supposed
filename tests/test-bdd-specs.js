const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('BDD', {
  'when a given, a when, and thens exist': {
    when: (resolve) => {
      sut('assay', {
        'when a given, a when, and thens exist': {
          given: (resolve, reject) => {
            setTimeout(() => { resolve(42) }, 0)
          },
          when: (given) => (resolve, reject) => {
            setTimeout(() => { resolve(given) }, 0)
          },
          'it should run the tests': (t, err, actual) => {
            t.ifError(err)
            t.equal(actual, 42)
          }
        }
      }).then(resolve)
    },
    'given should produce to when, which should produce to the assertions': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
})
