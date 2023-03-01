module.exports = {
  name: 'Suite',
  factory: (dependencies) => {
    'use strict'

    const {
      allSettled,
      AsyncTest,
      findFiles,
      BatchComposer,
      makeSuiteConfig,
      pubsub,
      reporterFactory,
      resolveTests,
      runServer,
      makePlans,
      Tally,
      TestEvent,
      clock,
      envvars,
    } = dependencies

    const makeNormalBatch = (description, assertions) => {
      const batch = {}
      batch[description] = assertions

      return batch
    }

    /**
     * Suite accepts ad-hoc polymorphic input. This function figures out what
     * combination of inputs are present, and returns a consistent interface:
     * @param description {string|object|function} - Either a description, a batch, or an assertion
     * @param assertions {object|function} - Either a batch, or an assertion
     *
     *   {
     *     [description: string]: IBDD | IBehaviors | IAssert | ICurriedAssert | IPromiseOrFunction
     *   }
     */
    const normalizeBatch = (description, assertions) => {
      const descriptionType = typeof description
      const assertionsType = typeof assertions

      if (descriptionType === 'string' && assertionsType === 'function') {
        // description, IAssert
        return Promise.resolve(makeNormalBatch(description, { '': assertions }))
      } else if (descriptionType === 'string') {
        // description, IBDD|IAAA|IVow
        return Promise.resolve(makeNormalBatch(description, assertions))
      } else if (descriptionType === 'object') {
        // description is IBDD|IAAA|IVow
        return Promise.resolve(description)
      } else if (descriptionType === 'function') {
        // description is IAssert
        return Promise.resolve({ '': description })
      } else {
        return Promise.reject(new Error('An invalid test was found: a test or batch of tests is required'))
      }
    } // /normalizebatch

    /**
     * If `match` is present in the config, this will test the assertions in
     * a batch to identity whether or not they match
     * @curried
     * @param config {object} - the Suite options
     * @param theory {object} - one result of makeBatch (`mapper`) (a batch is an array of theories)
     */
    const matcher = (config) => (theory) => {
      if (!config.match) {
        return true
      }

      for (let i = 0; i < theory.assertions.length; i += 1) {
        if (config.match.test(theory.assertions[i].behavior)) {
          return true
        }
      }
    }

    /**
     * Maps the result of normalizeBatch to a batch:
     * @curried
     * @param config {object} - the Suite options
     * @param makeBatch {function} - a configured instance of the BatchComposer
     * @param byMatcher {function} - a configured instance of `matcher`
     * @param batch {function} - the result of normalized batch
     *
     *   {
     *     batchId: string;
     *     batch: IBatch,
     *     tests: IAsyncTest[]
     *   }
     */
    const mapper = (config, makeBatch, makeBatchId, byMatcher) => (batch) => {
      const theories = makeBatch(batch)
        .filter(byMatcher)

      return {
        batchId: theories.length ? theories[0].id : makeBatchId(),
        theories,
      }
    }

    const isPlan = (maybePlan) => {
      return typeof maybePlan !== 'undefined' &&
        maybePlan !== null &&
        typeof maybePlan.count === 'number' &&
        typeof maybePlan.completed === 'number' &&
        Array.isArray(maybePlan.batches) &&
        Array.isArray(maybePlan.order)
    }

    const planner = (config, mapToBatch) => {
      const makeEmptyPlan = () => {
        return {
          count: 0,
          completed: 0,
          batches: [],
          order: [],
        }
      }

      let plan = makeEmptyPlan()
      let lastPlanEntry

      const addToPlan = (description, assertions) => {
        lastPlanEntry = clock('ms')
        return normalizeBatch(description, assertions)
          .then(mapToBatch)
          .then((context) => {
            if (context.theories.length) {
              plan.batches.push(context)
              context.theories.forEach((theory) => {
                theory.assertions.forEach((assertion) => plan.order.push(assertion.id))
              })

              plan.count = plan.order.length
            }

            return plan
          })
      }

      addToPlan.getPlan = () => plan
      addToPlan.resetPlan = () => {
        plan = makeEmptyPlan()
      }
      addToPlan.lastPlanEntry = () => lastPlanEntry

      return addToPlan
    }

    const brokenTestPublisher = (suiteId) => (error) => pubsub.publish({
      type: TestEvent.types.TEST,
      status: TestEvent.status.BROKEN,
      behavior: `Failed to load test: ${error.filePath}`,
      suiteId,
      error,
    })

    /**
     * Merges the values of allSettled results into a single array of values.
     * > NOTE this does not deal with undefined values
     * @param prop - the name of the property to merge (value, or reason)
     */
    const toOneArray = (prop) => (output, current) => {
      return Array.isArray(current[prop])
        ? output.concat(current[prop])
        : output.concat([current[prop]])
    }

    const fulfilledToOneArray = toOneArray('value')
    const failedToOneArray = toOneArray('reason')

    const batchRunner = (config, publishOneBrokenTest) => (batch, plan) => {
      return pubsub.publish({
        type: TestEvent.types.START_BATCH,
        batchId: batch.batchId,
        suiteId: config.name,
      }).then(() => {
        // map the batch theories to tests
        return batch.theories.map((theory) => new AsyncTest(
          theory,
          config.makeTheoryConfig(theory),
          batch.batchId,
          config.name,
        ))
      }).then((tests) => allSettled(tests.map((test) => test())))
        .then((results) => {
          return {
            results: results
              .filter((result) => result.status === 'fulfilled')
              .reduce(fulfilledToOneArray, []),
            broken: results
              .filter((result) => result.status !== 'fulfilled')
              .reduce(failedToOneArray, []),
            batchTotals: Tally.getTally().batches[batch.batchId],
          }
        }).then((context) => {
          const publishEndBatch = () => pubsub.publish({
            type: TestEvent.types.END_BATCH,
            batchId: batch.batchId,
            suiteId: config.name,
            totals: context.batchTotals,
          })

          if (Array.isArray(context.broken) && context.broken.length) {
            // these tests failed during the planning stage
            return allSettled(context.broken.map(publishOneBrokenTest))
              .then(publishEndBatch)
              .then(() => context)
          } else {
            return publishEndBatch().then(() => context)
          }
        }).then((context) => {
          return {
            batchId: batch.batchId,
            results: context.results,
            broken: context.broken,
            totals: context.batchTotals,
          }
        })
    } // /batchRunner

    const reportRegistrar = (config) => () => {
      config.registerReporters()
      config.reporters.forEach((reporter) => {
        if (!pubsub.subscriptionExists(reporter.name)) {
          pubsub.subscribe(reporter)
        }
      })
      config.subscriptions = pubsub.allSubscriptions()
    }

    const tester = (config, registerReporters, runBatch, runnerMode) => (plan) => {
      if (!runnerMode) {
        registerReporters()
      }

      return Promise.resolve({ plan })
        .then((context) => Promise.all(context.plan.batches.map(
          (batch) => runBatch(batch, context.plan),
        )))
        .then((context) => {
          if (Array.isArray(context) && context.length === 1) {
            return context[0]
          }

          return context
        }).catch((e) => {
          pubsub.publish({
            type: TestEvent.types.TEST,
            status: TestEvent.status.BROKEN,
            behavior: 'Failed to load test',
            suiteId: config.name,
            error: e,
          })
          throw e
        })
    }

    const reduceOutputToResults = (output) => {
      if (!Array.isArray(output) && output && output.results) {
        return output.results
      } else if (!Array.isArray(output) && output) {
        return [output.results]
      } else if (!Array.isArray(output)) {
        return []
      } else {
        return output.reduce((results, batchResult) => {
          if (batchResult) {
            return results.concat(batchResult.results)
          } else {
            return results
          }
        }, [])
      }
    }

    const runner = (config, registerReporters, suite, publishOneBrokenTest, execute) => (planContext) => {
      const { plan, files, broken } = planContext
      registerReporters()

      return pubsub.publish({
        type: TestEvent.types.START,
        suiteId: config.name,
        plan,
      }).then(() => {
        if (broken && broken.length) {
          // these tests failed during the planning stage
          return allSettled(broken.map(publishOneBrokenTest))
        }
      }).then(() => execute(plan))
        .then((output) =>
          pubsub.publish({ type: TestEvent.types.END_TALLY, suiteId: config.name })
            .then(() => output), // pass through
        )
        .then((output) =>
          pubsub.publish({
            type: TestEvent.types.FINAL_TALLY,
            suiteId: config.name,
            totals: Tally.getTally(),
          }).then(() => output), // pass through
        )
        .then((output) => {
          // only get the tally _after_ END_TALLY was emitted
          return { output, tally: Tally.getSimpleTally() }
        })
        .then((context) => {
          plan.completed = context.tally.total

          return pubsub.publish({
            type: TestEvent.types.END,
            suiteId: config.name,
            totals: context.tally,
            plan,
          }).then(() => context) // pass through
        })
        .then((context) => {
          context.results = reduceOutputToResults(context.output)
          return context
        })
        .then((context) => {
          return {
            files: files || [],
            results: context.results,
            broken: broken || [],
            runConfig: planContext.runConfig,
            suite,
            totals: context.tally,
          }
        })
        .catch((e) => {
          pubsub.publish({
            type: TestEvent.types.TEST,
            status: TestEvent.status.BROKEN,
            behavior: 'Failed to load test',
            suiteId: config.name,
            error: e,
          })
          throw e
        })
    }

    const browserRunner = (config, registerReporters, test) => (options) => () => {
      registerReporters()

      return Array.isArray(options.paths)
        ? runServer(test, options)(options)
        : findFiles(options).then(runServer(test, options))
    }

    /**
     * By default, use the envvars, which are a result of `makeSuiteConfig`
     * in the composition root.
     * If `Suite().configure({ ... })` was executed, use the config arg to
     * the `configure` function.
     * If `Suite({ ... })` was executed, use the config arg to the `Suite` function
     *
     * NOTE that merging the `configure` arg onto the `Suite` arg is not supported
     * @param suiteConfig - the arg that was passed to Suite
     * @param suiteDotConfigureOptions - the arg that was passed to `configure`
     */
    const _makeSuiteConfig = (suiteConfig, suiteDotConfigureOptions) => {
      if (!suiteConfig && !suiteDotConfigureOptions) {
        return envvars // envvars is the default makeSuiteConfig
      } else if (suiteDotConfigureOptions) {
        // Suite().configure({ ... })
        return makeSuiteConfig(suiteDotConfigureOptions)
      } else if (suiteConfig) {
        // Suite({ ... })
        return makeSuiteConfig(suiteConfig)
      }
    }

    /**
     * The test library
     * @param {Object} suiteConfig : optional configuration
    */
    function Suite (suiteConfig) {
      let runnerMode = false
      let waitingToRun = false

      /**
       * @param suiteDotConfigureOptions - configuration provided in line with `supposed.Suite().configure(suiteDotConfigureOptions)`
       */
      const configure = (suiteDotConfigureOptions) => {
        pubsub.reset()
        pubsub.subscribe(reporterFactory.get(Tally.name))
        const _suiteConfig = _makeSuiteConfig(suiteConfig, suiteDotConfigureOptions)
        const registerReporters = reportRegistrar(_suiteConfig)
        const publishOneBrokenTest = brokenTestPublisher(_suiteConfig.name)
        const { makeBatch, makeBatchId } = new BatchComposer(_suiteConfig)
        const byMatcher = matcher(_suiteConfig)
        const mapToBatch = mapper(_suiteConfig, makeBatch, makeBatchId, byMatcher)
        const runBatch = batchRunner(_suiteConfig, publishOneBrokenTest)
        const plan = planner(_suiteConfig, mapToBatch)
        const waitToRun = () => new Promise((resolve, reject) => {
          if (waitingToRun) {
            return
          }

          waitingToRun = true
          setTimeout(() => {
            const lastPlanEntry = plan.lastPlanEntry()
            const now = clock('ms')

            if (lastPlanEntry && (now - lastPlanEntry) > _suiteConfig.planBuffer) {
              test.runner().runTests({ plan: plan.getPlan() }).then(resolve).catch(reject)
            } else {
              waitToRun()
            }
          }, _suiteConfig.planBuffer * 2)
        })
        const test = (description, assertions) => {
          if (runnerMode) {
            return plan(description, assertions)
          } else {
            // waitToRun()
            return plan(description, assertions).then(waitToRun)
          }
        }

        test.id = _suiteConfig.name
        test.plan = plan
        test.config = _suiteConfig
        test.dependencies = _suiteConfig.inject
        test.configure = configure
        test.reporterFactory = reporterFactory
        test.registerReporters = registerReporters
        test.publish = (event) => {
          return pubsub.publish(event).then(() => test)
        }
        test.subscribe = (subscription) => {
          pubsub.subscribe(subscription)
          return test
        }

        test.runner = (runConfig) => {
          runnerMode = true
          runConfig = runConfig || {}
          if (envvars.file) {
            runConfig.matchesNamingConvention = envvars.file
          }

          const findAndStart = browserRunner(_suiteConfig, registerReporters, test)
          const addPlanToContext = () => (context) => {
            context.plan = plan.getPlan()
            Object.freeze(context.files)
            Object.freeze(context.config)
            return Object.freeze(context)
          }

          const findAndPlan = () => {
            return findFiles(runConfig)
              .then(resolveTests())
              .then(makePlans(test))
              .then(addPlanToContext())
          }

          const run = () => runner(
            _suiteConfig,
            registerReporters,
            test,
            publishOneBrokenTest,
            tester(_suiteConfig, registerReporters, runBatch, runnerMode),
          )

          const runTests = (planOrTests) => {
            if (planOrTests && isPlan(planOrTests.plan)) {
              return Promise.resolve(planOrTests)
                .then(run())
                .then(_suiteConfig.exit)
            }

            if (Array.isArray(planOrTests)) {
              runConfig.tests = planOrTests
            } else if (typeof planOrTests === 'function') {
              runConfig.tests = planOrTests()
            }

            return makePlans(test)(runConfig)
              .then(addPlanToContext())
              .then(run())
              .then(_suiteConfig.exit)
          }

          return {
            // find and plan (node)
            plan: findAndPlan,
            // find and run (node)
            run: () => findAndPlan().then(runTests),
            // run (browser|node)
            runTests,
            // start test server (browser)
            startServer: findAndStart(runConfig),
          }
        }

        // @deprecated - may go away in the future
        test.printSummary = () => {
          return pubsub.publish({
            type: TestEvent.types.END,
            suiteId: _suiteConfig.name,
            totals: Tally.getSimpleTally(),
          })
        }
        // @deprecated - may go away in the future
        test.getTotals = () => {
          return Tally.getSimpleTally()
        }

        return test
      }

      return configure()
    }

    // Suite.suites = []
    return { Suite }
  }, // /factory
} // /module
