const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET', match: null })

describe('missing when', {
  'when there is no when function': {
    when: () => {
      return sut('assay', {
        'when there is no when function': {
          'it should still execute the assertions': t => {
            t.equal(true, true)
          },
          'and assertions are deeply nested': {
            'it should still execute the assertions': t => {
              t.equal(true, true)
            },
            'inside of other deep nests': {
              'it should still execute the assertions': t => {
                t.equal(true, true)
              }
            }
          }
        }
      })
    },
    'it should still execute the assertions': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 3)
    }
  }
})
