module.exports = {
  name: 'DomReporter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent, formatter, envvars, REPORT_ORDERS } = dependencies
    const { format } = formatter
    const reportDivId = 'supposed_report'
    const reportPreId = 'supposed_report_results'
    let reportDiv
    let reportPre

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

    const initDom = () => {
      const _reportDiv = document.getElementById(reportDivId)
      if (_reportDiv) {
        reportDiv = _reportDiv
        reportPre = document.getElementById(reportPreId)
        return
      }

      reportDiv = document.createElement('div')
      reportDiv.setAttribute('id', reportDivId)
      document.body.appendChild(reportDiv)

      reportPre = document.createElement('pre')
      reportPre.setAttribute('id', reportPreId)
      reportDiv.appendChild(reportPre)
    }

    const scrollToBottom = () => {
      if (
        typeof window !== 'undefined' &&
        typeof window.scrollTo === 'function' &&
        typeof document !== 'undefined' &&
        document.body
      ) {
        window.scrollTo(0, document.body.scrollHeight)
      }
    }

    function DomReporter (options) {
      options = { ...{ reportOrder: REPORT_ORDERS.NON_DETERMINISTIC }, ...envvars, ...options }
      const testEvents = []

      initDom()

      const writeOne = (event) => {
        const line = format(event)

        if (!line) {
          return
        }

        // eslint-disable-next-line no-console
        console.log(line)
        reportPre.append(`${line}\n`)
        scrollToBottom()
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
              endEvent: event
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

    return { DomReporter }
  }
}
