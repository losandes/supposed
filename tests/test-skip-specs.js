const describe = require('../index.js')
const sut = describe.Suite({ reporter: 'QUIET' })

describe('skipping tests', {
  'when a behavior is skipped': {
    when: behaviorIsSkipped,
    'it should NOT run the behavior': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.behaviorRan, false)
    },
    'it should NOT run any assertions': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.assertion1Ran, false)
      t.equal(actual.assertion2Ran, false)
    },
    'it should count the assertions that were skipped': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.results.totals.skipped, 2)
    },
    'it should produce outcomes with a type of SKIPPED': (t) => (err, actual) => {
      t.ifError(err)
      actual.results.results.forEach(result => {
        t.equal(result.type, 'SKIPPED')
      })
    }
  },
  'when a named behavior is skipped': {
    when: namedBehaviorIsSkipped,
    'it should NOT run the behavior': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.behaviorRan, false)
    },
    'it should NOT run any assertions': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.assertion1Ran, false)
      t.equal(actual.assertion2Ran, false)
    },
    'it should count the assertions that were skipped': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.results.totals.skipped, 2)
    },
    'it should produce outcomes with a type of SKIPPED': (t) => (err, actual) => {
      t.ifError(err)
      actual.results.results.forEach(result => {
        t.equal(result.type, 'SKIPPED')
      })
    }
  },
  'when an assertion is skipped': {
    when: assertionIsSkipped,
    'it should run the behavior': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.behaviorRan, true)
    },
    'it should run the other assertions': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.assertion2Ran, true)
    },
    'it should NOT run the skipped assertion': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.assertion1Ran, false)
    },
    'it should count the assertions that were skipped': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.results.totals.skipped, 1)
    },
    'it should produce outcomes with a type of SKIPPED': (t) => (err, actual) => {
      t.ifError(err)
      actual.results.results.forEach(result => {
        if (result.behavior === 'when behavior, assertion 1') {
          t.equal(result.type, 'SKIPPED')
        } else {
          t.equal(result.type, 'PASSED')
        }
      })
    }
  },
  'when a test is skipped using TAP\'s SKIP directive': {
    when: behaviorIsSkippedWithTapSkipDirective,
    'it should run the behavior': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.behaviorRan, true)
    },
    'it should run the other assertions': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.assertion2Ran, true)
    },
    'it should NOT run the skipped assertion': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.assertion1Ran, false)
    },
    'it should count the assertions that were skipped': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.results.totals.skipped, 1)
    },
    'it should produce outcomes with a type of SKIPPED': (t) => (err, actual) => {
      t.ifError(err)
      actual.results.results.forEach(result => {
        if (result.behavior === 'when behavior, assertion 1') {
          t.equal(result.type, 'SKIPPED')
        } else {
          t.equal(result.type, 'PASSED')
        }
      })
    }
  },
  'when a test is skipped using TAP\'s TODO directive': {
    when: behaviorIsSkippedWithTapTodoDirective,
    'it should run the behavior': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.behaviorRan, true)
    },
    'it should run the other assertions': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.assertion2Ran, true)
    },
    'it should NOT run the skipped assertion': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.assertion1Ran, false)
    },
    'it should count the assertions that were skipped': (t) => (err, actual) => {
      t.ifError(err)
      t.equal(actual.results.totals.skipped, 1)
    },
    'it should produce outcomes with a type of SKIPPED': (t) => (err, actual) => {
      t.ifError(err)
      actual.results.results.forEach(result => {
        if (result.behavior === 'when behavior, # TODO assertion 1') {
          t.equal(result.type, 'SKIPPED')
        } else {
          t.equal(result.type, 'PASSED')
        }
      })
    }
  }
})

function behaviorIsSkipped () {
  var behaviorRan = false
  var assertion1Ran = false
  var assertion2Ran = false

  return sut({
    '// when behavior': {
      when: () => {
        behaviorRan = true
      },
      'assertion 1': t => {
        assertion1Ran = true
      },
      'assertion 2': t => {
        assertion2Ran = true
      }
    }
  }).then(results => {
    return {
      behaviorRan: behaviorRan,
      assertion1Ran: assertion1Ran,
      assertion2Ran: assertion2Ran,
      results: results
    }
  })
}

function namedBehaviorIsSkipped () {
  var behaviorRan = false
  var assertion1Ran = false
  var assertion2Ran = false

  return sut('named', {
    '// when behavior': {
      when: () => {
        behaviorRan = true
      },
      'assertion 1': t => {
        assertion1Ran = true
      },
      'assertion 2': t => {
        assertion2Ran = true
      }
    }
  }).then(results => {
    return {
      behaviorRan: behaviorRan,
      assertion1Ran: assertion1Ran,
      assertion2Ran: assertion2Ran,
      results: results
    }
  })
}

function assertionIsSkipped () {
  var behaviorRan = false
  var assertion1Ran = false
  var assertion2Ran = false

  return sut({
    'when behavior': {
      when: () => {
        behaviorRan = true
      },
      '// assertion 1': t => {
        assertion1Ran = true
      },
      'assertion 2': t => {
        assertion2Ran = true
      }
    }
  }).then(results => {
    return {
      behaviorRan: behaviorRan,
      assertion1Ran: assertion1Ran,
      assertion2Ran: assertion2Ran,
      results: results
    }
  })
}

function behaviorIsSkippedWithTapSkipDirective () {
  var behaviorRan = false
  var assertion1Ran = false
  var assertion2Ran = false

  return sut({
    'when behavior': {
      when: () => {
        behaviorRan = true
      },
      '# SKIP assertion 1': t => {
        assertion1Ran = true
      },
      'assertion 2': t => {
        assertion2Ran = true
      }
    }
  }).then(results => {
    return {
      behaviorRan: behaviorRan,
      assertion1Ran: assertion1Ran,
      assertion2Ran: assertion2Ran,
      results: results
    }
  })
}

function behaviorIsSkippedWithTapTodoDirective () {
  var behaviorRan = false
  var assertion1Ran = false
  var assertion2Ran = false

  return sut({
    'when behavior': {
      when: () => {
        behaviorRan = true
      },
      '# TODO assertion 1': t => {
        assertion1Ran = true
      },
      'assertion 2': t => {
        assertion2Ran = true
      }
    }
  }).then(results => {
    return {
      behaviorRan: behaviorRan,
      assertion1Ran: assertion1Ran,
      assertion2Ran: assertion2Ran,
      results: results
    }
  })
}
