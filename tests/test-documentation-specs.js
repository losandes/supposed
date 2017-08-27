const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('// idea: documentation', {
  'when the DOCUMENTATION_REPORTER is used': {
    'and the tests produce inline documentation': {
      when: (given, resolve, reject) => {

      },
      'it should produce documentation': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.passed, 1)
      }
    },
    'and the tests identify a documentation file': {
      when: (given, resolve, reject) => {

      },
      'it should read, and produce documentation': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.passed, 1)
      }
    },
    'and the tests do not set documentation': {
      when: (given, resolve, reject) => {

      },
      'it should use the behaviors and assertions to produce documentation': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.passed, 1)
      }
    },
    'and the tests set documentation to `false`': {
      when: (given, resolve, reject) => {

      },
      'it should omit these tests from the documentation': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.passed, 1)
      }
    }
  }
})
