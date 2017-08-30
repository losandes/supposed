module.exports = function (TestEvent) {
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
      return Promise.resolve(new Context({
        test: test,
        config: config
      })).then(maybeWrapGivenWithTimeout)
        .then(wrapWhenWithTimeout)
        .then(maybeRunGiven)
        .then(maybeMakeGivenWhenPromise)
        .then(maybeMakeWhenPromise)
        .then(checkWhen)
        .then(checkAssertions)
        .then(context => {
          return context.outcomes
        }).catch(err => {
          return new TestEvent({
            type: TestEvent.types.BROKEN,
            behavior: test.behavior,
            error: err && err.error ? err.error : err
          })
        }) // /flow
    } // /wrapper
  } // /AsyncTest

  /**
   * If the test has a `given`, this wraps it with a timeout
   * @param {Object} context
   */
  function maybeWrapGivenWithTimeout (context) {
    if (context.test.skipped || !context.test.given) {
      return context
    }

    context.given = (resolve, reject) => {
      // wrap the when in a new Promise to enforce a timeout policy
      // and so the when's don't have to define their own promises
      context.givenTimer = setTimeout(function () {
        return reject(new Error(`Timeout: the test exceeded ${context.config.timeout} ms`))
      }, context.config.timeout)

      context.test.given(resolve, reject)
    }

    return context
  } // /maybeWrapGivenWithTimeout

  /**
   * Wraps the test's `when` with a timeout
   * @param {Object} context
   */
  function wrapWhenWithTimeout (context) {
    if (context.test.skipped) {
      context.when = (resolve) => { resolve() }
      return context
    }

    context.when = (resolve, reject) => {
      // wrap the when in a new Promise to enforce a timeout policy
      // and so the when's don't have to define their own promises
      context.whenTimer = setTimeout(function () {
        return reject(new Error(`Timeout: the test exceeded ${context.config.timeout} ms`))
      }, context.config.timeout)

      return context.test.when(resolve, reject)
    }

    return context
  } // /wrapWhenWithTimeout

  /**
   * If the test has a `given`, this executes that promise
   * @param {Object} context
   */
  function maybeRunGiven (context) {
    if (!context.given) {
      // there is no given - move on
      return context
    }

    return new Promise(context.given)
      .then(given => {
        context.resultOfGiven = given
        return context
      })
      .catch(err => {
        // then `given` thew an error - bail out!
        clearTimeout(context.givenTimer)
        clearTimeout(context.whenTimer)
        context.err = err
        throw err
      })
  } // /maybeRunGiven

  /**
   * If the test has a `given`, this makes a promise that will figure out
   * if the `when` curries to get the value from given, or not
   * @param {Object} context
   */
  function maybeMakeGivenWhenPromise (context) {
    if (!context.given) {
      // there is no given - move on
      return context
    }

    context.whenPromise = () => new Promise((resolve, reject) => {
      const maybeFunc = context.when(resolve, reject)
      if (typeof maybeFunc === 'function') {
        // `when` wants the value that came from given
        return maybeFunc(context.resultOfGiven)
      } else {
        // `when` is not intereted in `given` output
        return maybeFunc
      }
    })

    return context
  } // /maybeMakeGivenWhenPromise

  /**
   * If the test does not have a `given`, this makes a promise that executes
   * the when
   * @param {Object} context
   */
  function maybeMakeWhenPromise (context) {
    if (context.whenPromise) {
      // a `given` was present, so maybeRunGivenWhen ran the `when`
      return context
    }

    context.whenPromise = () => new Promise(context.when)
    return context
  } // /maybeMakeWhenPromise

  /**
   * Executes the when promise
   * @param {Object} context
   */
  function checkWhen (context) {
    return context.whenPromise()
      .then(outcome => {
        // the `when` was resolved - move on to running assertions
        context.resultOfWhen = outcome
        return context
      }).catch(err => {
        if (
          err &&
          err.message.indexOf('Timeout: the test exceeded') > -1
        ) {
          // then `when` never resolved, or it thew an error,
          // so a timeout exception was experienced
          context.err = err
          throw err
        }

        // the `when` was rejected - run the assertion to see if
        // it produced the expected result
        context.err = err
        return context
      })
  } // /checkWhen

  /**
   * Executes the assertions
   * @param {Object} context
   */
  function checkAssertions (context) {
    clearTimeout(context.givenTimer)
    clearTimeout(context.whenTimer)

    context.test.assertions.forEach(assertion => {
      context.outcomes.push(assertOne(assertion, () => {
        assertion.test(context.config.assertionLibrary, context.err, context.resultOfWhen)
      }))
    })

    return context
  } // /checkAssertions

  /**
   * Executes one assertion
   * @param {Object} context
   */
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

  /**
   * The context for one flow
   * @param {Object} context
   */
  function Context (context) {
    var self = {
      test: context.test,
      config: context.config,
      givenTimer: context.givenTimer,
      whenTimer: context.whenTimer,
      given: context.given,
      when: context.when,
      whenPromise: context.whenPromise,
      resultOfGiven: context.resultOfGiven,
      resultOfWhen: context.resultOfWhen,
      outcomes: context.outcomes || [],
      err: context.err
    }

    return Object.seal(self)
  } // /Context
} // /module.exports
