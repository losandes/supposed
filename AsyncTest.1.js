'use strict'
const promiseUtils = require('./promiseUtils.js')

module.exports = AsyncTest

// {
//   when: [Function: when],
//   assertions: [{
//     behavior: 'when dividing a number by zero, we get Infinity',
//     test: [Function: we get Infinity]
//   }]
// }
function AsyncTest (test, config) {
  return new Promise((resolve, reject) => {
    var timer

    setTimeout(() => {
      try {
        if (test.skipped) {
          config.reporter.report({ type: 'startTest' })
          test.assertions.forEach(assertion => {
            report(assertOne(assertion))
          })
          return
        }

        const whenPromise = makeWhenPromise(config, test)
        const when = whenPromise.promise
        timer = whenPromise.timer

        when.then(outcome => {
          // the `when` was resolved - run the assertion to see if
          // it produced the expected result
          clearTimeout(timer)
          config.reporter.report({ type: 'startTest' })
          try {
            test.assertions.forEach(assertion => {
              report(assertOne(assertion, () => {
                assertion.test(config.assertionLibrary, null, outcome)
              }))
            })
          } catch (e) {
            return reportAndRejectError({
              behavior: test.behavior,
              error: e
            })
          }

          return resolve()
        }).catch(err => {
          // the `when` was rejected - run the assertion to see if
          // it produced the expected result
          clearTimeout(timer)

          try {
            test.assertions.forEach(assertion => {
              report(assertOne(assertion, () => {
                assertion.test(config.assertionLibrary, err)
              }))
            })
          } catch (e) {
            return reportAndRejectError({
              behavior: test.behavior,
              error: e
            })
          }

          return resolve()
        })
      } catch (e) {
        return reportAndRejectError({
          behavior: test.behavior,
          error: e
        })
      }

      function reportAndRejectError (result) {
        let output = {
          type: 'error',
          behavior: result.behavior,
          error: result.error
        }

        report(output)
        return reject(output)
      }

      function report (result) {
        try {
          config.reporter.report(result)
        } catch (e) {
          console.log(e)
          return reject(e)
        }
      }
    }, 0)
  })
}

function assertOne (assertion, test) {
  try {
    if (assertion.skipped) {
      return {
        type: 'skipped',
        behavior: assertion.behavior
      }
    }

    test()
    return {
      type: 'passed',
      behavior: assertion.behavior
    }
  } catch (e) {
    return {
      type: 'failed',
      behavior: assertion.behavior,
      error: e
    }
  }
}

function makeWhenPromise (config, test) {
  var timer

  return {
    promise: new Promise((resolve, reject) => {
      // wrap the when in a new Promise to enforce a timeout policy
      // and so the when's don't have to define their own promises
      timer = setTimeout(function () {
        let result = {
          type: 'error',
          behavior: test.behavior,
          error: new Error('Timeout: the test exceeded 2000 ms')
        }
        config.reporter.report(result)
        return reject(result)
      }, config.timeout)

      test.when(resolve, reject)
    }),
    timer: timer
  }
}
