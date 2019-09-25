module.exports = function (describe, dependencies) {
  const { defaultConfig } = dependencies

  return describe('chainability', {
    'when then is used as an `after` hook for tests (i.e. for cleanup)': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'then-as-after' } })('sut', {
          'sut-description': {
            when: () => { return 42 },
            'sut-assertion': (t) => (err, actual) => {
              t.ifError(err)
              t.strictEqual(actual, 42)
            }
          }
        }).then(results => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve('hello world!')
            }, 2)
          })
        })
      },
      'it should run the after hook': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 'hello world!')
      }
    },
    'when then is used to run tests in a series': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'then-as-series-1' } })('sut', {
          'sut-description': {
            when: () => { return 42 },
            'sut-assertion': (t) => (err, actual) => {
              t.ifError(err)
              t.strictEqual(actual, 42)
            }
          }
        }).then(results => {
          return describe.Suite({ ...defaultConfig, ...{ name: 'then-as-series-2' } })('sut', {
            'sut-description': {
              when: () => { return 42 },
              'sut-assertion': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, 42)
              }
            }
          }).then(results2 => {
            return {
              results1: results,
              results2: results2
            }
          })
        })
      },
      'they should run in order': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results1.totals.passed, 1)
        t.strictEqual(actual.results2.totals.passed, 1)
      }
    }
  })
}
