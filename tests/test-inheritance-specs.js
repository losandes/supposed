module.exports = function (describe, dependencies) {
  const { defaultConfig } = dependencies

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
    'when nested assertions have no given': {
      given: () => 42,
      'and a parent description does have a given': {
        'and the nest has a when': {
          when: (given) => { return given / 0 },
          'it should support branching the rabbit hole': (t) => (err, actual) => {
            t.ifError(err)
            t.strictEqual(actual, Infinity)
          },
          'and there\'s more nesting': {
            'with when\'s but not given\'s': {
              when: (given) => { return given * 1 },
              'the when\'s should receive the value from the parent given': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, 42)
              }
            },
            'with when\'s and given\'s': {
              given: () => 1,
              when: (given) => { return given * 1 },
              'the when\'s should receive the value from the overriding given': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, 1)
              },
              'in deeper nests': {
                when: (given) => { return given * 2 },
                'the when\'s should receive the value from the overriding given': (t) => (err, actual) => {
                  t.ifError(err)
                  t.strictEqual(actual, 2)
                }
              }
            }
          } // /more nesting
        }, // /nest has when
        'and the nest does NOT have a when': {
          'the assertions should receive the value from the parent given': (t) => (err, actual) => {
            t.ifError(err)
            t.strictEqual(actual, 42)
          },
          'and there\'s more nesting': {
            'with neither when\'s nor given\'s': {
              'the assertions should receive the value from the parent given': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, 42)
              }
            },
            'with a given, but not a when': {
              given: () => 1,
              'the assertions should receive the value from the overriding given': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, 1)
              },
              'in deeper nests': {
                'the assertions should receive the value from the overriding given': (t) => (err, actual) => {
                  t.ifError(err)
                  t.strictEqual(actual, 1)
                }
              }
            }
          } // /more nesting
        } // /no when
      } // /parent has given
    },
    'when nested assertions have givens': {
      when: (given) => { return given * 2 },
      'and they stem from a parent with a when (1)': {
        given: () => 1,
        'it should pass the child given to the parent when': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual, 2)
        }
      },
      'and they stem from a parent with a when (42)': {
        given: () => 42,
        'it should pass the child given to the parent when': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual, 84)
        }
      }
    },
    'when nested assertions have givens (make-batch if (!when && parentWhen && !whenIsInheritedGiven))': {
      given: () => 42,
      when: (given) => given * 2,
      'it should equal 84': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 84)
      },
      'and they stem from a parent with a when': {
        given: () => 1,
        'it should equal 2': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual, 2)
        }
      }
    },
    'when nested assertions have givens (make-batch if (!when && given))': {
      given: () => 42,
      'it should equal 42': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 42)
      },
      'and they stem from a parent with a when': {
        given: () => 1,
        'it should equal 1': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual, 1)
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
    return describe.Suite({ ...defaultConfig, ...{ name: 'deep-nest' } })({
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
    return describe.Suite({ ...defaultConfig, ...{ name: 'nest-inheritance-whens' } })({
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
    return describe.Suite({ ...defaultConfig, ...{ name: 'when-is-async' } })({
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
