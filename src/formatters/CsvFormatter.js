module.exports = {
  name: 'CsvFormatter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent } = dependencies
    const SYMBOLS = {
      PASSED: 'PASS',
      FAILED: 'FAIL',
      BROKEN: '!!!!',
      SKIPPED: 'SKIP',
      INFO: 'INFO',
    }
    const COLUMNS = 'STATUS,BEHAVIOR'
    const formatBehavior = (behavior) => {
      return `"${behavior.replace('"', '""')}"`
    }

    function CsvFormatter () {
      const _format = (event) => {
        if (event.type === TestEvent.types.START) {
          return COLUMNS
        } else if (event.type === TestEvent.types.TEST) {
          return `${SYMBOLS[event.status]},${formatBehavior(event.behavior)}`
        }
      }

      const format = (event) => {
        if (event.isDeterministicOutput) {
          return event.testEvents.map(_format).concat([_format(event.endEvent)]).join('\n')
        } else {
          return _format(event)
        }
      } // /format

      return { format }
    }

    return { CsvFormatter }
  },
}
