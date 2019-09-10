module.exports = {
  name: 'SummaryFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, DefaultFormatter, TestEvent } = dependencies

    function SummaryFormatter () {
      const defaultFormat = DefaultFormatter({
        // Other than INFO, these aren't actually used, since this doesn't produce TEST output
        SYMBOLS: {
          PASSED: consoleStyles.green('✓ '),
          FAILED: consoleStyles.red('✗ '),
          BROKEN: consoleStyles.red('!= '),
          SKIPPED: consoleStyles.yellow('⸕ '),
          INFO: consoleStyles.cyan('# ') // the `#` is important for TAP compliance
        }
      }).format

      const format = (event) => {
        if (event.type === TestEvent.types.END) {
          return defaultFormat(event)
        }
      }

      return { format }
    }

    return { SummaryFormatter }
  }
}
