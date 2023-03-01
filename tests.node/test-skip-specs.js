module.exports = function (describe, dependencies) {
  const { defaultConfig } = dependencies

  return describe('skipping tests', {
    'when a behavior is skipped': {
      when: behaviorIsSkipped,
      'it should NOT run the behavior': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.behaviorRan, false)
      },
      'it should NOT run any assertions': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.assertion1Ran, false)
        t.strictEqual(actual.assertion2Ran, false)
      },
      'it should count the assertions that were skipped': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results.totals.skipped, 2)
      },
      'it should produce outcomes with a status of SKIPPED': (t) => (err, actual) => {
        t.ifError(err)
        actual.results.results.forEach(result => {
          t.strictEqual(result.status, 'SKIPPED')
        })
      },
    },
    'when a named behavior is skipped': {
      when: namedBehaviorIsSkipped,
      'it should NOT run the behavior': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.behaviorRan, false)
      },
      'it should NOT run any assertions': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.assertion1Ran, false)
        t.strictEqual(actual.assertion2Ran, false)
      },
      'it should count the assertions that were skipped': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results.totals.skipped, 2)
      },
      'it should produce outcomes with a status of SKIPPED': (t) => (err, actual) => {
        t.ifError(err)
        actual.results.results.forEach(result => {
          t.strictEqual(result.status, 'SKIPPED')
        })
      },
    },
    'when an assertion is skipped': {
      when: assertionIsSkipped,
      'it should run the behavior': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.behaviorRan, true)
      },
      'it should run the other assertions': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.assertion2Ran, true)
      },
      'it should NOT run the skipped assertion': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.assertion1Ran, false)
      },
      'it should count the assertions that were skipped': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results.totals.skipped, 1)
      },
      'it should produce outcomes with a status of SKIPPED': (t) => (err, actual) => {
        t.ifError(err)
        actual.results.results.forEach(result => {
          if (result.behavior === 'when behavior, assertion 1') {
            t.strictEqual(result.status, 'SKIPPED')
          } else {
            t.strictEqual(result.status, 'PASSED')
          }
        })
      },
    },
    'when a test is skipped using TAP\'s SKIP directive': {
      when: behaviorIsSkippedWithTapSkipDirective,
      'it should run the behavior': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.behaviorRan, true)
      },
      'it should run the other assertions': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.assertion2Ran, true)
      },
      'it should NOT run the skipped assertion': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.assertion1Ran, false)
      },
      'it should count the assertions that were skipped': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results.totals.skipped, 1)
      },
      'it should produce outcomes with a status of SKIPPED': (t) => (err, actual) => {
        t.ifError(err)
        actual.results.results.forEach(result => {
          if (result.behavior === 'when behavior, assertion 1') {
            t.strictEqual(result.status, 'SKIPPED')
          } else {
            t.strictEqual(result.status, 'PASSED')
          }
        })
      },
    },
    'when a test is skipped using TAP\'s TODO directive': {
      when: behaviorIsSkippedWithTapTodoDirective,
      'it should run the behavior': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.behaviorRan, true)
      },
      'it should run the other assertions': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.assertion2Ran, true)
      },
      'it should NOT run the skipped assertion': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.assertion1Ran, false)
      },
      'it should count the assertions that were skipped': (t) => (err, actual) => {
        t.ifError(err)
        t.strictEqual(actual.results.totals.skipped, 1)
      },
      'it should produce outcomes with a status of SKIPPED': (t) => (err, actual) => {
        t.ifError(err)
        actual.results.results.forEach(result => {
          if (result.behavior === 'when behavior, # TODO assertion 1') {
            t.strictEqual(result.status, 'SKIPPED')
          } else {
            t.strictEqual(result.status, 'PASSED')
          }
        })
      },
    },
  })

  function behaviorIsSkipped () {
    let behaviorRan = false
    let assertion1Ran = false
    let assertion2Ran = false

    return describe.Suite({ ...defaultConfig, ...{ name: 'behavior-is-skipped' } })({
      '// when behavior': {
        when: () => {
          behaviorRan = true
        },
        'assertion 1': t => {
          assertion1Ran = true
        },
        'assertion 2': t => {
          assertion2Ran = true
        },
      },
    }).then(results => {
      return {
        behaviorRan: behaviorRan,
        assertion1Ran: assertion1Ran,
        assertion2Ran: assertion2Ran,
        results: results,
      }
    })
  }

  function namedBehaviorIsSkipped () {
    let behaviorRan = false
    let assertion1Ran = false
    let assertion2Ran = false

    return describe.Suite({ ...defaultConfig, ...{ name: 'named-behavior-is-skipped' } })('named', {
      '// when behavior': {
        when: () => {
          behaviorRan = true
        },
        'assertion 1': t => {
          assertion1Ran = true
        },
        'assertion 2': t => {
          assertion2Ran = true
        },
      },
    }).then(results => {
      return {
        behaviorRan: behaviorRan,
        assertion1Ran: assertion1Ran,
        assertion2Ran: assertion2Ran,
        results: results,
      }
    })
  }

  function assertionIsSkipped () {
    let behaviorRan = false
    let assertion1Ran = false
    let assertion2Ran = false

    return describe.Suite({ ...defaultConfig, ...{ name: 'assertion-is-skipped' } })({
      'when behavior': {
        when: () => {
          behaviorRan = true
        },
        '// assertion 1': t => {
          assertion1Ran = true
        },
        'assertion 2': t => {
          assertion2Ran = true
        },
      },
    }).then(results => {
      return {
        behaviorRan: behaviorRan,
        assertion1Ran: assertion1Ran,
        assertion2Ran: assertion2Ran,
        results: results,
      }
    })
  }

  function behaviorIsSkippedWithTapSkipDirective () {
    let behaviorRan = false
    let assertion1Ran = false
    let assertion2Ran = false

    return describe.Suite({ ...defaultConfig, ...{ name: 'tap-skip-directive' } })({
      'when behavior': {
        when: () => {
          behaviorRan = true
        },
        '# SKIP assertion 1': t => {
          assertion1Ran = true
        },
        'assertion 2': t => {
          assertion2Ran = true
        },
      },
    }).then(results => {
      return {
        behaviorRan: behaviorRan,
        assertion1Ran: assertion1Ran,
        assertion2Ran: assertion2Ran,
        results: results,
      }
    })
  }

  function behaviorIsSkippedWithTapTodoDirective () {
    let behaviorRan = false
    let assertion1Ran = false
    let assertion2Ran = false

    return describe.Suite({ ...defaultConfig, ...{ name: 'tap-todo-directive' } })({
      'when behavior': {
        when: () => {
          behaviorRan = true
        },
        '# TODO assertion 1': t => {
          assertion1Ran = true
        },
        'assertion 2': t => {
          assertion2Ran = true
        },
      },
    }).then(results => {
      return {
        behaviorRan: behaviorRan,
        assertion1Ran: assertion1Ran,
        assertion2Ran: assertion2Ran,
        results: results,
      }
    })
  }
}
