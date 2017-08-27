'use strict'
// module.exports at the bottom
const promises = require('./promiseUtils.js')
const TestEvent = require('./TestEvent.js')

// {
//   when: [Function: when],
//   assertions: [{
//     behavior: 'when dividing a number by zero, we get Infinity',
//     test: [Function: we get Infinity]
//   }]
// }
function AsyncTest (test, config) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Promise.resolve({
        test: test,
        config: config,
        timer: null,
        when: null,
        outcomes: []
      }).then(promises.promiseTask(makeWhenPromise))
        .then(promises.promiseTask(runBehavior))
        .then(promises.promiseTask(checkAssertions))
        .then(context => {
          return resolve(context.outcomes)
        })
        .catch(err => {
          let output = new TestEvent({
            type: TestEvent.types.BROKEN,
            behavior: test.behavior,
            error: err && err.error ? err.error : err
          })

          return reject(output)
        })
    }, 0)
  })
} // /AsyncTest

function makeWhenPromise (context, resolve, reject) {
  if (context.test.skipped) {
    context.when = (resolve) => { resolve() }
    return resolve(context)
  }

  context.when = (resolve, reject) => {
    // wrap the when in a new Promise to enforce a timeout policy
    // and so the when's don't have to define their own promises
    context.timer = setTimeout(function () {
      let result = new TestEvent({
        type: TestEvent.types.BROKEN,
        behavior: context.test.behavior,
        error: new Error(`Timeout: the test exceeded ${context.config.timeout} ms`)
      })
      return reject(result)
    }, context.config.timeout)

    context.test.when(resolve, reject)
  }

  return resolve(context)
} // /makeWhenPromise

function runBehavior (context, resolve, reject) {
  new Promise(context.when).then(outcome => {
    // the `when` was resolved - run the assertion to see if
    // it produced the expected result
    context.outcome = outcome
    return resolve(context)
  }).catch(err => {
    if (
      err &&
      err.error &&
      err.error.message.indexOf('Timeout: the test exceeded') > -1
    ) {
      // then `when` thew an error, so a timeout exception was experienced
      context.err = err
      return reject(err)
    }

    // the `when` was rejected - run the assertion to see if
    // it produced the expected result
    context.err = err
    return resolve(context)
  })
} // /runBehavior

function checkAssertions (context, resolve, reject) {
  clearTimeout(context.timer)
  context.test.assertions.forEach(assertion => {
    context.outcomes.push(assertOne(assertion, () => {
      assertion.test(context.config.assertionLibrary, context.err, context.outcome)
    }))
  })

  return resolve(context)
} // /checkAssertions

function assertOne (assertion, test) {
  try {
    if (assertion.skipped) {
      return new TestEvent({
        type: TestEvent.types.SKIPPED,
        behavior: assertion.behavior
      })
    }

    test()
    return new TestEvent({
      type: TestEvent.types.PASSED,
      behavior: assertion.behavior
    })
  } catch (e) {
    return new TestEvent({
      type: TestEvent.types.FAILED,
      behavior: assertion.behavior,
      error: e
    })
  }
} // /assertOne

module.exports = AsyncTest
