module.exports = {
  name: 'AsyncTest',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent, publish } = dependencies

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

    function isPromise (input) {
      return input && typeof input.then === 'function'
    }

    /**
     * Runs `given` and passes any output forward
     * @param {Object} context
     */
    async function runGiven (context) {
      try {
        const actual = context.given()
        context.resultOfGiven = isPromise(actual)
          ? await actual
          : actual

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
    async function runWhen (context) {
      try {
        const actual = context.when(context.resultOfGiven)
        context.resultOfWhen = isPromise(actual)
          ? await actual
          : actual

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
      const promises = context.test.assertions.map((assertion) => {
        return assertOne(context.batchId, assertion, () => {
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

    async function maybeLog (maybePromise) {
      if (isPromise(maybePromise)) {
        const result = await maybePromise()

        if (result && typeof result.log !== 'undefined') {
          return result.log
        }
      } else {
        if (maybePromise && typeof maybePromise.log !== 'undefined') {
          return maybePromise.log
        }
      }
    }

    /**
     * Executes one assertion
     * @param {Object} context
     */
    async function assertOne (batchId, assertion, test) {
      try {
        if (assertion.skipped) {
          return publish({
            type: TestEvent.types.TEST,
            status: TestEvent.status.SKIPPED,
            batchId,
            behavior: assertion.behavior
          })
        }

        const maybePromise = test()

        return publish({
          type: TestEvent.types.TEST,
          status: TestEvent.status.PASSED,
          batchId,
          behavior: assertion.behavior,
          log: await maybeLog(maybePromise)
        })
      } catch (e) {
        return publish({
          type: TestEvent.types.TEST,
          status: TestEvent.status.FAILED,
          batchId,
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
      const self = {
        test: context.test,
        config: context.config,
        batchId: context.batchId,
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

    // {
    //   given: [Function: when],
    //   when: [Function: when],
    //   assertions: [{
    //     behavior: 'when dividing a number by zero, we get Infinity',
    //     test: [Function: we get Infinity]
    //   }]
    // }
    function AsyncTest (test, config, batchId) {
      return () => {
        // we need a Promise wrapper, to timout the test if it never returns
        return new Promise((resolve, reject) => {
          // run the tests concurrently
          setTimeout(() => {
            // setup the intial context
            const context = new Context({
              test: test,
              config: config,
              batchId,
              timer: setTimeout(async () => {
                return resolve(await publish({ // was reject
                  type: TestEvent.types.TEST,
                  status: TestEvent.status.BROKEN,
                  batchId,
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
              }).catch(async (err) => {
                clearTimeout(context.timer)
                return resolve(await publish({ // was reject
                  type: TestEvent.types.TEST,
                  status: TestEvent.status.BROKEN,
                  batchId,
                  behavior: test.behavior,
                  error: err && err.error ? err.error : err
                }))
              }) // /flow
          }, 0) // /setTimeout
        }) // /outer Promise
      } // /wrapper
    } // /AsyncTest

    return { AsyncTest }
  } // /factory
} // /module
