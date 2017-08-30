const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('BDD', {
  'when a given, a when, and then(s) exist': {
    when: (resolve) => {
      sut('assay', {
        'when a given, a when, and thens exist': {
          given: (resolve, reject) => {
            setTimeout(() => { resolve(42) }, 0)
          },
          when: (resolve, reject) => (given) => {
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
    },
    'and the when does not ask for the result of `given`': {
      when: (resolve) => {
        sut('assay', {
          'when a given, a when, and thens exist': {
            given: (resolve, reject) => {
              setTimeout(() => { resolve(42) }, 0)
            },
            when: (resolve, reject) => {
              setTimeout(() => { resolve(43) }, 0)
            },
            'it should run the tests': (t, err, actual) => {
              t.ifError(err)
              t.equal(actual, 43)
            }
          }
        }).then(resolve)
      },
      'it should show as broken': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.passed, 1)
      }
    }
  },
  'when a given, and then(s) exist, but no whens': {
    when: (resolve) => {
      var givenRan = false

      sut('assay', {
        'when a given, a when, and thens exist': {
          given: (resolve, reject) => {
            setTimeout(() => {
              givenRan = true
              resolve()
            }, 0)
          },
          'it should run the tests': (t, err, actual) => {
            t.ifError(err)
            t.equal(givenRan, true)
          }
        }
      }).then(resolve)
    },
    '`given` should be swapped out for `when`': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
})
