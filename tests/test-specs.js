module.exports = function (suite) {
  const { describe } = suite.env
  const sut = describe.Suite({ reporter: 'QUIET', match: null })

  return describe('supposed', {
    'when descriptions are deeply nested': {
      when: descriptionsAreDeeplyNested,
      'it should run them all': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 3)
      }
    },
    'when nested assertions have no when': {
      'and a parent description does have a when': {
        when: nestsInheritWhens,
        'it should use the parent when': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual.totals.passed, 2)
        }
      }
    },
    'when the `when` is asynchronous': {
      when: whenIsAsync,
      'it should not execute the assertions until the when is resolved': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 1)
      }
    }
  }) // /describe

  function descriptionsAreDeeplyNested () {
    return sut({
      'when we keep nesting (1)': {
        'and nesting (2)': {
          when: () => { return 42 / 0 },
          'it should support branching the rabbit hole': (t) => (err, actual) => {
            t.ifError(err)
            t.strictEqual(actual, Infinity)
          },
          'and nesting (3)': {
            'and nesting (4)': {
              when: () => { return 42 / 0 },
              'it should follow the rabbit hole': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, Infinity)
              },
              'and nesting (5)': {
                'and nesting (6)': {
                  when: () => { return 42 / 0 },
                  'it should follow the rabbit hole': (t) => (err, actual) => {
                    t.ifError(err)
                    t.strictEqual(actual, Infinity)
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  function nestsInheritWhens () {
    return sut({
      'when we keep nesting (1)': {
        'and nesting (2)': {
          when: () => { return 42 / 0 },
          'it should support branching the rabbit hole': (t) => (err, actual) => {
            t.ifError(err)
            t.strictEqual(actual, Infinity)
          },
          'and nesting (3)': {
            'and nesting (4)': {
              'it should follow the rabbit hole': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, Infinity)
              }
            }
          }
        }
      }
    })
  }

  function whenIsAsync () {
    return sut({
      'when the `when` is asynchronous': {
        when: () => {
          return new Promise((resolve) => {
            setTimeout(() => { resolve(42) }, 10)
          })
        },
        'it should not execute the assertions until the when is resolved': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual, 42)
        }
      }
    })
  }
}
