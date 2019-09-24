module.exports = {
  name: 'AsyncTest',
  factory: (dependencies) => {
    'use strict'

    const { isPromise, pubsub, TestEvent, clock, duration, addDurations } = dependencies
    const { publish } = pubsub

    function noop () { }

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
      if (typeof context.given !== 'function' && typeof context.given !== 'object') {
        return Promise.resolve(context)
      }

      try {
        const startTime = clock()
        const actual = context.given()
        if (isPromise(actual)) {
          return actual.then((value) => {
            context.resultOfGiven = value
            return context
          }).catch((e) => {
            context.err = e
            throw e
          })
        }

        context.givenDuration = duration(startTime, clock())
        context.resultOfGiven = actual
        return Promise.resolve(context)
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
      if (typeof context.when !== 'function' && typeof context.when !== 'object') {
        return Promise.resolve(context)
      }

      try {
        const startTime = clock()
        const actual = context.when(context.resultOfGiven)
        if (isPromise(actual)) {
          return actual.then((value) => {
            context.resultOfWhen = value
            return context
          }).catch((e) => {
            context.err = e
            return context
          })
        }

        context.whenDuration = duration(startTime, clock())
        context.resultOfWhen = actual
        return Promise.resolve(context)
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
      const promises = context.test.assertions.map((assertion) => {
        return assertOne(context, assertion, () => {
          if (assertion.test.length > 1) {
            // the assertion accepts all arguments to a single function
            return assertion.test(
              context.config.assertionLibrary,
              context.err,
              context.resultOfWhen
            )
          }

          const maybeFunc = assertion.test(context.config.assertionLibrary)

          if (typeof maybeFunc === 'function') {
            // the assertion curries: (t) => (err, actual) => { ... }
            return maybeFunc(context.err, context.resultOfWhen)
          }

          return maybeFunc
        })
      })

      return Promise.all(promises)
        .then(events => {
          if (!Array.isArray(events)) {
            return context
          }

          events.forEach(event => {
            context.outcomes.push(Object.assign({ behavior: 'anonymous' }, event))
          })

          return context
        })
    } // /checkAssertions

    function maybeLog (result) {
      return result && typeof result.log !== 'undefined' ? result.log : undefined
    }

    function maybeContext (result) {
      return result && typeof result.context !== 'undefined' ? result.context : undefined
    }

    /**
     * Executes one assertion
     * @param {Object} context
     */
    function assertOne (context, assertion, test) {
      const { batchId, givenDuration, whenDuration } = context

      const pass = (startTime) => (result) => {
        const endTime = clock()
        const _dur = duration(startTime, endTime)

        return publish({
          type: TestEvent.types.TEST,
          status: TestEvent.status.PASSED,
          suiteId: context.suiteId,
          batchId,
          testId: assertion.id,
          behavior: assertion.behavior,
          behaviors: assertion.behaviors,
          time: endTime,
          duration: {
            given: givenDuration,
            when: whenDuration,
            then: _dur,
            total: addDurations(givenDuration, whenDuration, _dur)
          },
          log: maybeLog(result),
          context: maybeContext(result)
        })
      }
      const fail = (e) => publish({
        type: TestEvent.types.TEST,
        status: TestEvent.status.FAILED,
        suiteId: context.suiteId,
        batchId,
        testId: assertion.id,
        behavior: assertion.behavior,
        behaviors: assertion.behaviors,
        error: e
      })

      try {
        if (assertion.skipped) {
          return publish({
            type: TestEvent.types.TEST,
            status: TestEvent.status.SKIPPED,
            suiteId: context.suiteId,
            batchId,
            testId: assertion.id,
            behavior: assertion.behavior,
            behaviors: assertion.behaviors
          })
        }

        let startTime

        return publish({
          type: TestEvent.types.START_TEST,
          suiteId: context.suiteId,
          batchId,
          testId: assertion.id,
          behavior: assertion.behavior,
          behaviors: assertion.behaviors
        }).then(() => {
          startTime = clock()
        }).then(() => test())
          .then((result) => pass(startTime)(result))
          .catch(fail)
      } catch (e) {
        return fail(e)
      }
    } // /assertOne

    /**
     * The context for one flow
     * @param {Object} context
     */
    function Context (context) {
      const self = {
        test: context.test,
        config: context.config,
        suiteId: context.suiteId,
        batchId: context.batchId,
        timer: context.timer,
        given: context.given,
        when: context.when,
        resultOfGiven: context.resultOfGiven,
        resultOfWhen: context.resultOfWhen,
        givenDuration: context.givenDuration || Object.seal({
          seconds: -1,
          milliseconds: -1,
          microseconds: -1,
          nanoseconds: -1
        }),
        whenDuration: context.whenDuration || Object.seal({
          seconds: -1,
          milliseconds: -1,
          microseconds: -1,
          nanoseconds: -1
        }),
        outcomes: context.outcomes || [],
        err: context.err
      }

      return Object.seal(self)
    } // /Context

    // {
    //   given: [Function: when],
    //   when: [Function: when],
    //   assertions: [{
    //     behavior: 'when dividing a number by zero, we get Infinity',
    //     test: [Function: we get Infinity]
    //   }]
    // }
    function AsyncTest (test, config, batchId, suiteId) {
      return () => {
        // we need a Promise wrapper, to timout the test if it never returns
        return new Promise((resolve, reject) => {
          // run the tests concurrently
          setTimeout(() => {
            // setup the intial context
            const context = new Context({
              test: test,
              config: config,
              suiteId,
              batchId,
              timer: setTimeout(() => {
                publish({
                  type: TestEvent.types.TEST,
                  status: TestEvent.status.BROKEN,
                  suiteId,
                  batchId,
                  behavior: test.behavior,
                  behaviors: test.behaviors,
                  error: new Error(`Timeout: the test exceeded ${context.config.timeout} ms`)
                }).then(resolve)
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
              }).catch((err) => {
                clearTimeout(context.timer)
                publish({
                  type: TestEvent.types.TEST,
                  status: TestEvent.status.BROKEN,
                  suiteId,
                  batchId,
                  behavior: test.behavior,
                  behaviors: test.behaviors,
                  error: err && err.error ? err.error : err
                }).then(resolve)
              }) // /flow
          }, 0) // /setTimeout
        }) // /outer Promise
      } // /wrapper
    } // /AsyncTest

    return { AsyncTest }
  } // /factory
} // /module
