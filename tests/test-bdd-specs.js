const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('// BDD', {
  'when a given, a when, and thens exist': {
    given: (resolve, reject) => {

    },
    when: (given, resolve, reject) => {

    },
    'it should run the tests': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
})
