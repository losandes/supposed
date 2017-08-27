const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('// AAA', {
  'when an arrange, an act, and asserts exist': {
    arrange: (resolve, reject) => {

    },
    act: (arranged, resolve, reject) => {

    },
    'it should run the tests': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
})
