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
      runTests,
      Tally,
      TestEvent
    } = dependencies

    const makeId = () => `B${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`
    let publishStartAndEnd = true

    const normalizeBatch = async (behaviorOrBatch, sut) => {
      if (typeof behaviorOrBatch === 'object') {
        return Promise.resolve(behaviorOrBatch)
      } else if (typeof behaviorOrBatch === 'string') {
        const t = {}
        t[behaviorOrBatch] = typeof sut === 'function' ? { '': sut } : sut
        return Promise.resolve(t)
      } else if (typeof behaviorOrBatch === 'function') {
        const t = { '': behaviorOrBatch }
        return Promise.resolve(t)
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
      const batchId = makeId()
      const processed = makeBatch(batch)
        .filter(byMatcher)

      return {
        batchId,
        batch: processed,
        tests: processed.map(theory => new AsyncTest(theory, config.makeTheoryConfig(theory), batchId))
      }
    }

    const tester = (mapToTests) => async (behaviorOrBatch, sut) => {
      try {
        const batch = await normalizeBatch(behaviorOrBatch, sut)
        const context = mapToTests(batch)
        const plan = {
          count: context.batch.reduce((count, item) => count + item.assertions.length, 0),
          completed: 0
        }

        if (publishStartAndEnd) {
          await publish({ type: TestEvent.types.START, time: Date.now() })
        }

        await publish({
          type: TestEvent.types.START_BATCH,
          batchId: context.batchId,
          time: Date.now(),
          plan
        })

        const results = await allSettled(context.tests.map((test) => test()))
        const batchTotals = Tally.getTally().batches[context.batchId]

        await publish({
          type: TestEvent.types.END_BATCH,
          batchId: context.batchId,
          time: Date.now(),
          plan: {
            count: plan.count,
            completed: batchTotals.total
          },
          totals: batchTotals
        })

        if (publishStartAndEnd) {
          await publish(new TestEvent({ type: TestEvent.types.END_TALLY }))
          const tally = Tally.getSimpleTally()
          await publish(new TestEvent({
            type: TestEvent.types.END,
            time: Date.now(),
            totals: tally
          }))

          return {
            batchId: context.batchId,
            results: results.map((result) => result.value),
            totals: tally
          }
        }

        return {
          batchId: context.batchId,
          results: results.map((result) => result.value),
          totals: batchTotals
        }
      } catch (e) {
        console.log()
        console.log(e)
        console.log()
        throw e
      }
    }

    const nodeRunner = (test) => (options) => async () => {
      publishStartAndEnd = false
      await publish({ type: TestEvent.types.START, time: Date.now() })
      const runConfig = { ...{ suite: test }, ...options }
      const output = await findFiles(runConfig).then(runTests(runConfig))

      if (output.broken.length) {
        // these tests failed before being executed

        const brokenPromises = output.broken
          .map((result) => publish({
            type: TestEvent.types.TEST,
            status: TestEvent.status.BROKEN,
            behavior: `Failed to load test: ${result.reason && result.reason.filePath}`,
            error: result.reason
          }))

        await allSettled(brokenPromises)
      }

      await publish(new TestEvent({ type: TestEvent.types.END_TALLY }))
      const tally = Tally.getSimpleTally()
      await publish(new TestEvent({
        type: TestEvent.types.END,
        time: Date.now(),
        totals: tally
      }))

      return { ...output, ...{ totals: tally } }
    }

    /**
     * The test library
     * @param {Object} suiteConfig : optional configuration
    */
    function Suite (suiteConfig) {
      const config = makeSuiteConfig(suiteConfig)
      const byMatcher = matcher(config)
      const mapToTests = mapper(config, byMatcher)
      const test = tester(mapToTests)
      const findAndRun = nodeRunner(test)

      /**
      // Make a newly configured suite
      */
      test.Suite = Suite
      test.printSummary = async () => {
        await publish(new TestEvent({
          type: TestEvent.types.END,
          time: Date.now(),
          totals: Tally.getSimpleTally()
        }))
      }
      test.getTotals = () => {
        return Tally.getSimpleTally()
      }
      test.suiteName = config.name
      test.runner = (options) => {
        return {
          run: findAndRun(options)
        }
      }
      test.reporters = config.reporters
      test.config = config
      test.subscribe = subscribe
      test.dependencies = suiteConfig && suiteConfig.inject

      Suite.suites.push(test)

      return test
    }

    Suite.suites = []
    return { Suite }
  } // /factory
} // /module
