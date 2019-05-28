module.exports = function Factory (
  TestEvent,
  DefaultPrinter,
  TapPrinter,
  BriefPrinter,
  QuietPrinter,
  StreamPrinter,
  NyanPrinter,
  DefaultReporter,
  Reporter,
  consoleStyles
) {
  const reporters = {
    BLOCK: 'BLOCK',
    BRIEF: 'BRIEF',
    DEFAULT: 'DEFAULT',
    NYAN: 'NYAN',
    QUIET: 'QUIET',
    QUIET_TAP: 'QUIET_TAP',
    TAP: 'TAP'
  }

  return {
    get: (name) => {
      switch (name) {
        case reporters.NYAN:
          return new DefaultReporter(new NyanPrinter(new StreamPrinter({ tail: '' }), consoleStyles), TestEvent)
        case reporters.TAP:
          return new DefaultReporter(new TapPrinter(new StreamPrinter()), TestEvent)
        case reporters.QUIET_TAP:
          return new DefaultReporter(new TapPrinter(new QuietPrinter(consoleStyles)), TestEvent)
        case reporters.BRIEF:
          return new DefaultReporter(new BriefPrinter(new DefaultPrinter(consoleStyles, {
            passed: consoleStyles.green('✓ '), // heavy-check: '✔',
            failed: consoleStyles.red('✗ '), // heavy-x '✘',
            skipped: consoleStyles.yellow('⸕ '),
            info: consoleStyles.cyan('→ ')
          })), TestEvent)
        case reporters.QUIET:
          return new DefaultReporter(new QuietPrinter(consoleStyles), TestEvent)
        case reporters.BLOCK:
          return new DefaultReporter(new DefaultPrinter(consoleStyles, {
            passed: `${consoleStyles.bgGreen(consoleStyles.black(' PASS '))} `,
            failed: `${consoleStyles.bgRed(consoleStyles.black(' FAIL '))} `,
            skipped: `${consoleStyles.bgYellow(consoleStyles.black(' SKIP '))} `,
            info: `${consoleStyles.bgCyan(consoleStyles.black(' INFO '))} `
          }), TestEvent)
        default:
          return new DefaultReporter(new DefaultPrinter(consoleStyles, {
            passed: consoleStyles.green('✓ '), // heavy-check: '✔',
            failed: consoleStyles.red('✗ '), // heavy-x '✘',
            skipped: consoleStyles.yellow('⸕ '),
            info: consoleStyles.cyan('→ ')
          }), TestEvent)
      }
    },
    make: (reporter) => {
      return new Reporter(reporter)
    },
    types: reporters
  }
}
