const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('chainability', {
  'when then is used as an `after` hook for tests (i.e. for cleanup)': {
    when: (resolve, reject) => {
      sut('sut', {
        'sut-description': {
          when: (resolve) => { resolve(42) },
          'sut-assertion': (t, err, actual) => {
            t.equal(actual, 42)
          }
        }
      }).then(results => {
        setTimeout(() => {
          resolve('hello world!')
        }, 2)
      })
    },
    'it should run the after hook': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual, 'hello world!')
    }
  },
  'when then is used to run tests in a series': {
    when: (resolve, reject) => {
      sut('sut', {
        'sut-description': {
          when: (resolve) => { resolve(42) },
          'sut-assertion': (t, err, actual) => {
            t.equal(actual, 42)
          }
        }
      }).then(results => {
        sut('sut', {
          'sut-description': {
            when: (resolve) => { resolve(42) },
            'sut-assertion': (t, err, actual) => {
              t.equal(actual, 42)
            }
          }
        }).then(results2 => {
          resolve({
            results1: results,
            results2: results2
          })
        })
      })
    },
    'they should run in order': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.results1.totals.passed, 1)
      t.equal(actual.results2.totals.passed, 1)
    }
  }
})
