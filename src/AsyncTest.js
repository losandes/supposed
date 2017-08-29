module.exports = function (TestEvent) {
  'use strict'

  const makeGivenCurry = (context) => (resolve, reject) => {
    if (context.test.skipped) {
      return resolve(context)
    }

    if (context.test.given) {
      context.given = (resolve, reject) => {
        // wrap the when in a new Promise to enforce a timeout policy
        // and so the when's don't have to define their own promises
        context.givenTimer = setTimeout(function () {
          let result = new TestEvent({
            type: TestEvent.types.BROKEN,
            behavior: context.test.behavior,
            error: new Error(`Timeout: the test exceeded ${context.config.timeout} ms`)
          })
          return reject(result)
        }, context.config.timeout)

        context.test.given(resolve, reject)
      }
    }

    return resolve(context)
  }

  const makeWhenCurry = (context) => (resolve, reject) => {
    if (context.test.skipped) {
      context.when = (resolve) => { resolve() }
      return resolve(context)
    }

    const when = (resolve, reject) => {
      // wrap the when in a new Promise to enforce a timeout policy
      // and so the when's don't have to define their own promises
      context.whenTimer = setTimeout(function () {
        let result = new TestEvent({
          type: TestEvent.types.BROKEN,
          behavior: context.test.behavior,
          error: new Error(`Timeout: the test exceeded ${context.config.timeout} ms`)
        })
        return reject(result)
      }, context.config.timeout)

      context.test.when(resolve, reject)
    }

    if (context.given) {
      context.when = (given) => when
    } else {
      context.when = when
    }

    return resolve(context)
  } // /makeWhenCurry

  const runBehavior = (context) => (resolve, reject) => {
    var behavior

    if (context.given) {
      behavior = new Promise(context.given)
        .then(new Promise(context.when))
    } else {
      behavior = new Promise(context.when)
    }

    behavior.then(outcome => {
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

  const checkAssertions = (context) => (resolve, reject) => {
    clearTimeout(context.givenTimer)
    clearTimeout(context.whenTimer)

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
          givenTimer: null,
          whenTimer: null,
          given: null,
          when: null,
          outcomes: []
        }).then(context => new Promise(makeGivenCurry(context)))
          .then(context => new Promise(makeWhenCurry(context)))
          .then(context => new Promise(runBehavior(context)))
          .then(context => new Promise(checkAssertions(context)))
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

  return AsyncTest
}
