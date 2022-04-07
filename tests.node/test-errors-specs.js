module.exports = function (describe, dependencies) {
  const { defaultConfig } = dependencies

  return describe('errors', {
    'when the `given` throws an error': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'given-throws', timeout: 10 } })({
          'when the `given` throws an error': {
            given: () => { throw new Error('GIVEN!') },
            when: (given) => { return 42 },
            'it should pass the error to the assertions': (t, err) => {
              t.fail('it should not get here')
            }
          }
        })
      },
      'it should bail out': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'GIVEN!')
      }
    },
    'when the `when` throws an error': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'when-throws', timeout: 10 } })({
          'when the `when` throws an error': {
            when: () => { throw new Error('BOOM!') },
            'it should pass the error to the assertions': (t, err) => {
              t.strictEqual(typeof err, 'object')
              t.strictEqual(err.message, 'BOOM!')
            }
          }
        })
      },
      'it should pass the error to the assertions': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 1)
      }
    },
    'when the `given` rejects': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'given-rejects', timeout: 10 } })({
          'when the `given` rejects': {
            given: () => {
              return Promise.reject(new Error('GIVEN!'))
            },
            when: (given) => {
              return 42
            },
            'it should pass the rejection to the `err` argument': (t, err) => {
              t.fail('it should not get here')
            }
          }
        })
      },
      'it should bail out': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'GIVEN!')
      }
    },
    'when the `when` rejects': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'when-rejects', timeout: 10 } })({
          'when the `when` rejects': {
            when: () => {
              return Promise.reject(new Error('Boom!'))
            },
            'it should pass the rejection to the `err` argument': (t, err) => {
              t.strictEqual(typeof err, 'object')
              t.strictEqual(err.message, 'Boom!')
            }
          }
        })
      },
      'it should pass the error to the assertions': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 1)
      }
    },
    'when the assertion throws an error': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'assertion-throws', timeout: 10 } })({
          'when the assertion throws an error': {
            'the test should fail': () => {
              throw new Error('assertion ERROR!')
            }
          }
        })
      },
      'the test should fail': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.failed, 1)
        t.strictEqual(actual.results[0].error.message, 'assertion ERROR!')
      },
      'because of a curry mismatch': {
        when: () => {
          return describe.Suite({ ...defaultConfig, ...{ name: 'assertion-throws', timeout: 10 } })({
            when: () => ({ result: 1 + 2 }),
            'it should': (err, actual) => () => {
              t.ifError(err)                  // eslint-disable-line no-undef
              t.strictEqual(actual.result, 3) // eslint-disable-line no-undef
            }
          })
        },
        'the test should fail': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual.totals.failed, 1)
          t.strictEqual(actual.results[0].error.message, 't is not defined')
        }
      }
    },
    'when `given` is never resolved': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'given-never-resolves', timeout: 10 } })({
          'when `given` is never resolved': {
            given: () => { return new Promise(() => { /* should timeout */ }) },
            when: (resolve) => (given) => { resolve() },
            'it should throw a timeout exception': t => {
              t.fail('it should not get here')
            }
          }
        })
      },
      'the test should be reported as BROKEN': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 10 ms')
      }
    },
    'when `when` is never resolved': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'when-never-resolves', timeout: 10 } })({
          'when `when` is never resolved': {
            when: () => { return new Promise(() => { /* should timeout */ }) },
            'it should throw a timeout exception': t => {
              t.fail('it should not get here')
            }
          }
        })
      },
      'the test should be reported as BROKEN': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 10 ms')
      }
    },
    'when async assertions never return': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'async-assertions-never-return', timeout: 10 } })({
          'when `when` is never resolved': {
            'it should throw a timeout exception': async t => {
              await new Promise(() => { /* should timeout */ })
            }
          }
        })
      },
      'the test should be reported as BROKEN': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 10 ms')
      }
    },
    'when promised assertions never return': {
      when: () => {
        return describe.Suite({ ...defaultConfig, ...{ name: 'promised-assertions-never-return', timeout: 10 } })({
          'when `when` is never resolved': {
            'it should throw a timeout exception': t => {
              return new Promise(() => { /* should timeout */ })
            }
          }
        })
      },
      'the test should be reported as BROKEN': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.broken, 1)
        t.strictEqual(actual.results[0].error.message, 'Timeout: the test exceeded 10 ms')
      }
    }
  })
}
