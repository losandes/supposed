module.exports = function (describe, dependencies) {
  const { defaultConfig } = dependencies

  return describe('given different styles', {
    AAA: {
      'when arrange, act, and assert(s) exist': {
        act: whenGivenWhenAndThen('arrange', 'act'),
        'given should produce to when, which should produce to the assertions': itShouldPass
      },
      'when arrange, and assert(s) exist without act': {
        act: whenGivenThenAndNoWhen('arrange'),
        '`arrange` should be swapped out for `act`': itShouldPass
      }
    },
    BDD: {
      'when given, when, and then(s) exist': {
        when: whenGivenWhenAndThen('given', 'when'),
        'given should produce to when, which should produce to the assertions': itShouldPass
      },
      'when given, and then(s) exist without when': {
        when: whenGivenThenAndNoWhen('given'),
        '`given` should be swapped out for `when`': itShouldPass
      }
    },
    vows: {
      'when topics are used for `when/act`': {
        topic: () => { return 42 },
        'it should execute the topic': (t) => (err, actual) => {
          t.ifError(err)
          t.strictEqual(actual, 42)
        }
      }
    },
    'when given is a primitive': {
      given: 42,
      when: (given) => given / 0,
      'it should use the primitive': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, Infinity)
      }
    },
    'when given is an object': {
      given: { num: 42 },
      when: (given) => given.num / 0,
      'it should use the primitive': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, Infinity)
      }
    },
    'when when is a primitive': {
      when: 42,
      'it should use the primitive': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual, 42)
      }
    },
    'when when is an object': {
      when: { num: 42 },
      'it should use the primitive': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.num, 42)
      }
    }
  })

  function itShouldPass (t, err, actual) {
    t.ifError(err)
    t.strictEqual(actual.totals.passed, 1)
  }

  function whenGivenWhenAndThen (given, when) {
    return () => {
      const test = {
        'sut-description': {
          'sut-assertion': (t) => (err, actual) => {
            t.ifError(err)
            t.strictEqual(actual, 42)
          }
        }
      }

      test['sut-description'][given] = () => {
        return new Promise((resolve) => {
          setTimeout(() => { resolve(42) }, 0)
        })
      }

      test['sut-description'][when] = (given) => {
        return new Promise((resolve) => {
          setTimeout(() => { resolve(given) }, 0)
        })
      }

      return describe.Suite({ ...defaultConfig, ...{ name: 'bdd-gwt' } })('test-bdd-specs.whenGivenWhenAndThen', test)
    }
  }

  function whenGivenThenAndNoWhen (given) {
    return () => {
      let givenRan = false
      const test = {
        'sut-description': {
          'sut-assertion': (t) => (err, actual) => {
            t.ifError(err)
            t.strictEqual(actual, 42)
            t.strictEqual(givenRan, true)
          }
        }
      }

      test['sut-description'][given] = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            givenRan = true
            resolve(42)
          }, 0)
        })
      }

      return describe.Suite({ ...defaultConfig, ...{ name: 'bdd-gt' } })('test-bdd-specs.whenGivenThenAndNoWhen', test)
    }
  }
}
