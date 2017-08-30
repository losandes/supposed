const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('AAA', {
  'when arrange, act, and assert(s) exist': {
    when: whenGivenWhenAndThen('arrange', 'act'),
    'given should produce to when, which should produce to the assertions': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    },
    'and the `act` does not ask for the result of `arrange`': {
      when: whenGivenWhenAndThenAndWhenIgnoresGiven('arrange', 'act'),
      'it should show as broken': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.passed, 1)
      }
    }
  },
  'when arrange, and assert(s) exist without act': {
    when: whenGivenThenAndNoWhen('arrange', 'act'),
    '`arrange` should be swapped out for `act`': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
})

describe('BDD', {
  'when given, when, and then(s) exist': {
    when: whenGivenWhenAndThen('given', 'when'),
    'given should produce to when, which should produce to the assertions': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    },
    'and the `when` does not ask for the result of `given`': {
      when: whenGivenWhenAndThenAndWhenIgnoresGiven('given', 'when'),
      'it should show as broken': (t, err, actual) => {
        t.ifError(err)
        t.equal(actual.totals.passed, 1)
      }
    }
  },
  'when given, and then(s) exist without when': {
    when: whenGivenThenAndNoWhen('given', 'when'),
    '`given` should be swapped out for `when`': (t, err, actual) => {
      t.ifError(err)
      t.equal(actual.totals.passed, 1)
    }
  }
})

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
