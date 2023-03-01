module.exports = {
  name: 'ListFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, DefaultFormatter } = dependencies

    function ListFormatter () {
      return DefaultFormatter({
        SYMBOLS: {
          PASSED: consoleStyles.green('✓ '), // heavy-check: '✔',
          FAILED: consoleStyles.red('✗ '), // heavy-x '✘',
          BROKEN: consoleStyles.red('!= '), // heavy-x '✘',
          SKIPPED: consoleStyles.yellow('⸕ '),
          INFO: consoleStyles.cyan('# '),
        },
      })
    }

    return { ListFormatter }
  },
}
