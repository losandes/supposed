module.exports = {
  name: 'DefaultReporter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, ConsoleReporter, DefaultFormatter } = dependencies

    function DefaultReporter () {
      const write = ConsoleReporter({
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

      return { write }
    }

    return { DefaultReporter }
  }
}
