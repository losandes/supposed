module.exports = {
  name: 'BriefFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, DefaultFormatter, TestEvent } = dependencies

    function BriefFormatter () {
      const defaultFormat = DefaultFormatter({
        SYMBOLS: {
          PASSED: consoleStyles.green('✓ '), // heavy-check: '✔',
          FAILED: consoleStyles.red('✗ '), // heavy-x '✘',
          BROKEN: consoleStyles.red('!= '), // heavy-x '✘',
          SKIPPED: consoleStyles.yellow('⸕ '),
          INFO: consoleStyles.cyan('# '),
        },
      }).format

      const isFail = (event) => {
        return event.type === TestEvent.types.TEST &&
        (
          event.status === TestEvent.status.FAILED ||
          event.status === TestEvent.status.BROKEN
        )
      }

      const format = (event) => {
        if ([
          TestEvent.types.START,
          TestEvent.types.END,
        ].indexOf(event.type) > -1) {
          return defaultFormat(event)
        } else if (isFail(event)) {
          return defaultFormat(event)
        } else if (event.isDeterministicOutput) {
          let output = event.testEvents.filter(isFail).map(defaultFormat).join('\n')
          output += defaultFormat(event.endEvent)
          return output
        }
      }

      return { format }
    }

    return { BriefFormatter }
  },
}
