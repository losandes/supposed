module.exports = {
  name: 'BlockFormatter',
  factory: (dependencies) => {
    'use strict'

    const { consoleStyles, DefaultFormatter } = dependencies

    function BlockFormatter () {
      return DefaultFormatter({
        SYMBOLS: {
          PASSED: `${consoleStyles.bgGreen(consoleStyles.black(' PASS '))} `,
          FAILED: `${consoleStyles.bgRed(consoleStyles.black(' FAIL '))} `,
          BROKEN: `${consoleStyles.bgMagenta(consoleStyles.black(' !!!! '))} `,
          SKIPPED: `${consoleStyles.bgYellow(consoleStyles.black(' SKIP '))} `,
          INFO: `${consoleStyles.bgCyan(consoleStyles.black(' INFO '))} `
        }
      })
    }

    return { BlockFormatter }
  }
}
