module.exports = {
  name: 'BriefReporter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, ConsoleReporter, DefaultFormatter, TestEvent } = dependencies

    function BriefReporter () {
      const _write = ConsoleReporter({
        formatter: DefaultFormatter({
          SYMBOLS: {
            PASSED: consoleStyles.green('✓ '), // heavy-check: '✔',
            FAILED: consoleStyles.red('✗ '), // heavy-x '✘',
            BROKEN: consoleStyles.red('!= '), // heavy-x '✘',
            SKIPPED: consoleStyles.yellow('⸕ '),
            INFO: consoleStyles.cyan('→ ')
          }
        })
      }).write

      const write = (event) => {
        if ([
          TestEvent.types.START,
          TestEvent.types.END
        ].indexOf(event.type) > -1) {
          _write(event)
        } else if (
          event.type === TestEvent.types.TEST &&
          (
            event.status === TestEvent.status.FAILED ||
            event.status === TestEvent.status.BROKEN
          )
        ) {
          _write(event)
        }
      }

      return { write }
    }

    return { BriefReporter }
  }
}
