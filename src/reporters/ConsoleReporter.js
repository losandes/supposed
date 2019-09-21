module.exports = {
  name: 'ConsoleReporter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent, formatter, envvars, REPORT_ORDERS } = dependencies
    const { format } = formatter
    const makeOrderId = (event) => `${event.batchId}-${event.testId}`

    const byTestOrder = (order) => (a, b) => {
      let aIdx; let bIdx; let foundCount = 0

      for (let i = 0; i < order.length; i += 1) {
        if (order[i] === makeOrderId(a)) {
          aIdx = i
          foundCount += 1
        } else if (order[i] === makeOrderId(b)) {
          bIdx = i
          foundCount += 1
        }

        if (foundCount === 2) {
          break
        }
      }

      if (aIdx < bIdx) {
        return -1
      }
      if (aIdx > bIdx) {
        return 1
      }
      // a must be equal to b
      return 0
    }

    function ConsoleReporter (options) {
      options = { ...{ reportOrder: REPORT_ORDERS.NON_DETERMINISTIC }, ...envvars, ...options }
      const testOrder = []
      const testEvents = []

      const writeOne = (event) => {
        const line = format(event)

        if (line) {
          console.log(line)
        }
      }

      const write = (event) => {
        if (event.type === TestEvent.types.START) {
          writeOne(event)
        } else if (event.type === TestEvent.types.END) {
          if (options.reportOrder === REPORT_ORDERS.NON_DETERMINISTIC) {
            writeOne(event)
          } else {
            testOrder.push(makeOrderId(event))
            writeOne({
              isDeterministicOutput: true,
              testEvents: testEvents.sort(byTestOrder(testOrder)),
              endEvent: event
            })
          }
        } else if (event.type === TestEvent.types.START_TEST) {
          if (options.reportOrder === REPORT_ORDERS.NON_DETERMINISTIC) {
            writeOne(event)
          } else {
            testOrder.push(makeOrderId(event))
            writeOne(event)
          }
        } else if (event.type === TestEvent.types.TEST) {
          if (options.reportOrder === REPORT_ORDERS.NON_DETERMINISTIC) {
            writeOne(event)
          } else {
            testEvents.push(event)
          }
        }
      } // /write

      return { write }
    }

    return { ConsoleReporter }
  }
}
