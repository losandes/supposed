const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('AAA', {
  'when arrange, act, and assert(s) exist': {
    act: whenGivenWhenAndThen('arrange', 'act'),
    'given should produce to when, which should produce to the assertions': itShouldPass,
    'and the `act` does not ask for the result of `arrange`': {
      act: whenGivenWhenAndThenAndWhenIgnoresGiven('arrange', 'act'),
      'it should work the same way it does when `arrange` is not present': itShouldPass
    }
  },
  'when arrange, and assert(s) exist without act': {
    act: whenGivenThenAndNoWhen('arrange', 'act'),
    '`arrange` should be swapped out for `act`': itShouldPass
  }
})

describe('BDD', {
  'when given, when, and then(s) exist': {
    when: whenGivenWhenAndThen('given', 'when'),
    'given should produce to when, which should produce to the assertions': itShouldPass,
    'and the `when` does not ask for the result of `given`': {
      when: whenGivenWhenAndThenAndWhenIgnoresGiven('given', 'when'),
      'it should work the same way it does when `given` is not present': itShouldPass
    }
  },
  'when given, and then(s) exist without when': {
    when: whenGivenThenAndNoWhen('given', 'when'),
    '`given` should be swapped out for `when`': itShouldPass
  }
})

describe('vows', {
  'when topics are used for `when/act`': {
    topic: (resolve) => { resolve(42) },
    'it should execute the topic': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual, 42)
    }
  }
})

function itShouldPass (t, err, actual) {
  t.ifError(err)
  t.equal(actual.totals.passed, 1)
}

function whenGivenWhenAndThen (given, when) {
  return (resolve) => {
    var test = {
      'sut-description': {
        'sut-assertion': (t, err, actual) => {
          t.ifError(err)
          t.equal(actual, 42)
        }
      }
    }

    test['sut-description'][given] = (resolve, reject) => {
      setTimeout(() => { resolve(42) }, 0)
    }

    test['sut-description'][when] = (resolve, reject) => (given) => {
      setTimeout(() => { resolve(given) }, 0)
    }

    return sut('assay', test).then(resolve)
  }
}

function whenGivenWhenAndThenAndWhenIgnoresGiven (given, when) {
  return (resolve) => {
    var test = {
      'sut-description': {
        'sut-assertion': (t, err, actual) => {
          t.ifError(err)
          t.equal(actual, 43)
        }
      }
    }

    test['sut-description'][given] = (resolve, reject) => {
      setTimeout(() => { resolve(42) }, 0)
    }

    test['sut-description'][when] = (resolve, reject) => {
      setTimeout(() => { resolve(43) }, 0)
    }

    return sut('assay', test).then(resolve)
  }
}

function whenGivenThenAndNoWhen (given, when) {
  return (resolve) => {
    var givenRan = false
    var test = {
      'sut-description': {
        'sut-assertion': (t, err, actual) => {
          t.ifError(err)
          t.equal(actual, 42)
          t.equal(givenRan, true)
        }
      }
    }

    test['sut-description'][given] = (resolve, reject) => {
      setTimeout(() => {
        givenRan = true
        resolve(42)
      }, 0)
    }

    return sut('assay', test).then(resolve)
  }
}
