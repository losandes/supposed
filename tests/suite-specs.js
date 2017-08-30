const describe = require('../index.js')
const chai = require('chai')

describe('Suite', {
  'when a new suite is created with a timout': {
    when: (resolve) => {
      const sut = describe.Suite({ reporter: 'QUIET', timeout: 5 })
      sut('sut', {
        'sut-description': {
          when: () => {},
          'sut-assertion': t => {
            t.fail('it should not get here')
          }
        }
      }).then(resolve)
    },
    'it should use the configured timeout': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.broken, 1)
      t.equal(actual.results[0].error.message, 'Timeout: the test exceeded 5 ms')
    }
  },
  'when a new suite is created with an assertion library': {
    when: (resolve) => {
      const sut = describe.Suite({ reporter: 'QUIET', assertionLibrary: chai.expect })
      sut('sut', {
        'sut-description': {
          when: (resolve) => { resolve(42) },
          'sut-assertion': (expect) => (err, actual) => {
            expect(err).to.equal(undefined)
            expect(actual).to.equal(42)
          }
        }
      }).then(resolve)
    },
    'it should use the configured assertion library': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  },
  '// when a new suite is created with a reporter name': {
    'it should use the configured reporter': (t, err, actual) => {

    },
    'and the reporter is unknown': {
      'it should use the default reporter': (t, err, actual) => {

      }
    }
  },
  'when a new suite is created with an instance of a reporter': {
    when: (resolve) => {
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

      sut('sut', {
        'sut-description': {
          when: (resolve) => {
            resolve(42)
            endTime = new Date()
          },
          'sut-assertion': (t) => (err, actual) => {
            t.ifError(err)
            t.equal(actual, 42)
          }
        }
      }).then(resolve)
    },
    'it should use the configured reporter': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.results[0].type, 'WOOHOO!')
    }
  }
})
