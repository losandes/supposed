let publishStartAndEnd = true

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

    const mapper = (config, makeBatch, byMatcher) => (batch) => {
      const batchId = makeBatchId()
      const processed = makeBatch(batch)
        .filter(byMatcher)

      return {
        batchId,
        batch: processed,
        tests: processed.map(theory => new AsyncTest(theory, config.makeTheoryConfig(theory), batchId))
      }
    }

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
          if (publishStartAndEnd) {
            return publish({ type: TestEvent.types.START, time: Date.now(), suiteId: config.name })
              .then(() => context)
          }

          return Promise.resolve(context)
        }).then((context) => {
          const { batchId, plan } = context
          return publish({
            type: TestEvent.types.START_BATCH,
            batchId: batchId,
            time: Date.now(),
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
            time: Date.now(),
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

          if (publishStartAndEnd) {
            return publish(new TestEvent({ type: TestEvent.types.END_TALLY, suiteId: config.name }))
              .then(() => publish(new TestEvent({
                type: TestEvent.types.END,
                time: Date.now(),
                suiteId: config.name,
                totals: batchTotals
              })))
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
      publishStartAndEnd = false

      return publish({ type: TestEvent.types.START, time: Date.now(), suiteId: config.name })
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
          return publish(new TestEvent({ type: TestEvent.types.END_TALLY, suiteId: config.name }))
            .then(() => output)
        })
        .then((output) => {
          // only get the tally _after_ END_TALLY was emitted
          return {
            output,
            tally: Tally.getSimpleTally()
          }
        }).then((context) => {
          return publish(new TestEvent({
            type: TestEvent.types.END,
            time: Date.now(),
            suiteId: config.name,
            totals: context.tally
          })).then(() => context)
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
      const configure = (_suiteConfig) => {
        if (_suiteConfig && suiteConfig) {
          Object.keys(suiteConfig).forEach((key) => {
            _suiteConfig[key] = _suiteConfig[key] || suiteConfig[key]
          })
        }

        clearSubscriptions()
        subscribe(reporterFactory.get(Tally.name))
        const config = makeSuiteConfig(_suiteConfig)
        const { makeBatch } = new BatchComposer(config)
        const byMatcher = matcher(config)
        const mapToTests = mapper(config, makeBatch, byMatcher)
        const test = tester(config, mapToTests)
        const findAndStart = browserRunner(config, test)
        const run = runner(config, test)

        /**
        // Make a newly configured suite
        */

        test.id = config.name

        // @deprecated
        test.printSummary = () => {
          return publish(new TestEvent({
            type: TestEvent.types.END,
            time: Date.now(),
            suiteId: config.name,
            totals: Tally.getSimpleTally()
          }))
        }
        test.getTotals = () => {
          return Tally.getSimpleTally()
        }
        test.suiteName = config.name
        test.runner = (options) => {
          options = options || {}
          if (envvars && envvars.file && typeof envvars.file.test === 'function') {
            options.matchesNamingConvention = envvars.file
          }

          return {
            // find and run (node)
            run: run(() => findFiles(options)
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
        test.reporterFactory = reporterFactory

        return test
      }

      return configure(suiteConfig)
    }

    // Suite.suites = []
    return { Suite }
  } // /factory
} // /module
