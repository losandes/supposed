const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('// chainability', {
  'when then is used as an `after` hook for tests (i.e. for cleanup)': {
    when: (given, resolve, reject) => {

    },
    'it should run the after hook': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  },
  'when then is used to run tests in a series': {
    when: (given, resolve, reject) => {

    },
    'they should run in order': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
})
