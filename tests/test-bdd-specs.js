const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET', match: null })

describe('AAA', {
  'when arrange, act, and assert(s) exist': {
    act: whenGivenWhenAndThen('arrange', 'act'),
    'given should produce to when, which should produce to the assertions': itShouldPass
  },
  'when arrange, and assert(s) exist without act': {
    act: whenGivenThenAndNoWhen('arrange', 'act'),
    '`arrange` should be swapped out for `act`': itShouldPass
  }
})

describe('BDD', {
  'when given, when, and then(s) exist': {
    when: whenGivenWhenAndThen('given', 'when'),
    'given should produce to when, which should produce to the assertions': itShouldPass
  },
  'when given, and then(s) exist without when': {
    when: whenGivenThenAndNoWhen('given', 'when'),
    '`given` should be swapped out for `when`': itShouldPass
  }
})

describe('vows', {
  'when topics are used for `when/act`': {
    topic: () => { return 42 },
    'it should execute the topic': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual, 42)
    }
  }
})

function itShouldPass (t, err, actual) {
debugger
  t.ifError(err)
  t.equal(actual.totals.passed, 1)
}

function whenGivenWhenAndThen (given, when) {
  return () => {
    var test = {
      'sut-description': {
        'sut-assertion': (t) => (err, actual) => {
          t.ifError(err)
          t.equal(actual, 42)
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

    return sut('assay', test)
  }
}

function whenGivenThenAndNoWhen (given, when) {
  return () => {
    var givenRan = false
    var test = {
      'sut-description': {
        'sut-assertion': (t) => (err, actual) => {
          t.ifError(err)
          t.equal(actual, 42)
          t.equal(givenRan, true)
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

    return sut('assay', test)
  }
}
