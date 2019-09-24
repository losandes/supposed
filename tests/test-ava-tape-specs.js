module.exports = function (describe, dependencies) {
  const { defaultConfig } = dependencies

  return describe('ava and tape compatibility', {
    'when a test is described, using the ava and tape syntax': {
      when: () => {
        const sut = describe.Suite({ ...defaultConfig, ...{ name: 'ava-tape' } })
        return sut('ava and tape compatibility', t => {
          t.strictEqual(1, 1)
        })
      },
      'it should run the tests': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 1)
      },
      'and it does not have a description': {
        when: () => {
          const sut = describe.Suite({ ...defaultConfig, ...{ name: 'ava-tape-no-desc' } })
          return sut(t => {
            t.strictEqual(1, 1)
          })
        },
        'it should run the tests': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual.totals.passed, 1)
        }
      }
    },
    'when multiple ava styles tests are added to an object': {
      when: () => {
        const sut = describe.Suite({ ...defaultConfig, ...{ name: 'ava-tape-multiple' } })
        return sut({
          t1: t => { t.strictEqual(1, 1) },
          t2: t => { t.strictEqual(1, 1) },
          t3: t => { t.strictEqual(1, 1) }
        })
      },
      'it should provide a way to group tests in a suite, with a single execution': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.totals.passed, 3)
      }
    }
  })
}
