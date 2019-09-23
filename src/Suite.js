let runnerMode = false

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
      publish,
      subscribe,
      clearSubscriptions,
      reporterFactory,
      resolveTests,
      runServer,
      runTests,
      Tally,
      TestEvent
    } = dependencies

    const makeBatchId = () => `B${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`

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
    const mapper = (config, makeBatch, byMatcher) => (batch) => {
      const processed = makeBatch(batch)
        .filter(byMatcher)
      const batchId = processed.length ? processed[0].id : makeBatchId()

      return {
        batchId,
        batch: processed,
        tests: processed.map((theory) => new AsyncTest(theory, config.makeTheoryConfig(theory), batchId, config.name))
      }
    }

    /**
     * Merges the values of allSettled results into a single array of values.
     * > NOTE this does not deal with undefined values
     * @param results - the allSettled results
     */
    const reduceResults = (results) => {
      return results.reduce((output, current) => {
        return Array.isArray(current.value)
          ? output.concat(current.value)
          : output.concat([current.value])
      }, [])
    }

    const tester = (config, mapToTests) => (description, assertions) => {
      return normalizeBatch(description, assertions)
        .then(mapToTests)
        .then((context) => {
          context.plan = {
            count: context.batch.reduce((count, item) => count + item.assertions.length, 0),
            completed: 0
          }

          return context
        }).then((context) => {
          if (!runnerMode) {
            return publish({ type: TestEvent.types.START, suiteId: config.name })
              .then(() => context)
          }

          return Promise.resolve(context)
        }).then((context) => {
          const { batchId, plan } = context
          return publish({
            type: TestEvent.types.START_BATCH,
            batchId: batchId,
            suiteId: config.name,
            plan
          }).then(() => context)
        }).then((context) => {
          const { batchId, tests } = context

          return allSettled(tests.map((test) => test()))
            .then((results) => {
              context.results = results
              context.batchTotals = Tally.getTally().batches[batchId]
              return context
            })
        }).then((context) => {
          const { batchId, plan, batchTotals } = context

          return publish({
            type: TestEvent.types.END_BATCH,
            batchId: batchId,
            suiteId: config.name,
            plan: {
              count: plan.count,
              completed: batchTotals.total
            },
            totals: batchTotals
          }).then(() => context)
        }).then((context) => {
          const { batchId, batchTotals, results } = context
          const output = {
            batchId: batchId,
            results: reduceResults(results),
            totals: batchTotals
          }

          if (!runnerMode) {
            return publish({ type: TestEvent.types.END_TALLY, suiteId: config.name })
              .then(() => publish({
                type: TestEvent.types.END,
                suiteId: config.name,
                totals: batchTotals
              }))
              .then(() => output)
          }

          return Promise.resolve(output)
        }).catch((e) => {
          publish({
            type: TestEvent.types.TEST,
            status: TestEvent.status.BROKEN,
            behavior: 'Failed to load test',
            suiteId: config.name,
            error: e
          })
          throw e
        })
    }

    const runner = (config, test) => (findAndRun) => () => {
      runnerMode = true

      return publish({ type: TestEvent.types.START, suiteId: config.name })
        .then(() => findAndRun())
        .then((output) => {
          if (output.broken.length) {
            // these tests failed before being executed

            const brokenPromises = output.broken
              .map((error) => publish({
                type: TestEvent.types.TEST,
                status: TestEvent.status.BROKEN,
                behavior: `Failed to load test: ${error.filePath}`,
                suiteId: config.name,
                error
              }))

            return allSettled(brokenPromises).then(() => output)
          }

          return Promise.resolve(output)
        })
        .then((output) => {
          return publish({ type: TestEvent.types.END_TALLY, suiteId: config.name })
            .then(() => output)
        })
        .then((output) => {
          return publish({
            type: TestEvent.types.FINAL_TALLY,
            suiteId: config.name,
            totals: Tally.getTally()
          })
            .then(() => output)
        })
        .then((output) => {
          // only get the tally _after_ END_TALLY was emitted
          return {
            output,
            tally: Tally.getSimpleTally()
          }
        }).then((context) => {
          return publish({
            type: TestEvent.types.END,
            suiteId: config.name,
            totals: context.tally
          }).then(() => context)
        }).then(({ output, tally }) => {
          return {
            files: output.files,
            results: output.results,
            broken: output.broken,
            config: output.config,
            suite: test,
            totals: tally
          }
        })
    }

    const browserRunner = (config, test) => (options) => () => {
      return Array.isArray(options.paths)
        ? runServer(test, options)(options)
        : findFiles(options).then(runServer(test, options))
    }

    /**
     * The test library
     * @param {Object} suiteConfig : optional configuration
    */
    function Suite (suiteConfig, envvars) {
      suiteConfig = { ...suiteConfig }

      /**
       * @param suiteDotConfigureOptions - configuration provided in line with `supposed.Suite().configure(suiteDotConfigureOptions)`
       */
      const configure = (suiteDotConfigureOptions) => {
        suiteDotConfigureOptions = { ...suiteDotConfigureOptions }

        const _suiteConfig = Object.keys(suiteConfig)
          .concat(Object.keys(suiteDotConfigureOptions))
          .reduce((cfg, key) => {
            cfg[key] = typeof suiteDotConfigureOptions[key] !== 'undefined' ? suiteDotConfigureOptions[key] : suiteConfig[key]
            return cfg
          }, {})

        clearSubscriptions()
        subscribe(reporterFactory.get(Tally.name))
        const config = makeSuiteConfig(_suiteConfig)
        const { makeBatch } = new BatchComposer(config)
        const byMatcher = matcher(config)
        const mapToTests = mapper(config, makeBatch, byMatcher)
        const test = tester(config, mapToTests)
        const findAndStart = browserRunner(config, test)
        const run = runner(config, test)

        test.id = config.name
        test.runner = (options) => {
          options = options || {}
          if (envvars && envvars.file && typeof envvars.file.test === 'function') {
            options.matchesNamingConvention = envvars.file
          }

          return {
            // find and run (node)
            run: run(
              () => findFiles(options)
                .then(resolveTests(test))
                .then(runTests(test))
            ),
            // run (browser|node)
            runTests: (tests) => {
              if (Array.isArray(tests)) {
                options.tests = tests
              }

              return run(() => runTests(test)(options))()
            },
            // start test server (browser)
            startServer: findAndStart(options)
          }
        }
        test.reporters = config.reporters
        test.config = config
        test.configure = configure
        test.subscribe = (subscription) => {
          subscribe(subscription)
          return test
        }
        test.dependencies = _suiteConfig && _suiteConfig.inject

        // @deprecated - may go away in the future
        test.printSummary = () => {
          return publish({
            type: TestEvent.types.END,
            suiteId: config.name,
            totals: Tally.getSimpleTally()
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
  } // /factory
} // /module
