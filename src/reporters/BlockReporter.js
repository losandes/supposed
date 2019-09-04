module.exports = {
  name: 'BlockReporter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, ConsoleReporter, DefaultFormatter } = dependencies

    function BlockReporter () {
      const write = ConsoleReporter({
        formatter: DefaultFormatter({
          SYMBOLS: {
            PASSED: `${consoleStyles.bgGreen(consoleStyles.black(' PASS '))} `,
            FAILED: `${consoleStyles.bgRed(consoleStyles.black(' FAIL '))} `,
            BROKEN: `${consoleStyles.bgMagenta(consoleStyles.black(' !!!! '))} `,
            SKIPPED: `${consoleStyles.bgYellow(consoleStyles.black(' SKIP '))} `,
            INFO: `${consoleStyles.bgCyan(consoleStyles.black(' INFO '))} `
          }
        })
      }).write

      return { write }
    }

    return { BlockReporter }
  }
}
