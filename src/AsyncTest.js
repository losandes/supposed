module.exports = {
  name: 'AsyncTest',
  factory: AsyncTestFactory
}

function AsyncTestFactory (TestEvent) {
  'use strict'

  // {
  //   given: [Function: when],
  //   when: [Function: when],
  //   assertions: [{
  //     behavior: 'when dividing a number by zero, we get Infinity',
  //     test: [Function: we get Infinity]
  //   }]
  // }
  return function AsyncTest (test, config) {
    return () => {
      // we need a Promise wrapper, to timout the test if it never returns
      return new Promise((resolve, reject) => {
        // run the tests concurrently
        setTimeout(() => {
          // setup the intial context
          var context = new Context({
            test: test,
            config: config,
            timer: setTimeout(function () {
              return reject(new TestEvent({
                type: TestEvent.types.BROKEN,
                behavior: test.behavior,
                error: new Error(`Timeout: the test exceeded ${context.config.timeout} ms`)
              }))
            }, config.timeout),
            err: null // null is the default
          })

          // run the flow
          return Promise.resolve(context)
            .then(useNoopsIfSkipped)
            .then(runGiven)
            .then(runWhen)
            .then(checkAssertions)
            .then(context => {
              clearTimeout(context.timer)
              return resolve(context.outcomes)
            }).catch(err => {
              clearTimeout(context.timer)
              return reject(new TestEvent({
                type: TestEvent.types.BROKEN,
                behavior: test.behavior,
                error: err && err.error ? err.error : err
              }))
            }) // /flow
        }, 0) // /setTimeout
      }) // /outer Promise
    } // /wrapper
  } // /AsyncTest

  /**
   * If the test is skipped, sets noops for given and when,
   * otherwise sets given and when to associated test variables
   * @param {Object} context
   */
  function useNoopsIfSkipped (context) {
    if (testIsSkipped(context.test)) {
      // there aren't any tests to run
      // set the when to the noop function
      context.given = noop
      context.when = noop
    } else {
      context.given = context.test.given || noop
      context.when = context.test.when
    }

    return context
  }

  function testIsSkipped (test) {
    return test.skipped ||
      (
        // the test isn't skipped, but all of it's assertions are
        test.assertions.filter(a => a.skipped).length ===
        test.assertions.length
      )
  }

  /**
   * Runs `given` and passes any output forward
   * @param {Object} context
   */
  function runGiven (context) {
    try {
      let actual = context.given()

      if (actual && typeof actual.then === 'function') {
        return actual.then(actual => {
          context.resultOfGiven = actual
          return context
        })
      }

      context.resultOfGiven = actual
      return context
    } catch (e) {
      context.err = e
      throw e
    }
  }

  /**
   * Runs `when` and passes any output forward
   * @param {Object} context
   */
  function runWhen (context) {
    try {
      let actual = context.when(context.resultOfGiven)

      if (actual && typeof actual.then === 'function') {
        return actual.then(actual => {
          context.resultOfWhen = actual
          return context
        }).catch(err => {
          context.err = err
          return context
        })
      }

      context.resultOfWhen = actual
      return context
    } catch (e) {
      context.err = e
      return context
    }
  }

  /**
   * Executes the assertions
   * @param {Object} context
   */
  function checkAssertions (context) {
    const promises = []

    context.test.assertions.forEach(assertion => {
      promises.push(assertOne(assertion, () => {
        if (assertion.test.length > 1) {
          // the assertion accepts all arguments to a single function
          return assertion.test(
            context.config.assertionLibrary,
            context.err,
            context.resultOfWhen
          )
        }

        var maybeFunc = assertion.test(context.config.assertionLibrary)

        if (typeof maybeFunc === 'function') {
          // the assertion curries: (t) => (err, actual) => { ... }
          return maybeFunc(context.err, context.resultOfWhen)
        }

        return maybeFunc
      }))
    })

    return Promise.all(promises)
      .then(events => {
        events.forEach(event => {
          context.outcomes.push(Object.assign({ behavior: 'anonymous' }, event))
        })

        return context
      })
  } // /checkAssertions

  /**
   * Executes one assertion
   * @param {Object} context
   */
  function assertOne (assertion, test) {
    try {
      if (assertion.skipped) {
        return Promise.resolve(new TestEvent({
          type: TestEvent.types.SKIPPED,
          behavior: assertion.behavior
        }))
      }

      var maybePromise = test()

      if (maybePromise && typeof maybePromise.then === 'function') {
        return maybePromise.then(() => {
          return new TestEvent({
            type: TestEvent.types.PASSED,
            behavior: assertion.behavior
          })
        }).catch(err => {
          return new TestEvent({
            type: TestEvent.types.FAILED,
            behavior: assertion.behavior,
            error: err
          })
        })
      }

      return Promise.resolve(new TestEvent({
        type: TestEvent.types.PASSED,
        behavior: assertion.behavior
      }))
    } catch (e) {
      return Promise.resolve(new TestEvent({
        type: TestEvent.types.FAILED,
        behavior: assertion.behavior,
        error: e
      }))
    }
  } // /assertOne

  /**
   * The context for one flow
   * @param {Object} context
   */
  function Context (context) {
    var self = {
      test: context.test,
      config: context.config,
      timer: context.timer,
      given: context.given,
      when: context.when,
      resultOfGiven: context.resultOfGiven,
      resultOfWhen: context.resultOfWhen,
      outcomes: context.outcomes || [],
      err: context.err
    }

    return Object.seal(self)
  } // /Context

  function noop () { }
} // /module.exports
