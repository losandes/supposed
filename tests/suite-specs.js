const describe = require('../index.js')
const chai = require('chai')

describe('Suite', {
  'when a new suite is created with a timout': {
    when: () => {
      const sut = describe.Suite({ reporter: 'QUIET', timeout: 5 })
      return sut('sut', {
        'sut-description': {
          when: () => { return new Promise(() => { /* should timeout */ }) },
          'sut-assertion': t => {
            t.fail('it should not get here')
          }
        }
      })
    },
    'it should use the configured timeout': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.broken, 1)
      t.equal(actual.results[0].error.message, 'Timeout: the test exceeded 5 ms')
    }
  },
  'when a new suite is created with an assertion library': {
    when: () => {
      const sut = describe.Suite({ reporter: 'QUIET', assertionLibrary: chai.expect })
      return sut('sut', {
        'sut-description': {
          when: () => { return 42 },
          'sut-assertion': (expect) => (err, actual) => {
            expect(err).to.equal(null)
            expect(actual).to.equal(42)
          }
        }
      })
    },
    'it should use the configured assertion library': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  },
  '// when a new suite is created with a reporter name': {
    when: () => {
      const sut = describe.Suite({ reporter: 'QUIET' })
      return sut('sut', {
        'sut-description': {
          when: () => { return 42 },
          'sut-assertion': (expect) => (err, actual) => {
            expect(err).to.equal(null)
            expect(actual).to.equal(42)
          }
        }
      }).then(results => {
        return sut.getPrinterOutput()
      })
    },
    'it should use the configured reporter': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual, 'output')
    },
    '// and the reporter is unknown': {
      'it should use the default reporter': (t) => (err, actual) => {
        t.ifError(err)
        // TODO
      }
    }
  },
  'when a new suite is created with an instance of a reporter': {
    when: () => {
      var results = []
      var startTime = new Date()
      var endTime

      const sut = describe.Suite({ reporter: {
        report: function (event) {
          if (Array.isArray(event) && event[0].type === 'PASSED') {
            event.push({
              type: 'WOOHOO!',
              behavior: event[0].behavior
            })

            event.shift()
          }
        },
        getTotals: () => { return { startTime: startTime, endTime: endTime } },
        getResults: () => { return results }
      }})

      return sut('sut', {
        'sut-description': {
          when: () => {
            endTime = new Date()
            return 42
          },
          'sut-assertion': (t) => (err, actual) => {
            t.ifError(err)
            t.equal(actual, 42)
          }
        }
      })
    },
    'it should use the configured reporter': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.results[0].type, 'WOOHOO!')
    }
  }
})
