module.exports = {
  name: 'Suite',
  factory: (dependencies) => {
    'use strict'

    const {
      allSettled,
      AsyncTest,
      findFiles,
      makeBatch,
      makeSuiteConfig,
      publish,
      subscribe,
      reporterFactory,
      runServer,
      runTests,
      Tally,
      TestEvent
    } = dependencies

    const makeBatchId = () => `B${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`
    let publishStartAndEnd = true

    const makeNormalBatch = (description, assertions) => {
      const batch = {}
      batch[description] = assertions

      return batch
    }

    const normalizeBatch = async (description, assertions) => {
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

    const mapper = (config, byMatcher) => (batch) => {
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

    const tester = (config, mapToTests) => async (behaviorOrBatch, sut) => {
      try {
        const batch = await normalizeBatch(behaviorOrBatch, sut)
        const context = mapToTests(batch)
        const plan = {
          count: context.batch.reduce((count, item) => count + item.assertions.length, 0),
          completed: 0
        }

        if (publishStartAndEnd) {
          await publish({ type: TestEvent.types.START, time: Date.now(), suiteId: config.name })
        }

        await publish({
          type: TestEvent.types.START_BATCH,
          batchId: context.batchId,
          time: Date.now(),
          suiteId: config.name,
          plan
        })

        const results = await allSettled(context.tests.map((test) => test()))
        const batchTotals = Tally.getTally().batches[context.batchId]

        await publish({
          type: TestEvent.types.END_BATCH,
          batchId: context.batchId,
          time: Date.now(),
          suiteId: config.name,
          plan: {
            count: plan.count,
            completed: batchTotals.total
          },
          totals: batchTotals
        })

        if (publishStartAndEnd) {
          await publish(new TestEvent({ type: TestEvent.types.END_TALLY, suiteId: config.name }))
          await publish(new TestEvent({
            type: TestEvent.types.END,
            time: Date.now(),
            suiteId: config.name,
            totals: batchTotals
          }))

          return {
            batchId: context.batchId,
            results: reduceResults(results),
            totals: batchTotals
          }
        }

        return {
          batchId: context.batchId,
          results: reduceResults(results),
          totals: batchTotals
        }
      } catch (e) {
        publish({
          type: TestEvent.types.TEST,
          status: TestEvent.status.BROKEN,
          behavior: 'Failed to load test',
          suiteId: config.name,
          error: e
        })
        throw e
      }
    }

    const nodeRunner = (config, test) => (options) => async () => {
      publishStartAndEnd = false
      await publish({ type: TestEvent.types.START, time: Date.now(), suiteId: config.name })
      const output = await findFiles(options).then(runTests(test))

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

        await allSettled(brokenPromises)
      }

      await publish(new TestEvent({ type: TestEvent.types.END_TALLY, suiteId: config.name }))
      const tally = Tally.getSimpleTally()
      await publish(new TestEvent({
        type: TestEvent.types.END,
        time: Date.now(),
        suiteId: config.name,
        totals: tally
      }))

      return {
        files: output.files,
        results: output.results,
        broken: output.broken,
        config: output.config,
        suite: test,
        totals: tally
      }
    }

    const browserRunner = (config, test) => (options) => async () => {
      const output = await findFiles(options).then(runServer(test, options))
      return output
    }

    /**
     * The test library
     * @param {Object} suiteConfig : optional configuration
    */
    function Suite (suiteConfig) {
      const config = makeSuiteConfig(suiteConfig)
      const byMatcher = matcher(config)
      const mapToTests = mapper(config, byMatcher)
      const test = tester(config, mapToTests)
      const findAndRun = nodeRunner(config, test)
      const findAndStart = browserRunner(config, test)

      /**
      // Make a newly configured suite
      */
      // test.Suite = Suite
      test.printSummary = async () => {
        await publish(new TestEvent({
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
        return {
          run: findAndRun(options),
          startServer: findAndStart(options)
        }
      }
      test.reporters = config.reporters
      test.config = config
      test.subscribe = subscribe
      test.dependencies = suiteConfig && suiteConfig.inject
      test.reporterFactory = reporterFactory

      // Suite.suites.push(test)

      return test
    }

    // Suite.suites = []
    return { Suite }
  } // /factory
} // /module
