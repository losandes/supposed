'use strict'

module.exports = TestBatch

// TODO: preserve test order???

function TestBatch (tests) {
  var parsed = []
  var nakedPaths = []
  tests = Object.assign({}, tests)

  // look for paths that have no `when`
  Object.keys(tests).forEach(key => {
    findNakedPaths(key, tests[key])
  })

  // for each path that has no `when` add a dummy `when`, so authors can
  // put all of their test logic in the assertions, if they want
  nakedPaths.forEach(path => {
    path = Object.assign({}, path)
    path.when = resolve => { resolve() }

    tests[path.behavior] = {
      when: resolve => { resolve() }
    }

    Object.keys(path.test).forEach(key => {
      tests[path.behavior][key] = path.test[key]
    })
  })

  Object.keys(tests).forEach(key => {
    parseOne(key, tests[key])
  })

  function findNakedPaths (behavior, test) {
    if (!test.when) {
      let keys = Object.keys(test)

      if (keys.length === 1) {
        nakedPaths.push({ behavior: behavior, test: test })
      } else {
        keys.forEach(key => {
          findNakedPaths(`${behavior}, ${key}`, test[key])
        })
      }
    }
  }

  function parseOne (behavior, test, skip) {
    var self = {
      given: null,
      when: null,
      assertions: []
    }

    if (!test.when) {
      Object.keys(test).forEach(key => {
        parseOne(concatBehavior(behavior, key), test[key], isSkipped(key))
      })
      return
    }

    // TODO use givens
    self.given = test.given || test.arrange
    self.when = test.when || test.act
    self.skipped = skip || isSkipped(behavior)
    parseAssertions(trimBehavior(behavior), test)
    parsed.push(self)

    function parseAssertions (behavior, test) {
      Object.keys(test).forEach(key => {
        if (key === 'when') {
          return
        }

        if (typeof test[key] === 'function') {
          self.behavior = behavior
          self.assertions.push(new Assertion(behavior, key, test[key], self.skipped))
        } else if (typeof test[key] === 'object' && test[key].when) {
          // this is a new when - kick back out to parseOne
          parseOne(concatBehavior(behavior, key), test[key], self.skipped || isSkipped(key))
        } else {
          // this is a futher description of the assertion - concat and kick back out to parseAssertions
          behavior += `, ${key}`
          parseAssertions(behavior, test[key])
        }
      })
    }

    return self
  }

  return parsed
} // /TestBatch

function Assertion (whenBehavior, itBehavior, test, parentSkipped) {
  return {
    behavior: `${whenBehavior}, ${trimBehavior(itBehavior)}`,
    test: test,
    skipped: parentSkipped || isSkipped(itBehavior)
  }
}

function isSkipped (behavior) {
  return behavior && behavior.trim().substring(0, 2) === '//'
}

function trimBehavior (behavior) {
  if (behavior.substring(0, 2) === '//') {
    return behavior.substring(2).trim()
  } else {
    return behavior.trim()
  }
}

function concatBehavior (behavior, key) {
  return `${behavior}, ${trimBehavior(key)}`
}
