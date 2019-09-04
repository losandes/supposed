module.exports = {
  name: 'tally',
  factory: (dependencies) => {
    'use strict'

    const { publish, TestEvent } = dependencies
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

    const makeBatchTally = async (event) => {
      if (totals.batches[event.batchId]) {
        await publish({
          type: TestEvent.types.BROKEN,
          batchId: event.batchId,
          error: new Error('Duplicate Batch Ids were created, or multiple START_BATCH events were emitted for the same batch')
        })

        return
      }

      const tally = makeTally()
      tally.startTime = now()

      return tally
    }

    const bump = (event) => {
      const name = event.status.toLowerCase()

      totals[name] += 1
      totals.total += 1
      totals.batches[event.batchId][name] += 1
      totals.batches[event.batchId].total += 1
      totals.results.push(event)
    }

    function Tally () {
      const write = async (event) => {
        switch (event.type) {
          case TestEvent.types.START:
            totals.startTime = now()
            break
          case TestEvent.types.START_BATCH:
            totals.batches[event.batchId] = await makeBatchTally(event)
            break
          case TestEvent.types.TEST:
            bump(event)
            break
          case TestEvent.types.END_BATCH:
            totals.batches[event.batchId].endTime = now()
            break
          case TestEvent.types.END_TALLY:
            totals.endTime = now()
            break
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
  }
}
