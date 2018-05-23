const describe = require('../index.js')
const chai = require('chai')
const sut = describe.Suite({ reporter: 'QUIET', match: null })

describe('test configuration', {
  'when a test sets a timeout': {
    when: () => {
      return sut('sut', {
        'sut-description': {
          timeout: 5,
          when: () => { return new Promise(() => { /* should timeout */ }) },
          'sut-assertion': t => {
            t.fail('it should not get here')
          }
        }
      })
    },
    'the test should be reported as BROKEN': (t) => (err, actual) => {
      t.ifError(err)
      t.strictEqual(actual.totals.broken, 1)
      t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 5 ms')
    },
    'and another node overrides it': {
      when: () => {
        return sut('sut', {
          'sut-description': {
            timeout: 5,
            'sut-override': {
              timeout: 7,
              when: () => { return new Promise(() => { /* should timeout */ }) },
              'sut-assertion': (t) => (err, actual) => {
                t.ifError(err)
                t.fail('it should not get here')
              }
            }
          }
        })
      },
      'it should use the configured timeout': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 7 ms')
      }
    }
  },
  'when a test sets a timeout, with no description': {
    when: () => {
      return sut({
        'sut-description': {
          timeout: 5,
          when: () => { return new Promise(() => { /* should timeout */ }) },
          'sut-assertion': t => {
            t.fail('it should not get here')
          }
        }
      })
    },
    'the test should be reported as BROKEN': (t) => (err, actual) => {
      t.ifError(err)
      t.strictEqual(actual.totals.broken, 1)
      t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 5 ms')
    }
  },
  'when a test sets the assertion library': {
    assertionLibrary: chai.expect,
    when: () => { return 42 },
    'it should use the configured assertion library': (expect) => (err, actual) => {
      expect(err).to.equal(null)
      expect(actual).to.equal(42)
    }
  }
})
