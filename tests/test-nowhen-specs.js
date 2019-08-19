module.exports = function (suite) {
  const { describe } = suite.env
  const sut = describe.Suite({ reporter: 'QUIET', match: null })

  return describe('missing when', {
    'when there is no when function': {
      when: () => {
        return sut('supposed', {
          'when there is no when function': {
            'it should still execute the assertions': t => {
              t.strictEqual(true, true)
            },
            'and assertions are deeply nested': {
              'it should still execute the assertions': t => {
                t.strictEqual(true, true)
              },
              'inside of other deep nests': {
                'it should still execute the assertions': t => {
                  t.strictEqual(true, true)
                }
              }
            }
          }
        })
      },
      'it should still execute the assertions': (t, err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 3)
      }
    }
  })
}
