module.exports = {
  name: 'Tally',
  factory: (dependencies) => {
    'use strict'

    const { publish, TestEvent } = dependencies

    function TallyFactory () {
      const now = () => Date.now()
      const makeTally = () => {
        return {
          total: 0,
          passed: 0,
          skipped: 0,
          failed: 0,
          broken: 0,
          startTime: -1,
          endTime: -1
        }
      }
      // there's only 1 tally per require
      const totals = {
        total: 0,
        passed: 0,
        skipped: 0,
        failed: 0,
        broken: 0,
        startTime: -1,
        endTime: -1,
        results: [],
        batches: {}
      }

      const makeBatchTally = (event) => {
        if (totals.batches[event.batchId]) {
          return publish({
            type: TestEvent.types.TEST,
            status: TestEvent.status.BROKEN,
            batchId: event.batchId,
            error: new Error('Duplicate Batch Ids were created, or multiple START_BATCH events were emitted for the same batch')
          }).then(() => {
            return undefined
          })
        }

        const tally = makeTally()
        tally.startTime = now()

        return Promise.resolve(tally)
      }

      const bump = (event) => {
        try {
          const name = event.status.toLowerCase()

          totals[name] += 1
          totals.total += 1
          totals.batches[event.batchId][name] += 1
          totals.batches[event.batchId].total += 1
          totals.results.push(event)
        } catch (e) {
          console.log(event)
          console.log(e)
        }
      }

      function Tally () {
        const write = (event) => {
          switch (event.type) {
            case TestEvent.types.START:
              totals.startTime = now()
              return Promise.resolve()
            case TestEvent.types.START_BATCH:
              return makeBatchTally(event)
                .then((tally) => {
                  if (tally) {
                    totals.batches[event.batchId] = tally
                  }
                })
            case TestEvent.types.TEST:
              bump(event)
              return Promise.resolve()
            case TestEvent.types.END_BATCH:
              totals.batches[event.batchId].endTime = now()
              return Promise.resolve()
            case TestEvent.types.END_TALLY:
              totals.endTime = now()
              return Promise.resolve()
          } // /switch
        } // /write

        return { name: 'Tally', write }
      } // /Tally

      Tally.getTally = () => {
        return { ...totals }
      }

      Tally.getSimpleTally = () => {
        const tally = Tally.getTally()

        return {
          total: tally.total,
          passed: tally.passed,
          skipped: tally.skipped,
          failed: tally.failed,
          broken: tally.broken,
          startTime: tally.startTime,
          endTime: tally.endTime
        }
      }

      return { Tally }
    } // /TallyFactory

    return { TallyFactory }
  }
}
