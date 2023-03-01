module.exports = {
  name: 'ConsoleReporter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent, formatter, envvars, REPORT_ORDERS } = dependencies
    const { format } = formatter

    const byPlanOrder = (order) => (eventA, eventB) => {
      const aIdx = order.indexOf(eventA.testId)
      const bIdx = order.indexOf(eventB.testId)

      if (aIdx < bIdx) {
        return -1
      } else if (aIdx > bIdx) {
        return 1
      } else {
        // a must be equal to b
        return 0
      }
    }

    function ConsoleReporter (options) {
      options = { ...{ reportOrder: REPORT_ORDERS.NON_DETERMINISTIC }, ...envvars, ...options }
      const testEvents = []

      const writeOne = (event) => {
        const line = format(event)

        if (line) {
          // eslint-disable-next-line no-console
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
            writeOne({
              isDeterministicOutput: true,
              testEvents: testEvents.sort(byPlanOrder(event.plan.order)),
              endEvent: event,
            })
          }
        } else if (event.type === TestEvent.types.START_TEST) {
          writeOne(event)
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
  },
}
