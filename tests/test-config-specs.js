const describe = require('../index.js')
const chai = require('chai')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('test configuration', {
  'when a test sets a timeout': {
    when: (resolve) => {
      sut('sut', {
        'sut-description': {
          timeout: 5,
          when: () => {},
          'sut-assertion': t => {
            t.fail('it should not get here')
          }
        }
      }).then(resolve)
    },
    'the test should be reported as BROKEN': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.broken, 1)
      t.equal(actual.results[0].error.message, 'Timeout: the test exceeded 5 ms')
    },
    'and another node overrides it': {
      when: (resolve) => {
        sut('sut', {
          'sut-description': {
            timeout: 5,
            'sut-override': {
              timeout: 7,
              when: resolve => { /* should timeout */ },
              'sut-assertion': (t, err, actual) => {
                t.fail('it should not get here')
              }
            }
          }
        }).then(resolve)
      },
      'it should use the configured timeout': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.broken, 1)
        t.equal(actual.results[0].error.message, 'Timeout: the test exceeded 7 ms')
      }
    }
  },
  'when a test sets a timeout, with no description': {
    when: (resolve) => {
      sut({
        'sut-description': {
          timeout: 5,
          when: () => {},
          'sut-assertion': t => {
            t.fail('it should not get here')
          }
        }
      }).then(resolve)
    },
    'the test should be reported as BROKEN': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.broken, 1)
      t.equal(actual.results[0].error.message, 'Timeout: the test exceeded 5 ms')
    }
  },
  'when a test sets the assertion library': {
    assertionLibrary: chai.expect,
    when: (resolve) => { resolve(42) },
    'it should use the configured assertion library': (expect, err, actual) => {
      expect(actual).to.equal(42)
    }
  },
  'when a test sets an after hook': {
    when: (resolve) => {
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
    'it should execute the after hook': (t, err, actual) => {
      t.equal(actual, 'hello world!')
    }
  }
})
