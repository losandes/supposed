const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('ava and tape compatibility', {
  'when a test is described, using the ava and tape syntax': {
    when: (resolve) => {
      sut('ava and tape compatibility', t => {
        t.equal(1, 1)
      }).then(resolve)
    },
    'it should run the tests': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
})
